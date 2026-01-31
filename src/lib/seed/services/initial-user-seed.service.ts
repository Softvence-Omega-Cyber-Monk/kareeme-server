import { ENVEnum } from '@/common/enum/env.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { AuthUtilsService } from '@/lib/utils/services/auth-utils.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma';

@Injectable()
export class InitialUserSeedService {
  private readonly logger = new Logger(InitialUserSeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authUtils: AuthUtilsService,
    private readonly configService: ConfigService,
  ) {}

  async seedInitialUsers(): Promise<void> {
    const users = [
      {
        email: this.configService.get<string>(ENVEnum.SUPER_ADMIN_EMAIL),
        password: this.configService.get<string>(ENVEnum.SUPER_ADMIN_PASS),
        role: UserRole.SUPER_ADMIN,
        name: 'Super Admin',
      },
      {
        email: this.configService.get<string>(ENVEnum.ADMIN_EMAIL),
        password: this.configService.get<string>(ENVEnum.ADMIN_PASS),
        role: UserRole.ADMIN,
        name: 'System Admin',
      },
      {
        email: this.configService.get<string>(ENVEnum.DISTRIBUTOR_EMAIL),
        password: this.configService.get<string>(ENVEnum.DISTRIBUTOR_PASS),
        role: UserRole.DISTRIBUTOR,
        name: 'System Distributor',
      },
      {
        email: this.configService.get<string>(ENVEnum.ACCOUNTANT_EMAIL),
        password: this.configService.get<string>(ENVEnum.ACCOUNTANT_PASS),
        role: UserRole.ACCOUNTANT,
        name: 'System Accountant',
      },
    ];

    for (const user of users) {
      if (!user.email || !user.password) {
        this.logger.warn(
          `Skipping seed for role ${user.role}: Email or Password not found in env`,
        );
        continue;
      }

      this.logger.debug(
        `Seeding ${user.role}: email="${user.email}", passLength=${user.password?.length}`,
      );

      const hashedPassword = await this.authUtils.hash(user.password.trim());

      await this.prisma.user.upsert({
        where: { email: user.email },
        update: {
          password: hashedPassword,
          role: user.role,
          isVerified: true,
          lastActiveAt: new Date(),
          lastLoginAt: new Date(),
        },
        create: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          isVerified: true,
          lastActiveAt: new Date(),
          lastLoginAt: new Date(),
        },
      });

      this.logger.log(`[UPSERT] ${user.role} user seeded: ${user.email}`);
    }
  }
}
