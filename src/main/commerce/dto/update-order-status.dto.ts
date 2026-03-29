import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}