import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { DistributionPlatform } from '@prisma';

@Injectable()
export class GlobalSettingsService {
  private readonly logger = new Logger(GlobalSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedGlobalSettings(): Promise<void> {
    const existing = await this.prisma.globalSettings.findFirst();

    if (!existing) {
      await this.prisma.globalSettings.create({
        data: {
          emailNotificationsOn: true,
          smsNotificationsOn: false,
          pushNotificationsOn: false,
          tfaOn: false,
          passwordPolicyOn: false,
          ipBlockList: [],
          autoDistributionOn: true,
          defaultDistributionPlatforms: [DistributionPlatform.All],
        },
      });
      this.logger.log('[CREATE] Global settings seeded');
    } else {
      // Potentially update it to ensure defaults if needed, but for now just log
      this.logger.log('[SKIP] Global settings already exist');
    }
  }
}
