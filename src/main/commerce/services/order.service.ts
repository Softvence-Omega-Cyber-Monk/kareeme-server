import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GetOrdersQueryDto } from '../dto/get-order-query.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderStatus } from '@prisma';


@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllOrders(query: GetOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const status = query.status;

    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                id: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                fullName: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                user: {
                  name: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
              {
                user: {
                  email: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
              {
                phone: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              stripePaymentIntentId: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      message: 'Orders retrieved successfully',
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: orders,
    };
  }

  async getOrdersByUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'User orders retrieved successfully',
      data: orders,
    };
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    if (
      dto.status === OrderStatus.PROCESSING &&
      existingOrder.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('Cancelled order cannot be processed');
    }

    if (
      dto.status === OrderStatus.SHIPPED &&
      existingOrder.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException('Only processing orders can be shipped');
    }

    if (
      dto.status === OrderStatus.DELIVERED &&
      existingOrder.status !== OrderStatus.SHIPPED
    ) {
      throw new BadRequestException('Only shipped orders can be delivered');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
      },
    });

    return {
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    };
  }
}