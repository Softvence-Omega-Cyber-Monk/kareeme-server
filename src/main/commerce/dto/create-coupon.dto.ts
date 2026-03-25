import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CouponType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export class CreateCouponDto {
  @ApiProperty({
    example: 'EID50',
    description: 'Unique coupon code',
  })
  @IsString()
  code: string;

  @ApiProperty({
    enum: CouponType,
    example: 'PERCENT',
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({
    example: 50,
    description: 'Discount value (percentage or fixed amount)',
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Is coupon active or not',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiry date of coupon',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}