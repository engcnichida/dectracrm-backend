import { FinancialAutomationService } from '../../application/financial/financial-automation.service';
import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Patch, 
  Delete, 
  Body, 
  Param, 
  Req,
  Query,
  Res, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CrmService } from '../../application/crm/crm.service';
import { AlertSubscriberService } from '../../application/auth/alert-subscriber.service';
import { Roles } from '../../common/decorators/roles.decorator'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 
import { UserRole } from '../../domain/user.entity';  
import { ExpenseType } from '../../domain/expense-type.entity';
import { CashFlowForecast } from '../../domain/cash-flow-forecast.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { JwtAuthGuard } from '../../application/auth/jwt-auth.guard'; // (ajuste o caminho se necessário)
import { Response } from 'express';

// ==========================================
// FUNÇÃO AUXILIAR (Fora da classe)
// ==========================================
function getUserIdFromToken(req: any, jwtService: JwtService): string {
  const authHeader = req.headers?.authorization;
  if (!authHeader) {
    throw new UnauthorizedException('Token de autenticação não fornecido.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedException('Formato de token inválido.');
  }

  try {
    const decoded = jwtService.verify(token);
    return decoded.sub || decoded.id; // Retorna o ID do usuário
  } catch (error) {
    throw new UnauthorizedException('Token inválido ou expirado.');
  }
}

// ==========================================
// CONTROLLER
// ==========================================
@Controller('crm')
export class CrmController {
  constructor(
    private readonly crmService: CrmService, // ✅ CORRETO (apenas vírgula)
    private readonly jwtService: JwtService,
    private readonly alertSubscriberService: AlertSubscriberService,
    private readonly financialAutomationService: FinancialAutomationService,
  ) {}
  // --- OPORTUNIDADES ---
  @Get('opportunities/board')
  getBoard() { return this.crmService.getOpportunitiesBoard(); }

  @Post('opportunities')
  createOpportunity(@Body() data: any) { return this.crmService.createOpportunity(data); }

  @Put('opportunities/:id')
  updateOpportunity(@Param('id') id: string, @Body() data: any) { return this.crmService.updateOpportunity(id, data); }

  @Patch('opportunities/:id/stage')
  updateStage(@Param('id') id: string, @Body('stage') stage: string) { return this.crmService.updateStage(id, stage); }

  @Delete('opportunities/:id')
  deleteOpportunity(@Param('id') id: string) { return this.crmService.deleteOpportunity(id); }

  // --- CLIENTES ---
  @Get('customers')
  findAllCustomers() { return this.crmService.findAllCustomers(); }

  @Get('customers/metrics')
  getCustomerMetrics() { return this.crmService.getCustomerMetrics(); }

  @Get('customers/:id/details')
  getCustomerDetails(@Param('id') id: string) { return this.crmService.getCustomerDetails(id); }

  @Post('customers')
  createCustomer(@Body() data: any) { return this.crmService.createCustomer(data); }

  @Put('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() data: any) { return this.crmService.updateCustomer(id, data); }
  
  @Delete('customers/:id')
  deleteCustomer(@Param('id') id: string) { return this.crmService.deleteCustomer(id); }

    @Get('customers/:id/contracts')
  async getCustomerWithContracts(@Param('id') id: string) {
    return this.crmService.getCustomerWithContracts(id);
  }

  // --- CONTRATOS ---
  @Get('contracts')
  findAllContracts() { return this.crmService.findAllContracts(); }

  @Post('contracts')
  createContract(@Body() data: any) {
    return this.crmService.createContract(data);
  }

  @Put('contracts/:id')
  updateContract(@Param('id') id: string, @Body() data: any) { return this.crmService.updateContract(id, data); }
  
  @Delete('contracts/:id')
  deleteContract(@Param('id') id: string) { return this.crmService.deleteContract(id); }
  
  //Arquivar Oportunidades ganhas
  @Post('opportunities/:id/archive')
  async archiveOpportunity(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.crmService.archiveOpportunity(id, body.reason);
  }

  @Get('opportunities/archived')
  async getArchivedOpportunities(@Query('customerId') customerId?: string) {
    return this.crmService.getArchivedOpportunities(customerId);
  }


  // --- CONTAS A RECEBER ---
  @Get('receivables')
  findAllReceivables() { return this.crmService.findAllReceivables(); }

  @Patch('receivables/:id/pay')
  markReceivableAsPaid(@Param('id') id: string, @Body('paidAt') paidAt?: string) {
    return this.crmService.markReceivableAsPaid(id, paidAt);
  }

  @Patch('receivables/:id/reopen')
  markReceivableAsOpen(@Param('id') id: string) { return this.crmService.markReceivableAsOpen(id); }
  
  @Put('receivables/:id')
  updateReceivable(@Param('id') id: string, @Body() data: any) {
    return this.crmService.updateReceivable(id, data);
  }
  
  @Delete('receivables/:id')
  deleteReceivable(@Param('id') id: string) { return this.crmService.deleteReceivable(id); }

  // --- CONTAS A PAGAR ---
  @Get('payables')
  findAllPayables() { return this.crmService.findAllPayables(); }

  @Post('payables')
  createPayable(@Body() data: any) { return this.crmService.createPayable(data); }

  @Patch('payables/:id/pay')
  markPayableAsPaid(@Param('id') id: string, @Body() data: any) { return this.crmService.markPayableAsPaid(id, data); }
  
  @Put('payables/:id')
  updatePayable(@Param('id') id: string, @Body() data: any) {
    return this.crmService.updatePayable(id, data);
  }
  
  @Delete('payables/:id')
  deletePayable(@Param('id') id: string) { return this.crmService.deletePayable(id); }
  // --- DASHBOARD ---
  @Get('financial/dashboard')
  getFinancialDashboard() { 
    return this.crmService.getFinancialDashboard(); 
  }
  
  @Get('financial/contracts-pending')
  getContractsPendingReceivables() {
    return this.crmService.getContractsPendingReceivables();
  }

  @Patch('financial/contracts/:id/mark-overdue')
  markContractReceivablesAsOverdue(@Param('id') id: string) {
    return this.crmService.markContractReceivablesAsOverdue(id);
  }
  
  @Get('kpis/sales')
  getSalesKPIs() {
    return this.crmService.getSalesKPIs();
  }
  
  @Get('dashboard/monthly-financial')
  getMonthlyFinancialData(
    @Query('months') months?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.crmService.getMonthlyFinancialData(
      months ? parseInt(months) : 6,
      startDate,
      endDate
    );
  } // ✅ CHAVE DE FECHAMENTO ADICIONADA AQUI

  @Get('reports/opportunities/csv')
  @UseGuards(JwtAuthGuard)
  async exportOpportunitiesCsv(@Res() res: Response) {
    try {
      const data = await this.crmService.exportOpportunitiesToCSV();
      
      const headers = Object.keys(data[0] || {}).join(';');
      const rows = data.map(obj => 
        Object.values(obj).map(val => `"${val}"`).join(';')
      ).join('\r\n');
      
      const csvContent = `${headers}\r\n${rows}`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=oportunidades_dectra.csv');
      
      return res.send('\uFEFF' + csvContent);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return res.status(500).json({ message: 'Erro ao gerar relatório' });
    }
  }
  // ==========================================
  // NOVOS MÉTODOS DE AUTOMAÇÃO FINANCEIRA
  // ==========================================

  // 1. Marcar conta como PAGA
  @Post('financial/:type/:id/pay')
  async markAsPaid(
    @Param('type') type: 'receivable' | 'payable',
    @Param('id') id: string,
  ) {
    return this.crmService.markAsPaid(id, type);
  }

  // 2. Admin: Listar assinantes de alertas
  @Get('admin/alert-subscribers')
  async getAlertSubscribers(@Req() req: any) {
    const adminId = getUserIdFromToken(req, this.jwtService);
    return this.alertSubscriberService.getSubscribers(adminId);
  }

  // 3. Admin: Adicionar assinante
  @Post('admin/alert-subscribers')
  async addAlertSubscriber(
    @Req() req: any,
    @Body() data: { userId: string; receivePaymentConfirmations: boolean; receiveDueDateReminders: boolean },
  ) {
    const adminId = getUserIdFromToken(req, this.jwtService);
    return this.alertSubscriberService.addSubscriber(
      adminId,
      data.userId,
      data.receivePaymentConfirmations,
      data.receiveDueDateReminders
    );
  }

  // 4. Admin: Remover assinante
  @Delete('admin/alert-subscribers/:id')
  async removeAlertSubscriber(@Req() req: any, @Param('id') id: string) {
    const adminId = getUserIdFromToken(req, this.jwtService);
    return this.alertSubscriberService.removeSubscriber(adminId, id);
  }
  // Endpoint manual para TESTAR a automação de e-mails
  @Post('admin/test-email-automation')
  async testEmailAutomation() {
    return this.financialAutomationService.runManualTest();
  }
  // ==================== EXPENSES (DESPESAS) ====================

  @Get('expenses')
  findAllExpenses() { return this.crmService.findAllExpenses(); }

  @Post('expenses')
  createExpense(@Body() data: any) { return this.crmService.createExpense(data); }

  @Put('expenses/:id')
  updateExpense(@Param('id') id: string, @Body() data: any) { 
    return this.crmService.updateExpense(id, data); 
  }

  @Delete('expenses/:id')
  deleteExpense(@Param('id') id: string) { 
    return this.crmService.deleteExpense(id); 
  }

  @Get('expenses/by-category')
  getExpensesByCategory() { return this.crmService.getExpensesByCategory(); }

  @Get('expenses/total')
  getTotalExpenses(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) { 
    return this.crmService.getTotalExpenses(startDate, endDate); 
  }
  // ==================== RECURRING EXPENSES (DESPESAS RECORRENTES) ====================

  @Get('recurring-expenses')
  findAllRecurringExpenses() { 
    return this.crmService.findAllRecurringExpenses(); 
  }

  @Post('recurring-expenses')
  createRecurringExpense(@Body() data: any) { 
    return this.crmService.createRecurringExpense(data); 
  }

  @Put('recurring-expenses/:id')
  updateRecurringExpense(@Param('id') id: string, @Body() data: any) { 
    return this.crmService.updateRecurringExpense(id, data); 
  }

  @Delete('recurring-expenses/:id')
  deleteRecurringExpense(@Param('id') id: string) { 
    return this.crmService.deleteRecurringExpense(id); 
  }

  @Post('recurring-expenses/generate')
  generateRecurringPayables() { 
    return this.crmService.generateRecurringPayables(); 
  }

  // ==================== EXPENSE TYPES (TIPOS DE DESPESA) ====================

  @Get('expense-types')
  findAllExpenseTypes() { 
    return this.crmService.findAllExpenseTypes(); 
  }

  @Post('expense-types')
  createExpenseType(@Body() data: any) { 
    return this.crmService.createExpenseType(data); 
  }

  @Put('expense-types/:id')
  updateExpenseType(@Param('id') id: string, @Body() data: any) { 
    return this.crmService.updateExpenseType(id, data); 
  }

  @Delete('expense-types/:id')
  deleteExpenseType(@Param('id') id: string) { 
    return this.crmService.deleteExpenseType(id); 
  }
  // ==================== REPORTS (RELATÓRIOS) ====================

  @Get('reports/expenses')
  generateExpenseReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('classification') classification?: string
  ) {
    return this.crmService.generateExpenseReport(startDate, endDate, classification);
  }

  @Get('reports/payables')
  generatePayablesReport(
    @Query('status') status?: string,
    @Query('overdueOnly') overdueOnly?: string
  ) {
    return this.crmService.generatePayablesReport(status, overdueOnly === 'true');
  }

  @Get('reports/receivables')
  generateReceivablesReport(@Query('status') status?: string) {
    return this.crmService.generateReceivablesReport(status);
  }

  @Get('reports/cash-flow')
  generateCashFlowReport(
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    return this.crmService.generateCashFlowReport(
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined
    );
  }

  @Get('reports/contracts')
  generateContractsReport(@Query('status') status?: string) {
    return this.crmService.generateContractsReport(status);
  }
  // ==================== USER PRESETS ====================

  @Get('presets')
  getUserPresets(
    @Query('page') page: string,
    @Query('userId') userId?: string
  ) {
    return this.crmService.getUserPresets(page, userId);
  }

  @Post('presets')
  createUserPreset(@Body() data: any) {
    return this.crmService.createUserPreset(data);
  }

  @Delete('presets/:id')
  deleteUserPreset(@Param('id') id: string) {
    return this.crmService.deleteUserPreset(id);
  }
  // ==========================================
  // IMPORTAÇÃO, EXPORTAÇÃO E BUSCA DE LEADS
  // ==========================================

  @Get('opportunities/export')
  // @UseGuards(JwtAuthGuard)  <--- COMENTE ESTA LINHA
  async exportLeads() {
    return this.crmService.exportLeads();
  }

  @Post('opportunities/import')
  // @UseGuards(JwtAuthGuard)  <--- COMENTE ESTA LINHA
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(@UploadedFile() file: any) {
    return this.crmService.importLeads(file);
  }

  @Post('opportunities/search-online')
  // @UseGuards(JwtAuthGuard)  <--- COMENTE ESTA LINHA
  async searchLeadsOnline(@Body('keywords') keywords: string) {
    if (!keywords) throw new (require('@nestjs/common').BadRequestException)('Palavras-chave sao obrigatorias');
    return this.crmService.searchLeadsOnline(keywords);
  }
 
}