import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ClientRole {
  Artist = 'Artist',
  Label = 'Label',
  Manager = 'Manager',
  Producer = 'Producer',
}

export class CreateClientDto {
  @ApiProperty({
    example: 'Gemini Chachi',
    description: 'Client name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'artist@example.com',
    description: 'Client email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    enum: ClientRole,
    example: ClientRole.Artist,
    description: 'Client role',
  })
  @IsEnum(ClientRole)
  @IsNotEmpty()
  role: ClientRole;
}

export class ClientResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  clientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  distributorId: string;

  @ApiProperty({ type: Object })
  user: any;

  @ApiProperty({ enum: ClientRole })
  role: ClientRole;

  @ApiPropertyOptional({ example: '+1234567890' })
  phoneNumber?: string;

  @ApiProperty({ example: 5 })
  totalReleases: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'OTP123' })
  oneTimePassword?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
