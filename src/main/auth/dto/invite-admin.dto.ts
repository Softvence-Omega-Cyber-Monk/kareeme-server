import { UserEnum } from '@/common/enum/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class InviteAdminDto {
  @ApiProperty({
    example: 'admin@kareeme.com',
    description: 'Email address of the new admin',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John admin',
    description: 'Name of the new admin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: UserEnum.ADMIN,
    description: 'Role of the new admin',
    enum: UserEnum,
  })
  @IsEnum(UserEnum)
  @IsNotEmpty()
  role: UserEnum;
}
