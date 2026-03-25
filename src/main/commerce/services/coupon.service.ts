import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { CreateCouponDto, CouponType } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });

    if (existingCoupon) {
      throw new BadRequestException('Coupon code already exists');
    }

    if (dto.type === CouponType.PERCENT && dto.value > 100) {
      throw new BadRequestException(
        'Percent coupon value cannot be greater than 100',
      );
    }

    return this.prisma.coupon.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        type: dto.type,
        value: dto.value,
        isActive: dto.isActive ?? true,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async findAll(query: QueryCouponDto) {
    const where: any = {};

    if (query.search) {
      where.code = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    return this.prisma.coupon.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);

    if (dto.code) {
      const existingCoupon = await this.prisma.coupon.findFirst({
        where: {
          code: dto.code.trim().toUpperCase(),
          NOT: { id },
        },
      });

      if (existingCoupon) {
        throw new BadRequestException('Coupon code already exists');
      }
    }

    if (dto.type === CouponType.PERCENT && dto.value && dto.value > 100) {
      throw new BadRequestException(
        'Percent coupon value cannot be greater than 100',
      );
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}),
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.value !== undefined ? { value: dto.value } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.expiresAt !== undefined
          ? { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  async validateCoupon(code: string, userId: string, cartTotal: number) {
  const coupon = await this.prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    throw new BadRequestException('Invalid coupon');
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new BadRequestException('Coupon expired');
  }

  let discount = 0;

  if (coupon.type === 'PERCENT') {
    discount = (cartTotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  if (discount > cartTotal) {
    discount = cartTotal;
  }

  const finalAmount = cartTotal - discount;

  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
    finalAmount,
  };
}
}