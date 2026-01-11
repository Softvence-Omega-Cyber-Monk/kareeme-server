import { PaginationDto } from '@/common/dto/pagination.dto';
import { ValidateAdmin, ValidateSuperAdmin } from '@/core/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleDto } from '../dto/admin-role.dto';
import { InviteAdminDto } from '../dto/invite-admin.dto';
import { AuthAdminService } from '../services/auth-admin.service';

@ApiTags('Auth Admin')
@Controller('auth/admin')
@ValidateSuperAdmin()
@ApiBearerAuth()
export class AuthAdminController {
  constructor(private readonly authAdminService: AuthAdminService) {}

  @ApiOperation({ summary: 'Get Team' })
  @Get('team')
  @ValidateAdmin()
  async getAdmins(@Query() query: PaginationDto) {
    return this.authAdminService.getAdmins(query);
  }

  @ApiOperation({ summary: 'Get single admin' })
  @Get(':id')
  @ValidateAdmin()
  async getAdmin(@Param('id') id: string) {
    return this.authAdminService.getAdmin(id);
  }

  @ApiOperation({ summary: 'Invite new admin user' })
  @Post('invite')
  @ValidateSuperAdmin()
  async inviteAdmin(@Body() dto: InviteAdminDto) {
    return this.authAdminService.inviteAdmin(dto);
  }

  @ApiOperation({ summary: 'Change user role' })
  @Patch(':id/role')
  @ValidateSuperAdmin()
  async changeRole(@Param('id') id: string, @Body() dto: AdminRoleDto) {
    return this.authAdminService.changeRole(id, dto);
  }

  @ApiOperation({ summary: 'Delete admin user' })
  @Delete(':id')
  @ValidateSuperAdmin()
  async deleteAdmin(@Param('id') id: string) {
    return this.authAdminService.deleteAdmin(id);
  }
}
