import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    example: 'EID25',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
