import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HandleError } from '@/core/error/handle-error.decorator';
import { AppError } from '@/core/error/handle-error.app';
import { successResponse, TResponse } from '@/common/utils/response.util';
import {
  UpdateAccountantSettingsDto,
  AccountantSettingsResponseDto,
  ChangePasswordDto,
} from '../dto/accountant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountantSettingsService {
  private readonly logger = new Logger(AccountantSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get settings', 'AccountantSettings')
  async getSettings(
    userId: string,
  ): Promise<TResponse<AccountantSettingsResponseDto>> {
    let settings = await this.prisma.accountantSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.accountantSettings.create({
        data: { userId },
      });
    }

    return successResponse(settings as any, 'Settings fetched successfully');
  }

  @HandleError('Failed to update settings', 'AccountantSettings')
  async updateSettings(
    userId: string,
    dto: UpdateAccountantSettingsDto,
  ): Promise<TResponse<AccountantSettingsResponseDto>> {
    const settings = await this.prisma.accountantSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });

    this.logger.log(`Settings updated for user: ${userId}`);

    return successResponse(settings as any, 'Settings updated successfully');
  }

  @HandleError('Failed to change password', 'AccountantSettings')
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<TResponse<any>> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.password) {
      throw new AppError(HttpStatus.NOT_FOUND, 'User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isValid) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        'Current password is incorrect',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    this.logger.log(`Password changed for user: ${userId}`);

    return successResponse({}, 'Password changed successfully');
  }

  @HandleError('Failed to upload photo', 'AccountantSettings')
  async uploadPhoto(
    userId: string,
    photoUrl: string,
  ): Promise<TResponse<any>> {
    await this.prisma.accountantSettings.upsert({
      where: { userId },
      create: { userId, profilePhoto: photoUrl },
      update: { profilePhoto: photoUrl },
    });

    return successResponse({ photoUrl }, 'Photo uploaded successfully');
  }
}
