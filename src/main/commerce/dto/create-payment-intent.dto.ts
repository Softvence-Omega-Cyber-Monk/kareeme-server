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

  @ApiProperty({ example: 'Arif Rahman' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '01700000000' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'House 12, Road 5' })
  @IsString()
  addressLine: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  city: string;

  @ApiProperty({ example: '1207' })
  @IsString()
  postalCode: string;
}
