import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto, RefreshTokenDto } from '../dto/logout.dto';
import { ResendOtpDto, VerifyOTPDto } from '../dto/otp.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/password.dto';
import { RegisterDto } from '../dto/register.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AuthGetProfileService } from '../services/auth-get-profile.service';
import { AuthLoginService } from '../services/auth-login.service';
import { AuthLogoutService } from '../services/auth-logout.service';
import { AuthOtpService } from '../services/auth-otp.service';
import { AuthPasswordService } from '../services/auth-password.service';
import { AuthRegisterService } from '../services/auth-register.service';
import { AuthUpdateProfileService } from '../services/auth-update-profile.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authRegisterService: AuthRegisterService,
    private readonly authLoginService: AuthLoginService,
    private readonly authLogoutService: AuthLogoutService,
    private readonly authOtpService: AuthOtpService,
    private readonly authPasswordService: AuthPasswordService,
    private readonly authGetProfileService: AuthGetProfileService,
    private readonly authUpdateProfileService: AuthUpdateProfileService,
  ) {}

  @ApiOperation({ summary: 'User Registration with Email' })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authRegisterService.register(body);
  }

  @ApiOperation({
    summary: 'Verify OTP',
    description:
      'Verify OTP for different flows: VERIFICATION (email verification after registration), TFA_LOGIN (complete login with 2FA), TFA_ENABLE (enable 2FA), or RESET (password reset verification)',
  })
  @Post('verify-otp')
  async verifyOtp(
    @Body() body: VerifyOTPDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authOtpService.verifyOTP(body, req);

    if (result.data?.token?.accessToken && result.data?.token?.refreshToken) {
      this.setCookies(
        res,
        result.data.token.accessToken,
        result.data.token.refreshToken,
      );
    }

    return result;
  }

  @ApiOperation({
    summary: 'Request OTP',
    description:
      'Request OTP code for any flow: VERIFICATION, TFA_LOGIN, TFA_ENABLE, or RESET',
  })
  @Post('request-otp')
  async resendOtp(@Body() body: ResendOtpDto) {
    return this.authOtpService.resendOtp(body);
  }

  @ApiOperation({ summary: 'User Login' })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authLoginService.login(body, req);

    if (result.data?.tokens?.accessToken && result.data?.tokens?.refreshToken) {
      this.setCookies(
        res,
        result.data.tokens.accessToken,
        result.data.tokens.refreshToken,
      );
    }

    return result;
  }

  @ApiOperation({ summary: 'User Logout' })
  @ApiBearerAuth()
  @Post('logout')
  @ValidateAuth()
  async logOut(
    @GetUser('sub') userId: string,
    @Body() dto: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return this.authLogoutService.logout(userId, dto);
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authLogoutService.refresh(dto);

    if (result.data?.accessToken && result.data?.refreshToken) {
      this.setCookies(res, result.data.accessToken, result.data.refreshToken);
    }

    return result;
  }

  @ApiOperation({ summary: 'Change Password' })
  @ApiBearerAuth()
  @Post('password/change')
  @ValidateAuth()
  async changePassword(
    @GetUser('sub') userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authPasswordService.changePassword(userId, body);
  }

  @ApiOperation({ summary: 'Forgot Password' })
  @Post('password/forgot')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authPasswordService.forgotPassword(body.email);
  }

  @ApiOperation({ summary: 'Reset Password' })
  @Post('password/reset')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authPasswordService.resetPassword(body);
  }

  @ApiOperation({ summary: 'Get User Profile' })
  @ApiBearerAuth()
  @Get('me')
  @ValidateAuth()
  async getProfile(@GetUser('sub') userId: string) {
    return this.authGetProfileService.getProfile(userId);
  }

  @ApiOperation({ summary: 'Update profile' })
  @ApiBearerAuth()
  @Patch()
  @ValidateAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @GetUser('sub') id: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authUpdateProfileService.updateProfile(id, dto, file);
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use lax for better compatibility
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  }
}
