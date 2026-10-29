import { Controller, Get, Post, Put, Delete, Body, Query, Param, Logger } from '@nestjs/common'; 
import { CashFlowService } from '../../application/financial/cash-flow.service';
import { Contract } from '../../domain/contract.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('cash-flow')
export class CashFlowController {
  private readonly logger = new Logger(CashFlowController.name);

  constructor(
    private readonly cashFlowService: CashFlowService,
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>, // ✅ Repositório injetado corretamente
  ) {}

  @Get('calculate')
  calculateCashFlow(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.cashFlowService.calculateCashFlow(startDate, endDate);
  }
  
  @Post('import-bank-statement')
  async importBankStatement(@Body() data: any) {
    this.logger.log('📥 Recebida requisição de importação de extrato bancário');
    return this.cashFlowService.importBankStatement(data);
  }

  @Put('receivables/:id') // ✅ Rota de atualização de receita
  updateReceivable(@Param('id') id: string, @Body() data: any) {
    return this.cashFlowService.updateReceivable(id, data);
  }

  @Put('payables/:id') // ✅ Rota de atualização de despesa
  updatePayable(@Param('id') id: string, @Body() data: any) {
    return this.cashFlowService.updatePayable(id, data);
  }

  @Get('contracts') // ✅ Rota que o frontend estava procurando
  async getContracts() {
    // Busca todos os contratos sem restringir colunas, evitando erros de TypeScript
    const contracts = await this.contractRepo.find();
    return contracts;
  }

  @Post('forecast')
  saveForecast(@Body() data: any) {
    return this.cashFlowService.saveForecast(data);
  }

  @Get('forecasts/list')
  getForecasts(@Query('month') month?: string, @Query('year') year?: string) {
    return this.cashFlowService.getForecasts(
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined
    );
  }
   @Delete('receivables/:id')
   deleteReceivable(@Param('id') id: string) {
     return this.cashFlowService.deleteReceivable(id);
   }

   @Delete('payables/:id')
   deletePayable(@Param('id') id: string) {
     return this.cashFlowService.deletePayable(id);
   }
}