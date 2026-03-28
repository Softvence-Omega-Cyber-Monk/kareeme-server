import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
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

    const subtotalAmount = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.trim().toUpperCase() },
      });

      if (!coupon) {
        throw new BadRequestException('Coupon not found');
      }

      if (!coupon.isActive) {
        throw new BadRequestException('Coupon is inactive');
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new BadRequestException('Coupon expired');
      }

      if (coupon.type === 'PERCENT') {
        discountAmount = (subtotalAmount * coupon.value) / 100;
      } else {
        discountAmount = coupon.value;
      }

      if (discountAmount > subtotalAmount) {
        discountAmount = subtotalAmount;
      }

      appliedCouponCode = coupon.code;
    }

    const totalAmount = subtotalAmount - discountAmount;
    const amountInSmallestUnit = Math.round(totalAmount * 100);

    const order = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        status: 'PENDING',
        fullName: dto.fullName,
        phone: dto.phone,
        addressLine: dto.addressLine,
        city: dto.city,
        postalCode: dto.postalCode,
        subtotalAmount,
        discountAmount,
        couponCode: appliedCouponCode,
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

    const paymentIntent = await this.stripeService.client.paymentIntents.create(
      {
        amount: amountInSmallestUnit,
        currency: process.env.STRIPE_CURRENCY || 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: order.id,
          userId: dto.userId,
          couponCode: appliedCouponCode ?? '',
        },
      },
    );

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        status: 'Submitted',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return {
      message: 'PaymentIntent created successfully',
      orderId: order.id,
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subtotalAmount,
      discountAmount,
      totalAmount,
      couponCode: appliedCouponCode,
      currency: process.env.STRIPE_CURRENCY || 'usd',
    };
  }

  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this.markPaymentSucceeded(paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await this.markPaymentFailed(paymentIntent.id);
        break;
      }

      default:
        break;
    }

    return { received: true };
  }

  private async markPaymentSucceeded(paymentIntentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!payment) return;

    // idempotency: already paid, ignore duplicate webhook deliveries
    if (payment.status === 'Paid' && payment.order.status === 'PAID') {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'Paid' },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });

      for (const item of payment.order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      const cart = await tx.cart.findUnique({
        where: { userId: payment.order.userId },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    });
  }

  private async markPaymentFailed(paymentIntentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'Failed' },
    });
  }
}
