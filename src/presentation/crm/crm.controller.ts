import { 
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, Query, Res, 
  UnauthorizedException, UseGuards, UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { CrmService } from '../../application/crm/crm.service';
import { AlertSubscriberService } from '../../application/auth/alert-subscriber.service';
import { FinancialAutomationService } from '../../application/financial/financial-automation.service';
import { JwtAuthGuard } from '../../application/auth/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 
import { Roles } from '../../common/decorators/roles.decorator'; 
import { UserRole } from '../../domain/user.entity';  

// ==========================================
// FUNÇÃO AUXILIAR
// ==========================================
function getUserIdFromToken(req: any, jwtService: JwtService): string {
  const authHeader = req.headers?.authorization;
  if (!authHeader) throw new UnauthorizedException('Token de autenticação não fornecido.');
  const token = authHeader.split(' ')[1];
  if (!token) throw new UnauthorizedException('Formato de token inválido.');
  try {
    const decoded = jwtService.verify(token);
    return decoded.sub || decoded.id;
  } catch (error) {
    throw new UnauthorizedException('Token inválido ou expirado.');
  }
}

// ==========================================
// CONTROLLER BLINDADO
// ==========================================
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard) // 🔒 Proteção global: TODAS as rotas exigem autenticação
export class CrmController {
  constructor(
    private readonly crmService: CrmService,
    private readonly jwtService: JwtService,
    private readonly alertSubscriberService: AlertSubscriberService,
    private readonly financialAutomationService: FinancialAutomationService,
  ) {}

  // ==========================================
  // 1. OPORTUNIDADES (KANBAN)
  // ==========================================
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('opportunities/board')
  getBoard() { return this.crmService.getOpportunitiesBoard(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR)
  @Post('opportunities')
  createOpportunity(@Body() data: any) { return this.crmService.createOpportunity(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR)
  @Put('opportunities/:id')
  updateOpportunity(@Param('id') id: string, @Body() data: any) { return this.crmService.updateOpportunity(id, data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR)
  @Patch('opportunities/:id/stage')
  updateStage(@Param('id') id: string, @Body('stage') stage: string) { return this.crmService.updateStage(id, stage); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE) // 👑 Apenas Admin e Gerente podem excluir
  @Delete('opportunities/:id')
  deleteOpportunity(@Param('id') id: string) { return this.crmService.deleteOpportunity(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR)
  @Post('opportunities/:id/archive')
  async archiveOpportunity(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.crmService.archiveOpportunity(id, body.reason);
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('opportunities/archived')
  async getArchivedOpportunities(@Query('customerId') customerId?: string) {
    return this.crmService.getArchivedOpportunities(customerId);
  }

  // ==========================================
  // 2. CLIENTES
  // ==========================================
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('customers')
  findAllCustomers() { return this.crmService.findAllCustomers(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('customers/metrics')
  getCustomerMetrics() { return this.crmService.getCustomerMetrics(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('customers/:id/details')
  getCustomerDetails(@Param('id') id: string) { return this.crmService.getCustomerDetails(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR)
  @Post('customers')
  createCustomer(@Body() data: any) { return this.crmService.createCustomer(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR)
  @Put('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() data: any) { return this.crmService.updateCustomer(id, data); }
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE)
  @Delete('customers/:id')
  deleteCustomer(@Param('id') id: string) { return this.crmService.deleteCustomer(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('customers/:id/contracts')
  async getCustomerWithContracts(@Param('id') id: string) {
    return this.crmService.getCustomerWithContracts(id);
  }

  // ==========================================
  // 3. CONTRATOS
  // ==========================================
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('contracts')
  findAllContracts() { return this.crmService.findAllContracts(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR)
  @Post('contracts')
  createContract(@Body() data: any) { return this.crmService.createContract(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR)
  @Put('contracts/:id')
  updateContract(@Param('id') id: string, @Body() data: any) { return this.crmService.updateContract(id, data); }
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE)
  @Delete('contracts/:id')
  deleteContract(@Param('id') id: string) { return this.crmService.deleteContract(id); }

  // ==========================================
  // 4. FINANCEIRO (CONTAS A RECEBER / PAGAR / DASHBOARD)
  // ==========================================
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('receivables')
  findAllReceivables() { return this.crmService.findAllReceivables(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Patch('receivables/:id/pay')
  markReceivableAsPaid(@Param('id') id: string, @Body('paidAt') paidAt?: string) {
    return this.crmService.markReceivableAsPaid(id, paidAt);
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Patch('receivables/:id/reopen')
  markReceivableAsOpen(@Param('id') id: string) { return this.crmService.markReceivableAsOpen(id); }
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Put('receivables/:id')
  updateReceivable(@Param('id') id: string, @Body() data: any) { return this.crmService.updateReceivable(id, data); }
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Delete('receivables/:id')
  deleteReceivable(@Param('id') id: string) { return this.crmService.deleteReceivable(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('payables')
  findAllPayables() { return this.crmService.findAllPayables(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Post('payables')
  createPayable(@Body() data: any) { return this.crmService.createPayable(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Patch('payables/:id/pay')
  markPayableAsPaid(@Param('id') id: string, @Body() data: any) { return this.crmService.markPayableAsPaid(id, data); }
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Put('payables/:id')
  updatePayable(@Param('id') id: string, @Body() data: any) { return this.crmService.updatePayable(id, data); }
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Delete('payables/:id')
  deletePayable(@Param('id') id: string) { return this.crmService.deletePayable(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('financial/dashboard')
  getFinancialDashboard() { return this.crmService.getFinancialDashboard(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('financial/contracts-pending')
  getContractsPendingReceivables() { return this.crmService.getContractsPendingReceivables(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Patch('financial/contracts/:id/mark-overdue')
  markContractReceivablesAsOverdue(@Param('id') id: string) {
    return this.crmService.markContractReceivablesAsOverdue(id);
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('kpis/sales')
  getSalesKPIs() {
    return this.crmService.getSalesKPIs();
  }
  
  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('dashboard/monthly-financial')
  getMonthlyFinancialData(@Query('months') months?: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.crmService.getMonthlyFinancialData(months ? parseInt(months) : 6, startDate, endDate);
  }

  // ==========================================
  // 5. DESPESAS E RELATÓRIOS
  // ==========================================

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('expenses')
  findAllExpenses() { return this.crmService.findAllExpenses(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Post('expenses')
  createExpense(@Body() data: any) { return this.crmService.createExpense(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Put('expenses/:id')
  updateExpense(@Param('id') id: string, @Body() data: any) { return this.crmService.updateExpense(id, data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Delete('expenses/:id')
  deleteExpense(@Param('id') id: string) { return this.crmService.deleteExpense(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('expenses/by-category')
  getExpensesByCategory() { return this.crmService.getExpensesByCategory(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('expenses/total')
  getTotalExpenses(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) { 
    return this.crmService.getTotalExpenses(startDate, endDate); 
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('recurring-expenses')
  findAllRecurringExpenses() { return this.crmService.findAllRecurringExpenses(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Post('recurring-expenses')
  createRecurringExpense(@Body() data: any) { return this.crmService.createRecurringExpense(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Put('recurring-expenses/:id')
  updateRecurringExpense(@Param('id') id: string, @Body() data: any) { return this.crmService.updateRecurringExpense(id, data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Delete('recurring-expenses/:id')
  deleteRecurringExpense(@Param('id') id: string) { return this.crmService.deleteRecurringExpense(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Post('recurring-expenses/generate')
  generateRecurringPayables() { return this.crmService.generateRecurringPayables(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('expense-types')
  findAllExpenseTypes() { return this.crmService.findAllExpenseTypes(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Post('expense-types')
  createExpenseType(@Body() data: any) { return this.crmService.createExpenseType(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Put('expense-types/:id')
  updateExpenseType(@Param('id') id: string, @Body() data: any) { return this.crmService.updateExpenseType(id, data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Delete('expense-types/:id')
  deleteExpenseType(@Param('id') id: string) { return this.crmService.deleteExpenseType(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('reports/expenses')
  generateExpenseReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Query('classification') classification?: string) {
    return this.crmService.generateExpenseReport(startDate, endDate, classification);
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('reports/payables')
  generatePayablesReport(@Query('status') status?: string, @Query('overdueOnly') overdueOnly?: string) {
    return this.crmService.generatePayablesReport(status, overdueOnly === 'true');
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('reports/receivables')
  generateReceivablesReport(@Query('status') status?: string) {
    return this.crmService.generateReceivablesReport(status);
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('reports/cash-flow')
  generateCashFlowReport(@Query('month') month?: string, @Query('year') year?: string) {
    return this.crmService.generateCashFlowReport(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('reports/contracts')
  generateContractsReport(@Query('status') status?: string) {
    return this.crmService.generateContractsReport(status);
  }

  // ==========================================
  // 6. PRESETS E IMPORTAÇÃO/EXPORTAÇÃO
  // ==========================================

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR, UserRole.FINANCEIRO)
  @Get('presets')
  getUserPresets(@Query('page') page: string, @Query('userId') userId?: string) {
    return this.crmService.getUserPresets(page, userId);
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR, UserRole.FINANCEIRO)
  @Post('presets')
  createUserPreset(@Body() data: any) { return this.crmService.createUserPreset(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR, UserRole.FINANCEIRO)
  @Delete('presets/:id')
  deleteUserPreset(@Param('id') id: string) { return this.crmService.deleteUserPreset(id); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Get('opportunities/export')
  async exportLeads() { return this.crmService.exportLeads(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Post('opportunities/import')
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(@UploadedFile() file: any) { return this.crmService.importLeads(file); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.MARKETING, UserRole.VENDEDOR)
  @Post('opportunities/search-online')
  async searchLeadsOnline(@Body('keywords') keywords: string) {
    if (!keywords) throw new BadRequestException('Palavras-chave sao obrigatorias');
    return this.crmService.searchLeadsOnline(keywords);
  }

  // ==========================================
  // 7. PRESTADORES E RECIBOS (VIA CRM)
  // ==========================================

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('suppliers')
  findAllSuppliers() { return this.crmService.findAllSuppliers(); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Post('suppliers')
  createSupplier(@Body() data: any) { return this.crmService.createSupplier(data); }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('receipts/last/:supplierId')
  getLastReceiptBySupplier(@Param('supplierId') supplierId: string) {
    return this.crmService.getLastReceiptBySupplier(supplierId);
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Post('receipts')
  createReceipt(@Body() data: any) { return this.crmService.createReceipt(data); }

  // ==========================================
  // 8. ADMIN (AUTOMAÇÃO E ALERTAS)
  // ==========================================

  @Roles(UserRole.ADMIN) // 👑 ESTRITAMENTE ADMIN
  @Get('admin/alert-subscribers')
  async getAlertSubscribers(@Req() req: any) {
    const adminId = getUserIdFromToken(req, this.jwtService);
    return this.alertSubscriberService.getSubscribers(adminId);
  }

  @Roles(UserRole.ADMIN)
  @Post('admin/alert-subscribers')
  async addAlertSubscriber(@Req() req: any, @Body() data: { userId: string; receivePaymentConfirmations: boolean; receiveDueDateReminders: boolean }) {
    const adminId = getUserIdFromToken(req, this.jwtService);
    return this.alertSubscriberService.addSubscriber(adminId, data.userId, data.receivePaymentConfirmations, data.receiveDueDateReminders);
  }

  @Roles(UserRole.ADMIN)
  @Delete('admin/alert-subscribers/:id')
  async removeAlertSubscriber(@Req() req: any, @Param('id') id: string) {
    const adminId = getUserIdFromToken(req, this.jwtService);
    return this.alertSubscriberService.removeSubscriber(adminId, id);
  }

  @Roles(UserRole.ADMIN)
  @Post('admin/test-email-automation')
  async testEmailAutomation() {
    return this.financialAutomationService.runManualTest();
  }

  @Roles(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO)
  @Get('reports/opportunities/csv')
  async exportOpportunitiesCsv(@Res() res: Response) {
    try {
      const data = await this.crmService.exportOpportunitiesToCSV();
      const headers = Object.keys(data[0] || {}).join(';');
      const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(';')).join('\r\n');
      const csvContent = `${headers}\r\n${rows}`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=oportunidades_dectra.csv');
      return res.send('\uFEFF' + csvContent);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return res.status(500).json({ message: 'Erro ao gerar relatório' });
    }
  }
}