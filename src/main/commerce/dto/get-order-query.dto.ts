import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetOrdersQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}