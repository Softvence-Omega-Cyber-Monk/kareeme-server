import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OtpType } from '@prisma';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    example: 'john@gmail.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    example: OtpType.VERIFICATION,
    description: 'OTP type',
    enum: OtpType,
  })
  @IsNotEmpty()
  @IsEnum(OtpType)
  type: OtpType = OtpType.VERIFICATION;
}

export class VerifyOTPDto {
  @ApiProperty({
    example: '1234',
    description: 'OTP code',
  })
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: OtpType.VERIFICATION,
    description: 'OTP type',
    enum: OtpType,
  })
  @IsNotEmpty()
  @IsEnum(OtpType)
  type: OtpType;
}
