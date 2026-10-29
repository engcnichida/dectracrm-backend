import { Controller, Get, Query } from '@nestjs/common';
import { FinancialService } from '../../application/financial/financial.service';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.financialService.getDashboard();
  }

  @Get('advanced-metrics')
  async getAdvancedMetrics() {
    return this.financialService.getAdvancedFinancialMetrics();
  }

  @Get('monthly-financial')
  async getMonthlyFinancial(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.getMonthlyFinancialData({
      months: months ? parseInt(months) : 6,
      startDate,
      endDate,
    });
  }
}