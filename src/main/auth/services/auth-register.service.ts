import { successResponse, TResponse } from '@/common/utils/response.util';
import { AppError } from '@/core/error/handle-error.app';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { AuthUtilsService } from '@/lib/utils/services/auth-utils.service';
import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthRegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: AuthUtilsService,
  ) {}

  @HandleError('Registration failed', 'User')
  async register(dto: RegisterDto): Promise<TResponse<any>> {
    const { email, password, name, phone } = dto;

    // Check if user email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new AppError(400, 'User already exists with this email');
    }

    // Check if phone number already exists
    const normalizedPhone = phone.replace(/\s+/g, '').replace('+', '');
    const existingPhoneUser = await this.prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });
    if (existingPhoneUser) {
      throw new AppError(400, 'User already exists with this phone number');
    }

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        name,
        phone: normalizedPhone,
        password: await this.utils.hash(password),
        clientSettings: { create: {} },
        notificationSettings: { create: {} },
      },
    });

    // Return sanitized response
    return successResponse(
      {
        email: newUser.email,
      },
      `Registration successful for ${newUser.email}. Please Login.`,
    );
  }
}