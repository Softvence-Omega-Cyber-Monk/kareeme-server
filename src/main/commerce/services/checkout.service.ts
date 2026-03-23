import { PrismaService } from '@/lib/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CheckoutDto } from '../dto/checkout.dto';
import { OrderStatus, PaymentStatus } from '@prisma';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(dto: CheckoutDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: dto.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new BadRequestException(
          `Product is inactive: ${item.product.name}`,
        );
      }

      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}`,
        );
      }
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const fakePaymentSuccess = dto.fakePaymentStatus !== 'Failed';

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: dto.userId,
          status: fakePaymentSuccess ? OrderStatus.PAID : OrderStatus.PENDING,
          totalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          status: fakePaymentSuccess
            ? PaymentStatus.Paid
            : PaymentStatus.Failed,
          stripePaymentIntentId: `fake_pi_${Date.now()}`,
        },
      });

      if (fakePaymentSuccess) {
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      return {
        message: fakePaymentSuccess
          ? 'Checkout completed successfully'
          : 'Payment failed',
        order,
        payment,
      };
    });
  }
}