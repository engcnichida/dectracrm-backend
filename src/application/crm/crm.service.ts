import { Logger, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RecurringExpense } from '../../domain/recurring-expense.entity';
import { Opportunity } from '../../domain/opportunity.entity';
import { Customer, CustomerStatus } from '../../domain/customer.entity';
import { Contract } from '../../domain/contract.entity';
import { Receivable, ReceivableStatus } from '../../domain/receivable.entity';
import { Payable, PayableStatus } from '../../domain/payable.entity';
import { Expense } from '../../domain/expense.entity';
import { CashFlowForecast } from '../../domain/cash-flow-forecast.entity';
import { ExpenseType } from '../../domain/expense-type.entity';
import { UserPreset } from '../../domain/user-preset.entity';
import { BadRequestException } from '@nestjs/common';
import { ReceiptsService } from '../receipts/receipts.service'; 
import { ReceiptType, ReceiptStatus } from '../../domain/receipt.entity';

@Injectable()
export class CrmService {
  // 1. O Logger deve ficar FORA do constructor, como propriedade da classe
  private readonly logger = new Logger(CrmService.name);

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    
    @InjectRepository(Receivable)
    private readonly receivableRepo: Repository<Receivable>,
    
    @InjectRepository(RecurringExpense) 
    private readonly recurringExpenseRepo: Repository<RecurringExpense>,    
    
    @InjectRepository(Payable)
    private readonly payableRepo: Repository<Payable>,
    
    private readonly dataSource: DataSource,
    
    @InjectRepository(Expense) 
    private readonly expenseRepo: Repository<Expense>,
    
    @InjectRepository(ExpenseType) 
    private readonly expenseTypeRepo: Repository<ExpenseType>, 
    
    @InjectRepository(UserPreset) 
    private readonly userPresetRepo: Repository<UserPreset>,
    
    @InjectRepository(CashFlowForecast) 
    private readonly cashFlowForecastRepo: Repository<CashFlowForecast>,
    
    // 2. Adicione o ReceiptsService aqui (com vírgula no item anterior)
    private readonly receiptsService: ReceiptsService,
  ) {}

  // ==========================================
  // OPORTUNIDADES
  // ==========================================

  async getOpportunitiesBoard() {
    // 1. Busca apenas as oportunidades que NÃO estão arquivadas
    const opportunities = await this.opportunityRepo.find({
      where: { archived: false }, // ✅ Filtro que esconde os arquivados do Kanban
      order: { createdAt: 'DESC' },
    });

    // 2. Prepara a estrutura agrupada que o frontend espera
    const groupedBoard: Record<string, any[]> = {
      LEAD_CAPTURADO: [],
      QUALIFICACAO: [],
      PROPOSTA_ENVIADA: [],
      NEGOCIACAO: [],
      FECHADO_GANHO: [],
      PERDIDO: [],
    };

    // 3. Agrupa cada oportunidade na coluna correta
    for (const opp of opportunities) {
      // Usa pipelineStage ou stage, com fallback para LEAD_CAPTURADO
      const stage = (opp as any).pipelineStage || (opp as any).stage || 'LEAD_CAPTURADO';
      
      if (groupedBoard[stage]) {
        groupedBoard[stage].push(opp);
      } else {
        // Se o estágio for desconhecido, joga na primeira coluna para não sumir
        groupedBoard['LEAD_CAPTURADO'].push(opp);
      }
    }

    return groupedBoard;
  }

  async createOpportunity(data: any) {
    console.log('📝 [createOpportunity] Dados brutos recebidos:', data);

    const stageDefinido = data.pipelineStage || data.stage || 'NOVO';

    const opportunityData = {
      ...data,
      pipelineStage: stageDefinido,
      stage: stageDefinido, // Redundância de segurança para compatibilidade
    };

    console.log('💾 [createOpportunity] Salvando com estágio garantido:', opportunityData.pipelineStage);

    const newOpportunity = this.opportunityRepo.create(opportunityData);
    
    // Adicionado ": any" para evitar erro de tipagem do TypeScript
    const saved: any = await this.opportunityRepo.save(newOpportunity);

    console.log('✅ [createOpportunity] Oportunidade criada com sucesso! ID:', saved.id);
    return saved;
  }

  async updateOpportunity(id: string, data: any) {
    await this.opportunityRepo.update(id, data);
    return this.opportunityRepo.findOne({ where: { id } });
  }

  async updateStage(id: string, stage: string) {
    console.log('🔍 [updateStage] Requisição recebida:', { id, stage });
    
    const opportunity: any = await this.opportunityRepo.findOne({ where: { id } });
    if (!opportunity) throw new NotFoundException('Oportunidade não encontrada');

    let targetStage = stage;
    if (stage === 'GANHO' || stage === 'FECHADO_GANHO') targetStage = 'FECHADO_GANHO';
    
    opportunity.pipelineStage = targetStage as any;
    await this.opportunityRepo.save(opportunity);

    return { 
      opportunity, 
      action: 'stage_updated', 
      message: 'Estágio atualizado com sucesso.' 
    };
  }

  async deleteOpportunity(id: string) {
    const result = await this.opportunityRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Oportunidade não encontrada');
    return { success: true };
  }

  // ==========================================
  // CLIENTES
  // ==========================================

  async findAllCustomers() {
    return this.customerRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createCustomer(data: any) {
    // 1. Normaliza os dados de busca (remove espaços extras e converte para minúsculas)
    const searchCompany = data.companyName ? String(data.companyName).trim().toLowerCase() : '';
    const searchEmail = data.contactEmail ? String(data.contactEmail).trim().toLowerCase() : '';

    let existingCustomer = null;

    // 2. Busca por Nome da Empresa (ignorando espaços e case)
    if (searchCompany) {
      existingCustomer = await this.customerRepo
        .createQueryBuilder('c')
        .where('TRIM(LOWER(c.companyName)) = :company', { company: searchCompany })
        .getOne();
    }

    // 3. Se não achou, busca por E-mail (ignorando espaços e case)
    if (!existingCustomer && searchEmail) {
      existingCustomer = await this.customerRepo
        .createQueryBuilder('c')
        .where('TRIM(LOWER(c.contactEmail)) = :email', { email: searchEmail })
        .getOne();
    }

    // 4. Se encontrou, retorna o existente (EVITA A DUPLICAÇÃO!)
    if (existingCustomer) {
      console.log('✅ Cliente já existe, reutilizando ID:', existingCustomer.id);
      return existingCustomer;
    }

    // 5. Se não encontrou, cria um novo (salvando também sem espaços extras)
    const newCustomer = this.customerRepo.create({
      name: data.name ? String(data.name).trim() : null,
      companyName: searchCompany || null,
      cnpj: data.cnpj ? String(data.cnpj).trim() : null,
      cpf: data.cpf ? String(data.cpf).trim() : null,
      city: data.city ? String(data.city).trim() : null,
      state: data.state ? String(data.state).trim().toUpperCase() : null,
      contactName: data.contactName ? String(data.contactName).trim() : null,
      contactPhone: data.contactPhone ? String(data.contactPhone).trim() : null,
      contactEmail: searchEmail || null,
      status: data.status || 'ATIVO',
    });
    
    const saved = await this.customerRepo.save(newCustomer);
    console.log('🆕 Novo cliente criado com ID:', saved.id);
    return saved;
  }

  async updateCustomer(id: string, data: any) {
    await this.customerRepo.update(id, data);
    return this.customerRepo.findOne({ where: { id } });
  }

  async deleteCustomer(id: string) {
    const result = await this.customerRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Cliente não encontrado');
    return { success: true };
  }

async getCustomerDetails(id: string) {
  // 1. Busca apenas o cliente (sem relações inexistentes)
  const customer = await this.customerRepo.findOne({ where: { id } });
  if (!customer) throw new NotFoundException('Cliente não encontrado');

  // 2. Busca contratos do cliente (relação existe na entidade Contract)
  const contracts = await this.contractRepo.find({
    where: { customerId: id },
    order: { createdAt: 'DESC' }
  });

  // 3. Busca oportunidades relacionadas (por email ou nome da empresa)
  const opportunities = await this.opportunityRepo.find({
    where: [
      { contactEmail: customer.contactEmail || '' },
      { company: customer.companyName || '' }
    ],
    order: { createdAt: 'DESC' }
  });

  // 4. Retorna tudo junto
  return {
    ...customer,
    contracts: contracts || [],
    opportunities: opportunities || []
  };
}

  async getCustomerMetrics() {
    const totalCustomers = await this.customerRepo.count();
    const activeCustomers = await this.customerRepo.count({ where: { status: 'ATIVO' as any } });
    return { totalCustomers, activeCustomers };
  }
  // ==========================================
  // LÓGICA DE CLIENTE ÚNICO E CONTRATO AUTOMÁTICO
  // ==========================================

  async findOrCreateCustomer(data: any) {
    let customer = null;

    // 1. Tenta buscar por Nome da Empresa
    if (data.companyName || data.company) {
      customer = await this.customerRepo.findOne({ 
        where: { companyName: data.companyName || data.company } 
      });
    }

    // 2. Se não achou, tenta buscar por Email de Contato
    if (!customer && data.contactEmail) {
      customer = await this.customerRepo.findOne({ 
        where: { contactEmail: data.contactEmail } 
      });
    }

    // 3. Se encontrou, retorna o existente (NÃO cria duplicata)
    if (customer) {
      return customer;
    }

    // 4. Se não existe, cria um novo cliente
    const newCustomer = this.customerRepo.create({
      name: data.contactName || 'Contato Principal',
      companyName: data.company || data.companyName || 'Empresa sem nome',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      status: 'ATIVO' as any
    });

    return this.customerRepo.save(newCustomer);
  }

  async getCustomerWithContracts(customerId: string) {
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Cliente não encontrado');

    const contracts = await this.contractRepo.find({ 
      where: { customerId },
      order: { createdAt: 'DESC' }
    });

    // Enriquece cada contrato com o resumo financeiro das parcelas
    const contractsWithDetails = await Promise.all(contracts.map(async (contract: any) => {
      const receivables = await this.receivableRepo.find({ 
        where: { contractId: contract.id },
        order: { dueDate: 'ASC' }
      });
      
      const totalReceived = receivables.filter((r: any) => r.status === 'RECEBIDO').reduce((sum: number, r: any) => sum + Number(r.amount), 0);
      const totalPending = receivables.filter((r: any) => r.status === 'PENDENTE').reduce((sum: number, r: any) => sum + Number(r.amount), 0);
      
      const today = new Date();
      const totalOverdue = receivables.filter((r: any) => {
        const isPending = r.status === 'PENDENTE' || r.status === 'ATRASADO';
        const isPastDue = new Date(r.dueDate) < today;
        return isPending && isPastDue;
      }).reduce((sum: number, r: any) => sum + Number(r.amount), 0);

      return {
        ...contract,
        receivablesCount: receivables.length,
        financialSummary: { totalReceived, totalPending, totalOverdue }
      };
    }));

    return { customer, contracts: contractsWithDetails };
  }
 
    //Arquivar Oportunidades//
 
    async archiveOpportunity(id: string, reason?: string) {
    const opportunity = await this.opportunityRepo.findOne({ where: { id } });
    if (!opportunity) throw new NotFoundException('Oportunidade não encontrada');
    
    opportunity.archived = true;
    opportunity.archivedAt = new Date();
    opportunity.archiveReason = reason || 'Contrato formalizado';
    
    return this.opportunityRepo.save(opportunity);
  }

  async getArchivedOpportunities(customerId?: string) {
    const query = this.opportunityRepo.createQueryBuilder('o')
      .where('o.archived = :archived', { archived: true })
      .orderBy('o.archivedAt', 'DESC');
    
    if (customerId) {
      query.andWhere('o.customerId = :customerId', { customerId });
    }
    
    return query.getMany();
  }

  // ==========================================
  // CONTRATOS
  // ==========================================

  async findAllContracts() {
    // REMOVIDO: relations: ['customer'] para evitar erro de propriedade não encontrada
    // O frontend já faz o match do nome do cliente usando o customerId
    return this.contractRepo.find({ 
      order: { createdAt: 'DESC' }
    });
  }


      async updateContract(id: string, data: any) {
    console.log('📝 [updateContract] ========== INÍCIO DA ATUALIZAÇÃO ==========');
    console.log('📝 [updateContract] Dados recebidos:', data);

    const currentContract: any = await this.contractRepo.findOne({ where: { id } });
    if (!currentContract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    const allowedFields = [
      'customerId', 'type', 'totalValue', 'startDate', 'billingDate', 
      'endDate', 'paymentCondition', 'installments', 'frequency', 'status', 
      'title', 'description'
    ];

    const filteredData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        filteredData[key] = data[key];
      }
    }

    console.log('💾 [updateContract] Campos filtrados para salvar:', filteredData);

    // Verifica se algo que afeta as parcelas mudou
    const needsRegenerate = 
      Number(filteredData.installments) !== Number(currentContract.installments) ||
      filteredData.frequency !== currentContract.frequency ||
      Number(filteredData.totalValue) !== Number(currentContract.totalValue) ||
      filteredData.startDate !== currentContract.startDate ||
      filteredData.billingDate !== currentContract.billingDate;

    console.log('🔍 [updateContract] Precisa regenerar parcelas?', needsRegenerate);
    console.log('🔍 [updateContract] Parcelas atuais:', currentContract.installments, '-> Novas:', filteredData.installments);

    // 1. Atualiza o contrato
    await this.contractRepo.update(id, filteredData);
    const updatedContract: any = await this.contractRepo.findOne({ where: { id } });

    // 2. Regenera as contas a receber se necessário e se for parcelado (> 1)
    if (needsRegenerate && Number(updatedContract.installments) > 1) {
      console.log('🔄 [updateContract] Regenerando contas a receber...');
      
      // Deleta as antigas
      await this.receivableRepo.delete({ contractId: id });
      console.log('🗑️ [updateContract] Contas antigas deletadas');
      
      const numInstallments = Number(updatedContract.installments);
      const totalValue = Number(updatedContract.totalValue);
      const installmentValue = totalValue / numInstallments;
      const startDate = new Date(updatedContract.startDate);
      
      const receivablesToCreate = [];
      
      for (let i = 1; i <= numInstallments; i++) {
        const dueDate = new Date(startDate);
        
        if (updatedContract.frequency === 'MENSAL') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
        } else if (updatedContract.frequency === 'BIMESTRAL') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1) * 2);
        } else if (updatedContract.frequency === 'TRIMESTRAL') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1) * 3);
        } else if (updatedContract.frequency === 'SEMESTRAL') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1) * 6);
        } else if (updatedContract.frequency === 'ANUAL') {
          dueDate.setFullYear(dueDate.getFullYear() + (i - 1));
        }
        
        if (updatedContract.billingDate) {
          dueDate.setDate(new Date(updatedContract.billingDate).getDate());
        }

        receivablesToCreate.push({
          contractId: id,
          customerId: updatedContract.customerId,
          description: `Parcela ${i}/${numInstallments} - ${updatedContract.title}`,
          amount: installmentValue,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'PENDENTE',
        });
      }
      
      await this.receivableRepo.save(receivablesToCreate);
      console.log(`✅ [updateContract] ${receivablesToCreate.length} novas contas criadas com sucesso!`);
    } else {
      console.log('⚠️ [updateContract] Parcelas NÃO regeneradas (não houve mudança ou é à vista).');
    }

    console.log('📝 [updateContract] ========== FIM DA ATUALIZAÇÃO ==========');
    return updatedContract;
  }


  async deleteContract(id: string) {
    console.log('🗑️ [Service] Tentando deletar contrato:', id);
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Contrato não encontrado');

    try {
      await this.receivableRepo.delete({ contractId: id });
      await this.contractRepo.delete(id);
      console.log('✅ [Service] Contrato e parcelas deletados com sucesso.');
      return { message: 'Contrato excluído com sucesso' };
    } catch (error: any) {
      console.error('❌ [Service] Erro ao deletar contrato:', error.message);
      throw new Error(`Não foi possível excluir o contrato: ${error.message}`);
    }
  }

  // ==========================================
  // CONTAS A RECEBER
  // ==========================================

  async findAllReceivables() {
    console.log('🔍 [findAllReceivables] Buscando contas a receber...');
    
    const receivables = await this.receivableRepo.find({ 
      order: { dueDate: 'ASC' }
    });
    
    console.log(`✅ [findAllReceivables] Encontradas ${receivables.length} contas a receber`);
    return receivables;
  }

    async createContract(data: any) {
    console.log('📋 [createContract] Iniciando criação de contrato...');

    // 1. Formatar a data de início para o padrão brasileiro (DD/MM/AAAA)
    const startDateObj = new Date(data.startDate);
    const formattedDate = startDateObj.toLocaleDateString('pt-BR');

    // 2. Montar o título final: Nome definido pelo usuário + Data
    const userTitle = data.title ? String(data.title).trim() : 'Contrato';
    const finalTitle = `${userTitle} - ${formattedDate}`;

    console.log(`📋 [createContract] Título gerado: ${finalTitle}`);

    // 3. Preparar dados do contrato com o título formatado
    const contractData = {
      ...data,
      title: finalTitle, // ✅ Usa o título formatado
      status: data.status || 'ATIVO',
    };

    // 4. Salvar contrato
    const newContract = this.contractRepo.create(contractData);
    const savedContract: any = await this.contractRepo.save(newContract);
    const numInstallments = data.installments || 1;
    console.log(`🔍 [createContract] Número de parcelas: ${numInstallments}`);
    
    if (numInstallments >= 1 && savedContract.customerId && savedContract.startDate) {
      console.log(`🚀 [createContract] Gerando ${numInstallments} conta(s) a receber...`);
      
      const totalValue = Number(data.totalValue);
      const installmentValue = totalValue / numInstallments;
      const startDate = new Date(data.startDate);
      
      const receivablesToCreate = [];
      
      for (let i = 1; i <= numInstallments; i++) {
        const dueDate = new Date(startDate);
        
        if (data.frequency === 'MENSAL') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
        } else if (data.frequency === 'BIMESTRAL') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1) * 2);
        } else if (data.frequency === 'TRIMESTRAL') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1) * 3);
        } else if (data.frequency === 'SEMESTRAL') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1) * 6);
        } else if (data.frequency === 'ANUAL') {
          dueDate.setFullYear(dueDate.getFullYear() + (i - 1));
        }
        
        if (data.billingDate) {
          const billingDay = new Date(data.billingDate).getDate();
          dueDate.setDate(billingDay);
        }

        receivablesToCreate.push({
          contractId: savedContract.id,
          customerId: savedContract.customerId,
          description: `Parcela ${i}/${numInstallments} - ${savedContract.title}`,
          amount: installmentValue,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'PENDENTE',
        });
      }
      
      console.log(`💾 [createContract] Salvando ${receivablesToCreate.length} contas a receber...`);
      const savedReceivables = await this.receivableRepo.save(receivablesToCreate);
      console.log(`✅ [createContract] ${savedReceivables.length} contas a receber criadas com sucesso!`);
    } else {
      console.log('⚠️ [createContract] Contas a receber NÃO geradas. Motivo:', {
        numInstallments,
        customerId: savedContract.customerId,
        startDate: savedContract.startDate
      });
    }

    return savedContract;
  }

  async markReceivableAsPaid(id: string, paidAt?: string) {
    console.log(`💰 [markReceivableAsPaid] Marcando conta a receber ${id} como RECEBIDO...`);
    
    const paymentDate = paidAt ? new Date(paidAt) : new Date();

    try {
      // ✅ CORREÇÃO: Usando 'RECEBIDO' que já existe no enum do banco de dados
      await this.receivableRepo.query(
        `UPDATE receivables 
         SET status = 'RECEBIDO'::receivables_status_enum, 
             "paidAt" = $1 
         WHERE id = $2`,
        [paymentDate, id]
      );

      console.log(`✅ [markReceivableAsPaid] Conta ${id} marcada como RECEBIDO com sucesso!`);
      return this.receivableRepo.findOne({ where: { id } });
    } catch (error) {
      console.error(`❌ [markReceivableAsPaid] ERRO ao marcar como RECEBIDO:`, error);
      throw error;
    }
  }

  async markReceivableAsOpen(id: string) {
    await this.receivableRepo.update(id, { status: 'PENDENTE' as any, paidAt: null });
    return this.receivableRepo.findOne({ where: { id } });
  }

  async updateReceivable(id: string, data: any) {
    await this.receivableRepo.update(id, data);
    return this.receivableRepo.findOne({ where: { id } });
  }

  async deleteReceivable(id: string) {
    const result = await this.receivableRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Conta a receber não encontrada');
    return { success: true };
  }

  // ==========================================
  // CONTAS A PAGAR
  // ==========================================

  async findAllPayables() {
    return this.payableRepo.find({ order: { dueDate: 'ASC' } });
  }

  async createPayable(data: any) {
    const newPayable = this.payableRepo.create(data);
    return this.payableRepo.save(newPayable);
  }


  async markPayableAsPaid(id: string, data: any) {
    const payable: any = await this.payableRepo.findOne({ 
      where: { id },
      relations: ['recurringExpense', 'expense'] 
    });
    
    if (!payable) throw new NotFoundException('Conta a pagar não encontrada');

    // 1. Marca como pago
    payable.status = 'PAGO';
    payable.paidAt = data.paidAt ? new Date(data.paidAt) : new Date();
    payable.paymentMethod = data.paymentMethod || payable.paymentMethod || 'PIX';
    
    await this.payableRepo.save(payable);

    // 2. VERIFICAÇÃO AUTOMÁTICA DE RECIBO
    const shouldGenerateReceipt = 
      payable.generatesReceipt || 
      payable.recurringExpense?.generatesReceipt || 
      payable.expense?.generatesReceipt;

    if (shouldGenerateReceipt) {
      this.logger.log(`🧾 Gerando recibo automático para a conta ${id}...`);
      
      try {
        await this.receiptsService.createReceipt({
          type: payable.recurringExpense?.type === 'PJ' ? ReceiptType.PJ : ReceiptType.RESSARCIMENTO,
          description: payable.description,
          amount: payable.amount,
          receiptDate: payable.paidAt,
          issuerName: payable.providerName || 'Fornecedor',
          issuerDocument: payable.providerDocument || '',
          linkedEntityType: 'PAYABLE',
          linkedEntityId: payable.id,
          status: ReceiptStatus.PAGO,
          paymentMethod: payable.paymentMethod,
          notes: 'Recibo gerado automaticamente após confirmação de pagamento.'
        }, []);
        
        this.logger.log(`✅ Recibo gerado com sucesso para a conta ${id}`);
      } catch (error: any) {
        this.logger.error(`❌ Falha ao gerar recibo automático: ${error.message || error}`);
      }
    }

    return payable;
  }

  async updatePayable(id: string, data: any) {
    await this.payableRepo.update(id, data);
    return this.payableRepo.findOne({ where: { id } });
  }

  async deletePayable(id: string) {
    const result = await this.payableRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Conta a pagar não encontrada');
    return { success: true };
  }

  // ==================== EXPENSES (DESPESAS) ====================

async findAllExpenses() {
  console.log('💸 [findAllExpenses] Buscando todas as despesas...');
  return this.expenseRepo.find({ 
    relations: ['expenseType'], // ✅ Adiciona o JOIN com a tabela de tipos
    order: { expenseDate: 'DESC' }
  });
}

  async createExpense(data: any) {
    console.log('💸 [createExpense] Criando nova despesa com orquestração automática...');
    
    try {
      // 1. Criar a ficha de despesa
      const newExpense = this.expenseRepo.create({
        description: data.description,
        expenseTypeId: data.expenseTypeId,
        amount: data.amount,
        expenseDate: data.expenseDate,
        dueDate: data.dueDate || data.expenseDate,
        status: 'PENDENTE',
        notes: data.notes,
        isRecurring: data.isRecurring || false,
        recurrencePeriod: data.recurrencePeriod || 'MONTHLY',
        recurrenceCount: data.recurrenceCount || 12,
        recurrenceEndDate: data.recurrenceEndDate || null
      });

      const savedExpense: any = await this.expenseRepo.save(newExpense);
      console.log('✅ [createExpense] Ficha de despesa criada! ID:', savedExpense.id);

      // 2. SE FOR RECORRENTE: Criar o registro mestre e automatizar
      if (data.isRecurring) {
        console.log('🔄 [createExpense] Configurando automação de despesa recorrente...');
        
        // 2.1. Criar o registro mestre de recorrência
        const recurringRecord = this.recurringExpenseRepo.create({
          description: data.description,
          category: data.category || 'Outros', // Ajuste conforme seu entity
          estimatedAmount: data.amount,
          dueDay: new Date(data.dueDate || data.expenseDate).getDate(),
          recurrencePeriod: data.recurrencePeriod || 'MONTHLY',
          status: 'ATIVO',
          lastGenerated: data.expenseDate // Marca que a primeira já foi gerada
        } as any);
        const savedRecurring: any = await this.recurringExpenseRepo.save(recurringRecord);
        
        // Vincula a despesa original ao registro recorrente
        savedExpense.recurringExpenseId = savedRecurring.id;

        await this.expenseRepo.save(savedExpense);

        // 2.2. Gerar previsões de fluxo de caixa para os próximos meses
        await this.generateCashFlowForecasts(savedRecurring);
        
        console.log('✅ [createExpense] Automação de recorrência configurada com sucesso!');
      } else {
        // 3. Se NÃO for recorrente, cria a conta a pagar avulsa normalmente
        await this.createPayableFromExpense(savedExpense);
      }

      return savedExpense;
    } catch (error) {
      console.error('❌ [createExpense] Erro ao criar despesa:', error);
      throw error;
    }
  }

  // Método auxiliar: Criar conta a pagar a partir da despesa
  private async createPayableFromExpense(expense: any) {
    console.log('📝 [createPayableFromExpense] Criando conta a pagar para despesa:', expense.id);

    // Determina se é recorrente ou comum
    const isRecurring = expense.isRecurring === true;

    const payableData: any = {
      description: expense.description,
      category: expense.expenseType?.name || 'Outros',
      amount: expense.amount,
      dueDate: expense.dueDate || expense.expenseDate,
      status: 'PENDENTE' as any,
      notes: `Gerado automaticamente a partir da despesa ID: ${expense.id}`,
      isRecurring: isRecurring,
    };

    // Se for recorrente, preenche recurringExpenseId (mas precisa criar o registro antes)
    // Se for comum, preenche expenseId
    if (isRecurring) {
      // TODO: Criar registro em recurring_expenses antes (lógica futura)
      // Por enquanto, não preenche recurringExpenseId para evitar erro de FK
      console.log('⚠️ [createPayableFromExpense] Despesa recorrente detectada, mas lógica de criação em recurring_expenses ainda não implementada.');
      payableData.notes += ' (Recorrente - configuração pendente)';
    } else {
      payableData.expenseId = expense.id;
    }

    const newPayable = this.payableRepo.create(payableData);
    await this.payableRepo.save(newPayable);
    
    console.log('✅ [createPayableFromExpense] Conta a pagar criada com sucesso!');
  }

  // Método auxiliar: Gerar previsões de fluxo de caixa para despesas recorrentes
  private async generateCashFlowForecasts(recurringExpense: any) {
    console.log('📈 [generateCashFlowForecasts] Gerando previsões...');

    const period = recurringExpense.recurrencePeriod || 'MONTHLY';
    const maxCount = 12; // Previsão para 1 ano
    const startDate = new Date(recurringExpense.lastGenerated || new Date());

    let currentDate = new Date(startDate);
    let count = 0;

    while (count < maxCount) {
      // Avança a data para o próximo ciclo
      this.advanceDate(currentDate, period);
      
      // Pula o mês atual (pois a conta real já foi criada)
      if (count === 0) {
        count++;
        continue;
      }

      const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), recurringExpense.dueDay);

      const forecast = this.cashFlowForecastRepo.create({
        description: recurringExpense.description,
        type: 'DESPESA',
        amount: recurringExpense.estimatedAmount,
        forecastDate: forecastDate.toISOString().split('T')[0],
        month: forecastDate.getMonth() + 1,
        year: forecastDate.getFullYear(),
        isRecurring: true,
        ExpenseId: recurringExpense.id, // Vincula à recorrência
        status: 'PREVISTO'
      } as any);

      await this.cashFlowForecastRepo.save(forecast);
      count++;
    }
    console.log(`✅ [generateCashFlowForecasts] ${count - 1} previsões geradas.`);
  }

  // Método auxiliar: Avançar data conforme período (Aceita PT e EN)
  private advanceDate(date: Date, period: string) {
    switch (period) {
      case 'MONTHLY':
      case 'MENSAL':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'QUARTERLY':
      case 'TRIMESTRAL':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'SEMESTRAL':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'YEARLY':
      case 'ANUAL':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1); // Fallback seguro
    }
  }

  async deleteExpense(id: string) {
    console.log('💸 [deleteExpense] Deletando despesa:', id);
    await this.expenseRepo.delete(id);
    return { success: true };
  }

  async getExpensesByCategory() {
    console.log('💸 [getExpensesByCategory] Calculando despesas por categoria...');
    
    const expensesByCategory = await this.expenseRepo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('SUM(e.amount)', 'total')
      .groupBy('e.category')
      .getRawMany();

    console.log('✅ [getExpensesByCategory] Resultado:', expensesByCategory);
    return expensesByCategory;
  }

  async getTotalExpenses(startDate?: string, endDate?: string) {
    console.log('💸 [getTotalExpenses] Calculando total de despesas...');
    
    let query = this.expenseRepo.createQueryBuilder('e')
      .select('SUM(e.amount)', 'total');

    if (startDate) {
      query = query.andWhere('e.expenseDate >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('e.expenseDate <= :endDate', { endDate });
    }

    const result = await query.getRawOne();
    const total = Number(result?.total) || 0;
    
    console.log('✅ [getTotalExpenses] Total:', total);
    return total;
  }

  // ==================== CASH FLOW FORECASTS (FLUXO DE CAIXA PREVISTO) ====================

  async getCashFlowForecasts(month?: number, year?: number) {
    console.log('📈 [getCashFlowForecasts] Buscando previsões de fluxo de caixa...');

    let query = this.cashFlowForecastRepo.createQueryBuilder('cf');

    if (month && year) {
      query = query.where('cf.month = :month AND cf.year = :year', { month, year });
    }

    const forecasts = await query.orderBy('cf.forecastDate', 'ASC').getMany();
    console.log(`✅ [getCashFlowForecasts] Encontradas ${forecasts.length} previsões`);
    return forecasts;
  }

  async getCashFlowSummary() {
    console.log('📊 [getCashFlowSummary] Calculando resumo do fluxo de caixa...');

    const forecasts = await this.cashFlowForecastRepo
      .createQueryBuilder('cf')
      .select('cf.year', 'year')
      .addSelect('cf.month', 'month')
      .addSelect('SUM(CASE WHEN cf.type = :despesa THEN cf.amount ELSE 0 END)', 'totalDespesas')
      .addSelect('SUM(CASE WHEN cf.type = :receita THEN cf.amount ELSE 0 END)', 'totalReceitas')
      .setParameter('despesa', 'DESPESA')
      .setParameter('receita', 'RECEITA')
      .groupBy('cf.year, cf.month')
      .orderBy('cf.year, cf.month', 'ASC')
      .getRawMany();

    console.log('✅ [getCashFlowSummary] Resumo calculado!');
    return forecasts;
  }

  // ==========================================
  // FINANCEIRO / DASHBOARD
  // ==========================================
  async getFinancialDashboard() {
    console.log('💰 [getFinancialDashboard] Calculando dashboard financeiro...');

    // RECEITAS: Somar TODAS as contas a receber (recebidas + pendentes)
    const totalReceivablesRaw = await this.receivableRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .getRawOne();

    // RECEITAS RECEBIDAS: Apenas as quitadas
    const totalReceivedRaw = await this.receivableRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.status::text = :status', { status: 'RECEBIDO' })
      .getRawOne();

    // CUSTOS: despesas classificadas como CUSTO
    const totalCostsRaw = await this.expenseRepo
      .createQueryBuilder('e')
      .innerJoin('e.expenseType', 'et')
      .select('SUM(e.amount)', 'total')
      .where('et.classification = :classification', { classification: 'CUSTO' })
      .getRawOne();

    // DESPESAS: despesas classificadas como DESPESA
    const totalExpensesRaw = await this.expenseRepo
      .createQueryBuilder('e')
      .innerJoin('e.expenseType', 'et')
      .select('SUM(e.amount)', 'total')
      .where('et.classification = :classification', { classification: 'DESPESA' })
      .getRawOne();

    // CONTAS A RECEBER PENDENTES
    const totalPendingReceivablesRaw = await this.receivableRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.status::text = :status', { status: 'PENDENTE' })
      .getRawOne();

    // CONTAS A PAGAR PENDENTES
    const totalPendingPayablesRaw = await this.payableRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.status::text = :status', { status: 'PENDENTE' })
      .getRawOne();

    const totalReceivables = Number(totalReceivablesRaw?.total) || 0;
    const totalReceived = Number(totalReceivedRaw?.total) || 0;
    const totalCosts = Number(totalCostsRaw?.total) || 0;
    const totalExpenses = Number(totalExpensesRaw?.total) || 0;
    const totalOutflows = totalCosts + totalExpenses;
    const balance = totalReceived - totalOutflows;

    console.log('✅ [getFinancialDashboard] Resultado:', {
      totalReceivables,
      totalReceived,
      totalCosts,
      totalExpenses,
      totalOutflows,
      balance,
      pendingReceivables: Number(totalPendingReceivablesRaw?.total) || 0,
      pendingPayables: Number(totalPendingPayablesRaw?.total) || 0,
    });

    return {
      totalReceivables,
      totalCosts,
      totalExpenses,
      totalOutflows,
      balance,
      totalPendingReceivables: Number(totalPendingReceivablesRaw?.total) || 0,
      totalPendingPayables: Number(totalPendingPayablesRaw?.total) || 0,
    };
  }
  async getContractsPendingReceivables() {
    return this.receivableRepo.find({
      where: { status: 'PENDENTE' as any },
      relations: ['contract', 'customer'],
      order: { dueDate: 'ASC' }
    });
  }

  async markContractReceivablesAsOverdue(contractId: string) {
    await this.receivableRepo.update(
      { contractId, status: 'PENDENTE' as any },
      { status: 'ATRASADO' as any }
    );
    return { message: 'Parcelas marcadas como atrasadas' };
  }

  async getSalesKPIs() {
    console.log('📊 [getSalesKPIs] Iniciando cálculo de KPIs...');

    // 1. Total de Oportunidades
    const totalOpportunities = await this.opportunityRepo.count();

    // 2. Oportunidades Ganhas
    const wonOpportunities = await this.opportunityRepo.count({
      where: { pipelineStage: 'FECHADO_GANHO' as any },
    });

    // 3. Oportunidades Perdidas
    const lostOpportunities = await this.opportunityRepo.count({
      where: [
        { pipelineStage: 'FECHADO_PERDIDO' as any },
        { pipelineStage: 'FECHADO_PERDIDO' as any },
      ],
    });

    // 4. Taxa de Conversão
    const conversionRate = totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0;

    // 5. ✅ CORREÇÃO: Buscar TODOS os contratos e calcular no JavaScript
    const allContracts = await this.contractRepo.find();
    console.log('📋 [getSalesKPIs] Contratos encontrados:', allContracts.length);
    console.log('📋 [getSalesKPIs] Detalhes:', allContracts.map(c => ({
      id: c.id,
      title: c.title,
      totalValue: c.totalValue,
      status: c.status
    })));

    // Filtrar apenas contratos ATIVO
    const activeContracts = allContracts.filter(c => c.status === 'ATIVO');
    console.log('✅ [getSalesKPIs] Contratos ATIVOS:', activeContracts.length);

    const totalContractValue = activeContracts.reduce((sum, c) => sum + Number(c.totalValue || 0), 0);
    const totalContracts = activeContracts.length;
    const averageTicket = totalContracts > 0 ? totalContractValue / totalContracts : 0;

    console.log('💰 [getSalesKPIs] Cálculo final:', {
      totalContractValue,
      totalContracts,
      averageTicket
    });

    // 6. Pipeline Total (valor em negociação)
    const pipelineRaw = await this.opportunityRepo
      .createQueryBuilder('o')
      .select('SUM(o.estimatedValue)', 'total')
      .where('o.pipelineStage NOT IN (:...stages)', {
        stages: ['FECHADO_GANHO', 'FECHADO_PERDIDO', 'FECHADO_PERDIDO'],
      })
      .getRawOne();

    const pipelineTotal = Number(pipelineRaw?.total) || 0;

    // 7. Novos Clientes (últimos 12 meses)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const newCustomers = await this.customerRepo
      .createQueryBuilder('c')
      .where('c.createdAt >= :date', { date: twelveMonthsAgo })
      .getCount();

    // 8. CAC (Custo de Aquisição de Cliente)
    const investmentRaw = await this.expenseRepo
      .createQueryBuilder('e')
      .innerJoin('e.expenseType', 'et')
      .select('SUM(e.amount)', 'total')
      .where('et.isCACComponent = :cac', { cac: true })
      .andWhere('e.expenseDate >= :date', { date: twelveMonthsAgo })
      .getRawOne();

    const totalInvestment = Number(investmentRaw?.total) || 0;
    const cac = newCustomers > 0 ? totalInvestment / newCustomers : 0;

    return {
      totalOpportunities,
      wonOpportunities,
      lostOpportunities,
      conversionRate,
      averageTicket,
      pipelineTotal,
      newCustomers,
      cac,
      totalContractValue,
      totalContracts,
    };
  }
  

  async getChartsData() {
    console.log('📊 [getChartsData] Calculando dados dos gráficos...');
    
    // 1. Contas a Receber por Status (usando ::text para evitar erro de enum do Postgres)
    const receivablesRaw = await this.receivableRepo
      .createQueryBuilder('r')
      .select('r.status::text', 'status')
      .addSelect('SUM(r.amount)', 'total')
      .groupBy('r.status::text')
      .getRawMany();

    const statusData = {
      RECEBIDO: 0,
      PENDENTE: 0,
      ATRASADO: 0,
      CANCELADO: 0,
    };

    for (const item of receivablesRaw) {
      const total = Number(item.total) || 0;
      // ✅ CORREÇÃO: Aceita 'RECEBIDO' (padrão atual) e 'PAGO' (caso haja registros antigos)
      if (item.status === 'RECEBIDO' || item.status === 'PAGO') statusData.RECEBIDO = total;
      if (item.status === 'PENDENTE') statusData.PENDENTE = total;
      if (item.status === 'ATRASADO') statusData.ATRASADO = total;
      if (item.status === 'CANCELADO') statusData.CANCELADO = total;
    }

    // 2. Oportunidades por Estágio (Pipeline Pie Data)
    const pipelineRaw = await this.opportunityRepo
      .createQueryBuilder('o')
      .select('"o"."pipelineStage"::text', 'stage')
      .addSelect('COUNT("o"."id")', 'count')
      .groupBy('"o"."pipelineStage"::text')
      .getRawMany();

    const pipelinePieData = [
      { name: 'Lead Capturado', value: 0, fill: '#94a3b8' },
      { name: 'Qualificação', value: 0, fill: '#3b82f6' },
      { name: 'Proposta Enviada', value: 0, fill: '#a855f7' },
      { name: 'Negociação', value: 0, fill: '#f59e0b' },
      { name: 'Fechado/Ganho', value: 0, fill: '#22c55e' },
      { name: 'FECHADO_PERDIDO', value: 0, fill: '#ef4444' },
    ];

    for (const item of pipelineRaw) {
      const count = Number(item.count) || 0;
      const stage = item.stage;
      
      if (stage === 'LEAD_CAPTURADO') pipelinePieData[0].value = count;
      else if (stage === 'QUALIFICACAO') pipelinePieData[1].value = count;
      else if (stage === 'PROPOSTA_ENVIADA') pipelinePieData[2].value = count;
      else if (stage === 'NEGOCIACAO') pipelinePieData[3].value = count;
      else if (stage === 'FECHADO_GANHO') pipelinePieData[4].value = count;
      else if (stage === 'FECHADO_PERDIDO' || stage === 'FECHADO_PERDIDO') pipelinePieData[5].value = count;
    }

    console.log('✅ [getChartsData] Dados calculados:', { statusData, pipelinePieData });

    return {
      receivablesByStatus: statusData,
      pipelinePieData: pipelinePieData,
    };
  }
  // ==========================================
  // SALDO INICIAL
  // ==========================================
  async setInitialBalance(date: string, amount: number) {
    console.log(`💰 [setInitialBalance] Configurando saldo inicial de ${amount} na data ${date}`);

    if (amount > 0) {
      // Saldo Positivo: Cria uma conta a receber já como "RECEBIDA"
      const initialReceivable = this.receivableRepo.create({
        description: 'Saldo Inicial (Ajuste de Sistema)',
        amount: amount,
        dueDate: date,
        paidAt: date,
        status: 'RECEBIDO',
        isInitialBalance: true,
      } as any);
      
      await this.receivableRepo.save(initialReceivable);
      console.log('✅ Saldo inicial positivo registrado como Receita Recebida.');
    } else if (amount < 0) {
      // Saldo Negativo (Dívida): Cria uma conta a pagar já como "PAGA"
      const initialPayable = this.payableRepo.create({
        description: 'Saldo Inicial Negativo (Ajuste de Sistema)',
        amount: Math.abs(amount),
        dueDate: date,
        paidAt: date,
        status: 'PAGO',
        isInitialBalance: true,
      } as any);
      
      await this.payableRepo.save(initialPayable);
      console.log('✅ Saldo inicial negativo registrado como Despesa Paga.');
    }

    return { success: true, message: 'Saldo inicial configurado com sucesso!' };
  }

  // ==========================================
  // OUTROS / ALERTAS
  // ==========================================

  async markAsPaid(entityId: string, type: 'receivable' | 'payable') {
    if (type === 'receivable') {
      return this.markReceivableAsPaid(entityId);
    } else {
      return this.markPayableAsPaid(entityId, { paidDate: new Date().toISOString() });
    }
  }

  async addAlertSubscriber(email: string) {
    try {
      if (this.dataSource) {
        const query = `
          INSERT INTO alert_subscribers (id, email, "isActive", "createdAt", "updatedAt") 
          VALUES (gen_random_uuid(), $1, true, NOW(), NOW()) 
          ON CONFLICT (email) DO UPDATE SET "isActive" = true
        `;
        await this.dataSource.query(query, [email]);
        return { message: 'Assinante adicionado/ativado com sucesso!', email };
      }
      console.log('⚠️ [addAlertSubscriber] DataSource não disponível. E-mail:', email);
      return { message: 'E-mail registrado para testes (modo fallback)', email };
    } catch (error: any) {
      return { message: 'Erro ao adicionar assinante', error: error.message };
    }
  }
  // ==================== RECURRING EXPENSES (DESPESAS RECORRENTES) ====================

  async findAllRecurringExpenses() {
    console.log('🔄 [findAllRecurringExpenses] Buscando despesas recorrentes...');
    return this.recurringExpenseRepo.find({ 
      order: { dueDay: 'ASC' }
    });
  }

  async createRecurringExpense(data: any) {
    console.log('🔄 [createRecurringExpense] Criando despesa recorrente:', data);
    const newExpense = this.recurringExpenseRepo.create(data);
    const saved: any = await this.recurringExpenseRepo.save(newExpense);
    console.log('✅ [createRecurringExpense] Despesa recorrente criada! ID:', saved.id);
    return saved;
  }

  async updateRecurringExpense(id: string, data: any) {
    console.log('🔄 [updateRecurringExpense] Atualizando despesa recorrente:', id);
    await this.recurringExpenseRepo.update(id, data);
    return this.recurringExpenseRepo.findOne({ where: { id } });
  }

  async deleteRecurringExpense(id: string) {
    console.log('🔄 [deleteRecurringExpense] Deletando despesa recorrente:', id);
    await this.recurringExpenseRepo.delete(id);
    return { success: true };
  }

  async generateRecurringPayables() {
    console.log('🔄 [generateRecurringPayables] Gerando contas a pagar automáticas...');
    
    // Calcula a data de 2 dias antes do vencimento
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 2);
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth() + 1;
    const targetYear = targetDate.getFullYear();

    // Busca despesas recorrentes ativas que vencem no dia alvo
    const recurringExpenses = await this.recurringExpenseRepo
      .createQueryBuilder('re')
      .where('re.status = :status', { status: 'ATIVO' })
      .andWhere('re.dueDay = :day', { day: targetDay })
      .getMany();

    console.log(`🔄 [generateRecurringPayables] Encontradas ${recurringExpenses.length} despesas recorrentes para gerar`);

    for (const expense of recurringExpenses) {
      // Verifica se já foi gerada neste mês
      if (expense.lastGenerated) {
        const lastGenDate = new Date(expense.lastGenerated);
        if (lastGenDate.getMonth() === targetMonth - 1 && lastGenDate.getFullYear() === targetYear) {
          console.log(`⏭️ [generateRecurringPayables] Pulando "${expense.description}" (já gerada neste mês)`);
          continue;
        }
      }

      // Cria a conta a pagar
      const dueDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
      
      const newPayable = this.payableRepo.create({
        description: expense.description,
        category: expense.category,
        amount: expense.estimatedAmount,
        dueDate: dueDate,
        status: 'PENDENTE' as any,
        notes: `Gerado automaticamente a partir de despesa recorrente. Valor estimado: R$ ${expense.estimatedAmount}`,
        isRecurring: true,
        recurringExpenseId: expense.id
      } as any);

      await this.payableRepo.save(newPayable);

      // Atualiza a data do último lançamento
      await this.recurringExpenseRepo.update(expense.id, { lastGenerated: dueDate });

      console.log(`✅ [generateRecurringPayables] Conta a pagar criada para "${expense.description}" - Vencimento: ${dueDate}`);
    }

    return { generated: recurringExpenses.length };
  }


// ==================== UPDATE EXPENSE ====================
async updateExpense(id: string, data: any) {
  console.log('💸 [updateExpense] Recebido para atualizar:', id, data);
  
  // 1. Busca a despesa atual
  const expense = await this.expenseRepo.findOne({ where: { id } });
  if (!expense) {
    throw new Error('Despesa não encontrada');
  }

  console.log('📋 [updateExpense] Despesa atual antes da atualização:', expense);

  // 2. Atualiza os campos individualmente (mais confiável que update())
  if (data.description !== undefined) expense.description = data.description;
  if (data.amount !== undefined) expense.amount = data.amount;
  if (data.expenseDate !== undefined) expense.expenseDate = data.expenseDate;
  if (data.status !== undefined) expense.status = data.status;
  
  // 3. Tratamento especial para a chave estrangeira
  if (data.expenseTypeId !== undefined) {
    expense.expenseTypeId = data.expenseTypeId === '' ? null : data.expenseTypeId;
    console.log(' [updateExpense] Atualizando expenseTypeId para:', expense.expenseTypeId);
  }

  // 4. Campo Tipo (usando 'as any' para evitar erro de compilação do TypeScript)
  if (data.transactionType !== undefined) {
    (expense as any).transactionType = data.transactionType;
  } else if (data.type !== undefined) {
    (expense as any).type = data.type;
  }

  // 5. Outros campos opcionais
  if (data.dueDate !== undefined) expense.dueDate = data.dueDate;
  if (data.notes !== undefined) expense.notes = data.notes;
  if (data.isRecurring !== undefined) expense.isRecurring = data.isRecurring;
  if (data.recurrencePeriod !== undefined) expense.recurrencePeriod = data.recurrencePeriod;
  if (data.recurrenceCount !== undefined) expense.recurrenceCount = data.recurrenceCount;
  if (data.recurrenceEndDate !== undefined) {
    expense.recurrenceEndDate = data.recurrenceEndDate === '' ? null : data.recurrenceEndDate;
  }

  console.log('💾 [updateExpense] Salvando despesa com save()...');

  // 6. Usa save() em vez de update() - mais confiável
  const saved = await this.expenseRepo.save(expense);
  
  console.log('✅ [updateExpense] Despesa salva com sucesso:', saved);

  // 7. Retorna o registro atualizado
  return this.expenseRepo.findOne({ 
    where: { id },
    relations: ['expenseType'] // Inclui a relação para retornar o nome da categoria
  });
}
  // ==================== REPORTS (RELATÓRIOS) ====================

  async generateExpenseReport(startDate?: string, endDate?: string, classification?: string) {
    console.log('📊 [generateExpenseReport] Gerando relatório de gastos...');

    let query = this.expenseRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.expenseType', 'et')
      .orderBy('e.expenseDate', 'DESC');

    if (startDate) {
      query = query.andWhere('e."expenseDate" >= :startDate', { startDate });
    }
    if (endDate) {
      query = query.andWhere('e."expenseDate" <= :endDate', { endDate });
    }
    if (classification) {
      query = query.andWhere('et.classification = :classification', { classification });
    }

    const expenses = await query.getMany();

    // Totais por classificação
    const totalCosts = expenses
      .filter(e => e.expenseType?.classification === 'CUSTO')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    const totalExpenses = expenses
      .filter(e => e.expenseType?.classification === 'DESPESA')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalCAC = expenses
      .filter(e => e.expenseType?.isCACComponent)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Agrupar por tipo
    const byType: Record<string, number> = {};
    expenses.forEach(e => {
      const typeName = e.expenseType?.name || 'Sem tipo';
      byType[typeName] = (byType[typeName] || 0) + Number(e.amount);
    });

    return {
      expenses,
      summary: {
        totalCosts,
        totalExpenses,
        totalGeneral: totalCosts + totalExpenses,
        totalCAC,
        count: expenses.length,
        byType,
      },
      period: { startDate, endDate, classification },
    };
  }

  async generatePayablesReport(status?: string, overdueOnly: boolean = false) {
    console.log('📊 [generatePayablesReport] Gerando relatório de contas a pagar...');

    let query = this.payableRepo.createQueryBuilder('p').orderBy('p."dueDate"', 'ASC');

    if (status) {
      query = query.andWhere('p.status::text = :status', { status });
    }

    if (overdueOnly) {
      const today = new Date().toISOString().split('T')[0];
      query = query
        .andWhere('p."dueDate" < :today', { today })
        .andWhere('p.status::text = :pendingStatus', { pendingStatus: 'PENDENTE' });
    }

    const payables = await query.getMany();

    const totalPending = payables
      .filter(p => (p as any).status === 'PENDENTE')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalPaid = payables
      .filter(p => (p as any).status === 'PAGO')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalOverdue = payables
      .filter(p => {
        const isOverdue = new Date((p as any).dueDate) < new Date() && (p as any).status === 'PENDENTE';
        return isOverdue;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      payables,
      summary: {
        totalPending,
        totalPaid,
        totalOverdue,
        count: payables.length,
      },
    };
  }

  async generateReceivablesReport(status?: string) {
    console.log('📊 [generateReceivablesReport] Gerando relatório de contas a receber...');

    let query = this.receivableRepo.createQueryBuilder('r').orderBy('r."dueDate"', 'ASC');

    if (status) {
      query = query.andWhere('r.status::text = :status', { status });
    }

    const receivables = await query.getMany();

    const totalReceived = receivables
      .filter(r => (r as any).status === 'RECEBIDO')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const totalPending = receivables
      .filter(r => (r as any).status === 'PENDENTE')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const totalOverdue = receivables
      .filter(r => {
        const isOverdue = new Date((r as any).dueDate) < new Date() && 
                         ['PENDENTE', 'ATRASADO'].includes((r as any).status);
        return isOverdue;
      })
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      receivables,
      summary: {
        totalReceived,
        totalPending,
        totalOverdue,
        count: receivables.length,
      },
    };
  }

  async generateCashFlowReport(month?: number, year?: number) {
    console.log('📊 [generateCashFlowReport] Gerando relatório de fluxo de caixa...');

    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    // Receitas do mês
    const receivables = await this.receivableRepo
      .createQueryBuilder('r')
      .where('EXTRACT(MONTH FROM r."dueDate") = :month', { month: targetMonth })
      .andWhere('EXTRACT(YEAR FROM r."dueDate") = :year', { year: targetYear })
      .getMany();

    // Despesas do mês
    const expenses = await this.expenseRepo
      .createQueryBuilder('e')
      .where('EXTRACT(MONTH FROM e."expenseDate") = :month', { month: targetMonth })
      .andWhere('EXTRACT(YEAR FROM e."expenseDate") = :year', { year: targetYear })
      .leftJoinAndSelect('e.expenseType', 'et')
      .getMany();

    // Previsões do mês
    const forecasts = await this.cashFlowForecastRepo
      .createQueryBuilder('cf')
      .where('cf.month = :month', { month: targetMonth })
      .andWhere('cf.year = :year', { year: targetYear })
      .getMany();

    const totalReceivables = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalReceived = receivables
      .filter(r => (r as any).status === 'RECEBIDO')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const totalCosts = expenses
      .filter(e => e.expenseType?.classification === 'CUSTO')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    const totalExpenses = expenses
      .filter(e => e.expenseType?.classification === 'DESPESA')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalOutflows = totalCosts + totalExpenses;

    return {
      month: targetMonth,
      year: targetYear,
      receivables,
      expenses,
      forecasts,
      summary: {
        totalReceivables,
        totalReceived,
        totalCosts,
        totalExpenses,
        totalOutflows,
        balance: totalReceived - totalOutflows,
        forecastBalance: totalReceivables - totalOutflows,
      },
    };
  }

  async generateContractsReport(status?: string) {
    console.log('📊 [generateContractsReport] Gerando relatório de contratos...');

    let query = this.contractRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.customer', 'customer')
      .orderBy('c."startDate"', 'DESC');

    if (status) {
      query = query.andWhere('c.status = :status', { status });
    }

    const contracts = await query.getMany();

    const totalValue = contracts.reduce((sum, c) => sum + Number((c as any).totalValue || 0), 0);
    const activeCount = contracts.filter(c => (c as any).status === 'ATIVO').length;

    return {
      contracts,
      summary: {
        total: contracts.length,
        active: activeCount,
        totalValue,
      },
    };
  }
  async getMonthlyFinancialData(
    months: number = 6,
    startDate?: string,
    endDate?: string
  ) {
    console.log('📈 [getMonthlyFinancialData] Buscando dados financeiros...', {
      months,
      startDate,
      endDate,
    });

    const now = new Date();
    let data: Array<{
      month: string;
      monthShort: string;
      year: number;
      monthNumber: number;
      receivables: number;
      costs: number;
      expenses: number;
    }> = [];

    // Se houver intervalo personalizado, calcular quantos meses cobre
    let effectiveMonths = months;
    let startReference = new Date(now.getFullYear(), now.getMonth(), 1);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Calcular diferença em meses
      const monthDiff =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()) + 1;
      effectiveMonths = Math.max(1, monthDiff);
      startReference = new Date(start.getFullYear(), start.getMonth(), 1);
    }

    for (let i = effectiveMonths - 1; i >= 0; i--) {
      const date = new Date(
        startReference.getFullYear(),
        startReference.getMonth() - i,
        1
      );
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthShort = date
        .toLocaleString('pt-BR', { month: 'short' })
        .replace('.', '');

      // Receitas do mês
      const receivablesRaw = await this.receivableRepo
        .createQueryBuilder('r')
        .select('SUM(r.amount)', 'total')
        .where('EXTRACT(MONTH FROM r."dueDate") = :month', { month })
        .andWhere('EXTRACT(YEAR FROM r."dueDate") = :year', { year })
        .andWhere('r.status::text = :status', { status: 'RECEBIDO' })
        .getRawOne();

      // Custos do mês
      const costsRaw = await this.expenseRepo
        .createQueryBuilder('e')
        .innerJoin('e.expenseType', 'et')
        .select('SUM(e.amount)', 'total')
        .where('EXTRACT(MONTH FROM e."expenseDate") = :month', { month })
        .andWhere('EXTRACT(YEAR FROM e."expenseDate") = :year', { year })
        .andWhere('et.classification = :classification', {
          classification: 'CUSTO',
        })
        .getRawOne();

      // Despesas do mês
      const expensesRaw = await this.expenseRepo
        .createQueryBuilder('e')
        .innerJoin('e.expenseType', 'et')
        .select('SUM(e.amount)', 'total')
        .where('EXTRACT(MONTH FROM e."expenseDate") = :month', { month })
        .andWhere('EXTRACT(YEAR FROM e."expenseDate") = :year', { year })
        .andWhere('et.classification = :classification', {
          classification: 'DESPESA',
        })
        .getRawOne();

      data.push({
        month: date.toLocaleString('pt-BR', { month: 'long' }),
        monthShort:
          monthShort.charAt(0).toUpperCase() + monthShort.slice(1),
        year,
        monthNumber: month,
        receivables: Number(receivablesRaw?.total) || 0,
        costs: Number(costsRaw?.total) || 0,
        expenses: Number(expensesRaw?.total) || 0,
      });
    }

    return data; 

  } 

  // ==================== USER PRESETS ====================

  async getUserPresets(page: string, userId?: string) {
    console.log('🔖 [getUserPresets] Buscando presets para página:', page);
    
    const presets = await this.userPresetRepo.find({
      where: [
        { page, isDefault: true },
        ...(userId ? [{ page, userId }] : []),
      ],
      order: { isDefault: 'DESC', name: 'ASC' },
    });
    
    return presets;
  }

  async createUserPreset(data: any) {
    console.log('🔖 [createUserPreset] Criando preset:', data);
    const newPreset = this.userPresetRepo.create(data);
    return this.userPresetRepo.save(newPreset);
  }

  async deleteUserPreset(id: string) {
    console.log('🔖 [deleteUserPreset] Deletando preset:', id);
    await this.userPresetRepo.delete(id);
    return { success: true };
  }
  // ==================== EXPENSE TYPES (TIPOS DE DESPESA) ====================

  async findAllExpenseTypes() {
    console.log('🏷️ [findAllExpenseTypes] Buscando tipos de despesa...');
    return this.expenseTypeRepo.find({ order: { name: 'ASC' } });
  }

  async createExpenseType(data: any) {
    console.log('🏷️ [createExpenseType] Criando tipo de despesa:', data);
    const newType = this.expenseTypeRepo.create(data);
    const saved: any = await this.expenseTypeRepo.save(newType);
    console.log('✅ [createExpenseType] Tipo criado! ID:', saved.id);
    return saved;
  }

  async updateExpenseType(id: string, data: any) {
    console.log('🏷️ [updateExpenseType] Atualizando tipo de despesa:', id);
    await this.expenseTypeRepo.update(id, data);
    return this.expenseTypeRepo.findOne({ where: { id } });
  }

  async deleteExpenseType(id: string) {
    console.log('🏷️ [deleteExpenseType] Deletando tipo de despesa:', id);
    await this.expenseTypeRepo.delete(id);
    return { success: true };
  }

  // ==========================================
  // EXPORTAÇÃO DE DADOS (CSV)
  // ==========================================
  async exportOpportunitiesToCSV() {
    // Busca todas as oportunidades com dados relevantes
    const opportunities = await this.opportunityRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.customer', 'c')
      .select([
        'o.id', 'o.title', 'o.pipelineStage', 'o.estimatedValue', 
        'o.createdAt', 'c.name', 'c.companyName'
      ])
      .orderBy('o.createdAt', 'DESC')
      .getMany();

    // Formata os dados para o CSV
    const csvData = opportunities.map(opp => ({
      ID: opp.id,
      Titulo: opp.title,
      Cliente: opp.customer?.name || opp.customer?.companyName || 'N/A',
      Estagio: opp.pipelineStage,
      Valor_Estimado: Number(opp.estimatedValue || 0).toFixed(2).replace('.', ','),
      Data_Criacao: new Date(opp.createdAt).toLocaleDateString('pt-BR'),
    }));

    return csvData;
  }
  // ==========================================
  // IMPORTAÇÃO, EXPORTAÇÃO E BUSCA DE LEADS
  // ==========================================

  async exportLeads() {
    console.log('📤 [exportLeads] Exportando leads...');
    const opportunities = await this.opportunityRepo.find({ order: { createdAt: 'DESC' } });
    
    const fields = ['title', 'company', 'contactName', 'contactPhone', 'contactEmail', 'estimatedValue', 'pipelineStage'];
    const header = fields.join(',');
    const rows = opportunities.map(item => 
      fields.map(field => `"${String((item as any)[field] || '').replace(/"/g, '""')}"`).join(',')
    );
    
    return { 
      filename: `leads_${new Date().toISOString().split('T')[0]}.csv`, 
      data: [header, ...rows].join('\n'), 
      count: opportunities.length 
    };
  }

  async importLeads(file: any) {
    console.log('📥 [importLeads] Importando leads...', file?.originalname);
    
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Apenas arquivos CSV sao permitidos');
    }

    // 1. Remove BOM (caractere invisível do Excel) e normaliza quebras de linha
    const content = file.buffer.toString('utf-8').replace(/^\uFEFF/, '');
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
    
    if (lines.length < 2) throw new BadRequestException('Arquivo CSV vazio ou invalido');

    // 2. Limpa o cabeçalho: remove aspas, espaços, vírgulas soltas e converte TUDO para minúsculas
    const rawHeaders = lines[0].split(';').map(h => 
      h.trim().replace(/^"|"$/g, '').replace(',', '').toLowerCase()
    );
    
    console.log('📋 [importLeads] Cabeçalhos detectados:', rawHeaders);

    const imported: any[] = [];
    const errors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(';').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const row: any = {};
      rawHeaders.forEach((header: string, index: number) => { 
        row[header] = values[index] !== undefined ? values[index] : ''; 
      });

      try {
        // Aceita variações de nome e garante um valor padrão
        const title = row.title || row.titulo || `Lead Importado ${i}`;
        const company = row.company || row.empresa || 'Empresa não informada';
        
        const leadData = {
          title: title,
          company: company,
          contactName: row.contactname || row.contato || '',
          contactPhone: row.contactphone || row.telefone || '',
          contactEmail: row.contactemail || row.email || '',
          estimatedValue: parseFloat(String(row.estimatedvalue || row.valor).replace(/[^\d,]/g, '').replace(',', '.')) || 0,
          pipelineStage: 'LEAD_CAPTURADO',
        };

        const newLead = this.opportunityRepo.create(leadData as any);
        const saved: any = await this.opportunityRepo.save(newLead);
        imported.push({ ...leadData, id: saved.id });
        
      } catch (error: any) {
        // Isso vai aparecer no seu terminal do backend e nos dirá EXATAMENTE o que está errado
        console.error(`❌ Erro na linha ${i + 1}:`, error.message, row);
        errors.push({ row: i + 1, data: row, error: error.message });
      }
    }

    console.log(`✅ [importLeads] Importação concluída. Sucesso: ${imported.length}, Erros: ${errors.length}`);
    if (errors.length > 0) {
      console.log('⚠️ [importLeads] Detalhes dos erros:', errors);
    }

    return {
      success: true,
      imported: imported.length,
      errors: errors.length,
      details: { created: imported.length, errors },
    };
  }

  async searchLeadsOnline(keywords: string) {
    console.log(`🔍 [searchLeadsOnline] Buscando leads com palavras-chave: "${keywords}"`);
    
    const mockLeads = [
      {
        title: `Contato via Busca: ${keywords}`,
        company: `Empresa ${keywords.split(' ')[0]} Ltda`,
        contactName: 'Carlos Diretor',
        contactPhone: '(11) 98765-4321',
        contactEmail: `contato@empresa${keywords.split(' ')[0].toLowerCase()}.com.br`,
        estimatedValue: 5000,
        source: 'Busca Internet'
      },
      {
        title: `Parceria Potencial: ${keywords}`,
        company: 'Tech Solutions Brasil',
        contactName: 'Ana Gerente',
        contactPhone: '(21) 99876-5432',
        contactEmail: 'ana.gerente@techsolutions.com.br',
        estimatedValue: 12000,
        source: 'Busca Internet'
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockLeads;
  }
  // ==========================================
  // AUTOMAÇÃO DE DESPESAS RECORRENTES (CRON JOB)
  // ==========================================
  
  @Cron('0 0 * * *') // Executa todo dia à meia-noite (00:00)
  async automateRecurringExpenses() {
    console.log('⏰ [Cron] Iniciando verificação automática de despesas recorrentes...');
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Busca todas as despesas recorrentes ATIVAS
    const recurringExpenses = await this.recurringExpenseRepo.find({
      where: { status: 'ATIVO' }
    });

    let generatedCount = 0;

    for (const rec of recurringExpenses) {
      // Verifica se JÁ existe uma conta a pagar gerada para este mês/ano específico
      const existingPayable = await this.payableRepo.findOne({
        where: {
          recurringExpenseId: rec.id,
          // Usando EXTRACT para garantir que pegamos o mês/ano da geração
        }
      });

      // Lógica simplificada: Se a última geração foi antes do mês atual, precisamos gerar uma nova
      let needsGeneration = false;
      if (!rec.lastGenerated) {
        needsGeneration = true;
      } else {
        const lastGenDate = new Date(rec.lastGenerated);
        if (lastGenDate.getMonth() + 1 < currentMonth || lastGenDate.getFullYear() < currentYear) {
          needsGeneration = true;
        }
      }

      if (needsGeneration) {
        console.log(`🔄 [Cron] Gerando conta para recorrência: ${rec.description}`);
        
        // Calcula a data de vencimento deste mês
        const dueDate = new Date(currentYear, currentMonth - 1, rec.dueDay);
        const formattedDueDate = dueDate.toISOString().split('T')[0];

        const newPayable = this.payableRepo.create({
          description: rec.description,
          category: rec.category,
          amount: rec.estimatedAmount,
          dueDate: formattedDueDate,
          status: 'PENDENTE',
          notes: `Gerado automaticamente pelo sistema (Recorrência)`,
          isRecurring: true,
          recurringExpenseId: rec.id
        } as any);

        await this.payableRepo.save(newPayable);

        // Atualiza a data da última geração para controlar o próximo ciclo
        await this.recurringExpenseRepo.update(rec.id, { 
          lastGenerated: formattedDueDate 
        });

        generatedCount++;
      }
    }

    if (generatedCount > 0) {
      console.log(`✅ [Cron] Automação concluída! ${generatedCount} novas contas a pagar geradas.`);
    } else {
      console.log('ℹ️ [Cron] Nenhuma nova conta recorrente precisou ser gerada hoje.');
    }
  }
} 