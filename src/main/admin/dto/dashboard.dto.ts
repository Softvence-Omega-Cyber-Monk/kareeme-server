import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 128 })
  totalClients: number;

  @ApiProperty({ example: 1254 })
  totalReleases: number;

  @ApiProperty({ example: 43 })
  activeSubmissions: number;

  @ApiProperty({ example: '856000' })
  totalRevenue: string;

  @ApiProperty({ example: 12 })
  clientsGrowth: number;

  @ApiProperty({ example: 8 })
  releasesGrowth: number;

  @ApiProperty({ example: -3 })
  submissionsGrowth: number;

  @ApiProperty({ example: 17 })
  revenueGrowth: number;
}

export class RevenueDataPoint {
  @ApiProperty()
  month: string;

  @ApiProperty()
  value: number;
}

export class ProfitLossDataPoint {
  @ApiProperty()
  month: string;

  @ApiProperty()
  profit: number;

  @ApiProperty()
  loss: number;
}

export class RecentActivityDto {
  @ApiProperty()
  activityId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  timestamp: string;

  @ApiPropertyOptional()
  metadata?: any;
}

export class DashboardResponseDto {
  @ApiProperty()
  stats: DashboardStatsDto;

  @ApiProperty({ type: [RevenueDataPoint] })
  revenueData: RevenueDataPoint[];

  @ApiProperty({ type: [ProfitLossDataPoint] })
  profitLossData: ProfitLossDataPoint[];

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivity: RecentActivityDto[];
}
