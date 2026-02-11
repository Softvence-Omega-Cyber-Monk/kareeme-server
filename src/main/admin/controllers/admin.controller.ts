import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import { DashboardService } from '../services/dashboard.service';
import { DashboardResponseDto } from '../dto/dashboard.dto';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Admin - Dashboard')
@Controller('admin')
export class AdminController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get admin dashboard',
    description:
      'Get complete dashboard with stats, revenue data, profit/loss charts, and recent activity',
  })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @Post('stats/update')
  @ApiOperation({
    summary: 'Manually update dashboard stats',
    description: 'Trigger manual update of dashboard statistics',
  })
  @ApiResponse({ status: 200 })
  async updateStats() {
    const stats = await this.dashboardService.updateStats();
    return {
      success: true,
      message: 'Dashboard stats updated successfully',
      data: stats,
    };
  }
}
