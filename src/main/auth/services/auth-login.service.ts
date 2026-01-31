import { successResponse, TResponse } from '@/common/utils/response.util';
import { AppError } from '@/core/error/handle-error.app';
import { HandleError } from '@/core/error/handle-error.decorator';
import { AuthMailService } from '@/lib/mail/services/auth-mail.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { AuthUtilsService } from '@/lib/utils/services/auth-utils.service';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthLoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authMailService: AuthMailService,
    private readonly utils: AuthUtilsService,
  ) {}

  @HandleError('Login failed', 'User')
  async login(dto: LoginDto, req: Request): Promise<TResponse<any>> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email },
    });

    const isPasswordCorrect = await this.utils.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError(400, 'Invalid password');
    }

    // Capture device info
    const deviceId = await this.utils.handleDeviceTracking(user.id, req);

    // Two scenarios:
    // 1. If TFA is enabled, send OTP for verification
    if (user.isTFAEnabled) {
      const otp = await this.utils.generateOTPAndSave(user.id, 'TFA_LOGIN');

      await this.authMailService.sendVerificationCodeEmail(
        user.email,
        otp.toString(),
        'TFA_LOGIN',
        {
          subject: 'Two-Factor Authentication Code',
          message: 'Please enter this code to complete your login.',
        },
      );

      return successResponse(
        { email: user.email, requiresTFA: true },
        'TFA is enabled. A verification OTP has been sent to your email.',
      );
    }

    // 2. Regular login
    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    // 3. Generate token
    const token = await this.utils.generateTokenPairAndSave(
      {
        email,
        role: updatedUser.role,
        sub: updatedUser.id,
      },
      deviceId,
    );

    return successResponse(
      {
        user: await this.utils.sanitizeUser(updatedUser),
        token: token,
        access_token: token.accessToken,
        refresh_token: token.refreshToken,
      },
      'Logged in successfully',
    );
  }
}