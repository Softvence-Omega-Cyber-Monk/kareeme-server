import { UserEnum } from '@/common/enum/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class AdminRoleDto {
  @ApiProperty({
    example: UserEnum.ADMIN,
    description: 'New role for the admin user',
    enum: UserEnum,
  })
  @IsEnum(UserEnum)
  @IsNotEmpty()
  role: UserEnum;
}
