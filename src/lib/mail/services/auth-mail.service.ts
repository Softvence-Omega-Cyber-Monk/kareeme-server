import { ENVEnum } from '@/common/enum/env.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as he from 'he';
import * as nodemailer from 'nodemailer';
import { MailService } from '../mail.service';
import { adminInvitationTemplate } from '../templates/admin-invite.template';
import { otpTemplate } from '../templates/otp.template';
import { passwordResetConfirmationTemplate } from '../templates/reset-password-confirm.template';

interface EmailOptions {
  subject?: string;
  message?: string;
}

@Injectable()
export class AuthMailService {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<nodemailer.SentMessageInfo> {
    return this.mailService.sendMail({ to, subject, html, text });
  }

  private sanitize(input: string) {
    return he.encode(input);
  }

  async sendVerificationCodeEmail(
    to: string,
    code: string,
    type: string,
    options: EmailOptions = {},
  ): Promise<nodemailer.SentMessageInfo> {
    const link = `${this.configService.getOrThrow(
      ENVEnum.FRONTEND_URL,
    )}/verify?otp=${encodeURIComponent(code)}&email=${encodeURIComponent(
      to,
    )}&type=${encodeURIComponent(type)}`;

    const safeLink = this.sanitize(link);

    const message = this.sanitize(options.message || 'Verify your account');
    const safeCode = this.sanitize(code);
    const subject = options.subject || 'Verification Code';

    return this.sendEmail(
      to,
      subject,
      otpTemplate({
        title: '🔑 Verify Your Account',
        message,
        code: safeCode,
        link: safeLink,
        footer:
          'If you didn’t request this code, you can safely ignore this email.',
      }),
      `${message}\nYour verification code: ${code}\nVerify here: ${link}`,
    );
  }

  async sendResetPasswordCodeEmail(
    to: string,
    code: string,
    type: string,
    options: EmailOptions = {},
  ): Promise<nodemailer.SentMessageInfo> {
    const link = `${this.configService.getOrThrow(
      ENVEnum.FRONTEND_URL,
    )}/reset?otp=${encodeURIComponent(code)}&email=${encodeURIComponent(
      to,
    )}&type=${encodeURIComponent(type)}`;

    const safeLink = this.sanitize(link);

    const message = this.sanitize(options.message || 'Password Reset Request');
    const safeCode = this.sanitize(code);
    const subject = options.subject || 'Password Reset Code';

    return this.sendEmail(
      to,
      subject,
      otpTemplate({
        title: '🔒 Password Reset Request',
        message,
        code: safeCode,
        link: safeLink,
        footer:
          'If you didn’t request a password reset, you can safely ignore this email.',
      }),
      `${message}\nYour password reset code: ${code}\nLink: ${link}\n\nIf you did not request this, please ignore this email.`,
    );
  }

  async sendPasswordResetConfirmationEmail(
    to: string,
    options: EmailOptions = {},
  ): Promise<nodemailer.SentMessageInfo> {
    const message = this.sanitize(
      options.message || 'Password Reset Confirmation',
    );
    const subject = options.subject || 'Password Reset Confirmation';

    return this.sendEmail(
      to,
      subject,
      passwordResetConfirmationTemplate(message),
      message,
    );
  }

  async sendTFACodeEmail(
    to: string,
    code: string,
    type: string,
    options: EmailOptions = {},
  ): Promise<nodemailer.SentMessageInfo> {
    const link = `${this.configService.getOrThrow(
      ENVEnum.FRONTEND_URL,
    )}/verify?otp=${encodeURIComponent(code)}&email=${encodeURIComponent(
      to,
    )}&type=${encodeURIComponent(type)}`;

    const safeLink = this.sanitize(link);

    const message = this.sanitize(
      options.message || 'Enable Two-Factor Authentication',
    );
    const safeCode = this.sanitize(code);
    const subject = options.subject || 'Enable Two-Factor Authentication';

    return this.sendEmail(
      to,
      subject,
      otpTemplate({
        title: '🔐 Enable Two-Factor Authentication',
        message,
        code: safeCode,
        link: safeLink,
        footer:
          "If you didn't request to enable TFA, please contact support immediately.",
      }),
      `${message}\nYour TFA enablement code: ${code}\nVerify here: ${link}`,
    );
  }

  async sendAdminInvitationEmail(
    to: string,
    name: string,
    password: string,
    options: EmailOptions = {},
  ): Promise<nodemailer.SentMessageInfo> {
    const link = this.configService.getOrThrow(ENVEnum.FRONTEND_URL);
    const safeLink = this.sanitize(link);

    const message = this.sanitize(
      options.message || 'You have been invited to join the team.',
    );
    const subject = options.subject || 'Admin Invitation';

    return this.sendEmail(
      to,
      subject,
      adminInvitationTemplate(
        this.sanitize(name),
        this.sanitize(to),
        this.sanitize(password),
        safeLink,
      ),
      `${message}\nEmail: ${to}\nPassword: ${password}\nLogin here: ${link}`,
    );
  }
}
