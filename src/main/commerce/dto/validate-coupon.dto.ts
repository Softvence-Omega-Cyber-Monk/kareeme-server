import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCouponDto {
  @ApiProperty({
    example: 'EID50',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'user-id-123',
  })
  @IsString()
  userId: string;
}