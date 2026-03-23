// import { ApiProperty } from '@nestjs/swagger';
// import { IsIn, IsString } from 'class-validator';

// export class CheckoutDto {
//   @ApiProperty()
//   @IsString()
//   userId: string;

//   @ApiProperty({ default: 'FAKE' })
//   @IsString()
//   @IsIn(['FAKE'])
//   paymentMethod: string;
// }


import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ default: 'FAKE' })
  @IsString()
  @IsIn(['FAKE'])
  paymentMethod: string;

  @ApiProperty({ required: false, default: 'Paid' })
  @IsOptional()
  @IsIn(['Paid', 'Failed'])
  fakePaymentStatus?: 'Paid' | 'Failed';
}