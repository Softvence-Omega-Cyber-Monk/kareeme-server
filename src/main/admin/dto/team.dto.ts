import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum TeamMemberRole {
  Admin = 'Admin',
  Distributor = 'Distributor',
  Accountant = 'Accountant',
  Manager = 'Manager',
}

export enum TeamMemberStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
}

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Marvin McKinney' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'marvin@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: TeamMemberRole, example: TeamMemberRole.Distributor })
  @IsEnum(TeamMemberRole)
  @IsNotEmpty()
  role: TeamMemberRole;
}

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ enum: TeamMemberRole })
  @IsOptional()
  @IsEnum(TeamMemberRole)
  role?: TeamMemberRole;

  @ApiPropertyOptional({ enum: TeamMemberStatus })
  @IsOptional()
  @IsEnum(TeamMemberStatus)
  status?: TeamMemberStatus;
}

export class TeamMemberResponseDto {
  @ApiProperty()
  memberId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: TeamMemberRole })
  role: TeamMemberRole;

  @ApiProperty({ enum: TeamMemberStatus })
  status: TeamMemberStatus;

  @ApiProperty()
  joinDate: Date;

  @ApiProperty()
  createdAt: Date;
}
