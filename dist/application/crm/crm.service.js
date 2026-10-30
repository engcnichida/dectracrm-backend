"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CrmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const recurring_expense_entity_1 = require("../../domain/recurring-expense.entity");
const opportunity_entity_1 = require("../../domain/opportunity.entity");
const customer_entity_1 = require("../../domain/customer.entity");
const contract_entity_1 = require("../../domain/contract.entity");
const receivable_entity_1 = require("../../domain/receivable.entity");
const payable_entity_1 = require("../../domain/payable.entity");
const expense_entity_1 = require("../../domain/expense.entity");
const cash_flow_forecast_entity_1 = require("../../domain/cash-flow-forecast.entity");
const expense_type_entity_1 = require("../../domain/expense-type.entity");
const user_preset_entity_1 = require("../../domain/user-preset.entity");
const common_2 = require("@nestjs/common");
const receipts_service_1 = require("../receipts/receipts.service");
const receipt_entity_1 = require("../../domain/receipt.entity");
let CrmService = CrmService_1 = class CrmService {
    constructor(opportunityRepo, customerRepo, contractRepo, receivableRepo, recurringExpenseRepo, payableRepo, dataSource, expenseRepo, expenseTypeRepo, userPresetRepo, cashFlowForecastRepo, receiptsService) {
        this.opportunityRepo = opportunityRepo;
        this.customerRepo = customerRepo;
        this.contractRepo = contractRepo;
        this.receivableRepo = receivableRepo;
        this.recurringExpenseRepo = recurringExpenseRepo;
        this.payableRepo = payableRepo;
        this.dataSource = dataSource;
        this.expenseRepo = expenseRepo;
        this.expenseTypeRepo = expenseTypeRepo;
        this.userPresetRepo = userPresetRepo;
        this.cashFlowForecastRepo = cashFlowForecastRepo;
        this.receiptsService = receiptsService;
        this.logger = new common_1.Logger(CrmService_1.name);
    }
    async getOpportunitiesBoard() {
        const opportunities = await this.opportunityRepo.find({
            where: { archived: false },
            order: { createdAt: 'DESC' },
        });
        const groupedBoard = {
            LEAD_CAPTURADO: [],
            QUALIFICACAO: [],
            PROPOSTA_ENVIADA: [],
            NEGOCIACAO: [],
            FECHADO_GANHO: [],
            PERDIDO: [],
        };
        for (const opp of opportunities) {
            const stage = opp.pipelineStage || opp.stage || 'LEAD_CAPTURADO';
            if (groupedBoard[stage]) {
                groupedBoard[stage].push(opp);
            }
            else {
                groupedBoard['LEAD_CAPTURADO'].push(opp);
            }
        }
        return groupedBoard;
    }
    async createOpportunity(data) {
        console.log('📝 [createOpportunity] Dados brutos recebidos:', data);
        const stageDefinido = data.pipelineStage || data.stage || 'NOVO';
        const opportunityData = {
            ...data,
            pipelineStage: stageDefinido,
            stage: stageDefinido,
        };
        console.log('💾 [createOpportunity] Salvando com estágio garantido:', opportunityData.pipelineStage);
        const newOpportunity = this.opportunityRepo.create(opportunityData);
        const saved = await this.opportunityRepo.save(newOpportunity);
        console.log('✅ [createOpportunity] Oportunidade criada com sucesso! ID:', saved.id);
        return saved;
    }
    async updateOpportunity(id, data) {
        await this.opportunityRepo.update(id, data);
        return this.opportunityRepo.findOne({ where: { id } });
    }
    async updateStage(id, stage) {
        console.log('🔍 [updateStage] Requisição recebida:', { id, stage });
        const opportunity = await this.opportunityRepo.findOne({ where: { id } });
        if (!opportunity)
            throw new common_1.NotFoundException('Oportunidade não encontrada');
        let targetStage = stage;
        if (stage === 'GANHO' || stage === 'FECHADO_GANHO')
            targetStage = 'FECHADO_GANHO';
        opportunity.pipelineStage = targetStage;
        await this.opportunityRepo.save(opportunity);
        return {
            opportunity,
            action: 'stage_updated',
            message: 'Estágio atualizado com sucesso.'
        };
    }
    async deleteOpportunity(id) {
        const result = await this.opportunityRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Oportunidade não encontrada');
        return { success: true };
    }
    async findAllCustomers() {
        return this.customerRepo.find({ order: { createdAt: 'DESC' } });
    }
    async createCustomer(data) {
        const searchCompany = data.companyName ? String(data.companyName).trim().toLowerCase() : '';
        const searchEmail = data.contactEmail ? String(data.contactEmail).trim().toLowerCase() : '';
        let existingCustomer = null;
        if (searchCompany) {
            existingCustomer = await this.customerRepo
                .createQueryBuilder('c')
                .where('TRIM(LOWER(c.companyName)) = :company', { company: searchCompany })
                .getOne();
        }
        if (!existingCustomer && searchEmail) {
            existingCustomer = await this.customerRepo
                .createQueryBuilder('c')
                .where('TRIM(LOWER(c.contactEmail)) = :email', { email: searchEmail })
                .getOne();
        }
        if (existingCustomer) {
            console.log('✅ Cliente já existe, reutilizando ID:', existingCustomer.id);
            return existingCustomer;
        }
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
    async updateCustomer(id, data) {
        await this.customerRepo.update(id, data);
        return this.customerRepo.findOne({ where: { id } });
    }
    async deleteCustomer(id) {
        const result = await this.customerRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Cliente não encontrado');
        return { success: true };
    }
    async getCustomerDetails(id) {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer)
            throw new common_1.NotFoundException('Cliente não encontrado');
        const contracts = await this.contractRepo.find({
            where: { customerId: id },
            order: { createdAt: 'DESC' }
        });
        const opportunities = await this.opportunityRepo.find({
            where: [
                { contactEmail: customer.contactEmail || '' },
                { company: customer.companyName || '' }
            ],
            order: { createdAt: 'DESC' }
        });
        return {
            ...customer,
            contracts: contracts || [],
            opportunities: opportunities || []
        };
    }
    async getCustomerMetrics() {
        const totalCustomers = await this.customerRepo.count();
        const activeCustomers = await this.customerRepo.count({ where: { status: 'ATIVO' } });
        return { totalCustomers, activeCustomers };
    }
    async findOrCreateCustomer(data) {
        let customer = null;
        if (data.companyName || data.company) {
            customer = await this.customerRepo.findOne({
                where: { companyName: data.companyName || data.company }
            });
        }
        if (!customer && data.contactEmail) {
            customer = await this.customerRepo.findOne({
                where: { contactEmail: data.contactEmail }
            });
        }
        if (customer) {
            return customer;
        }
        const newCustomer = this.customerRepo.create({
            name: data.contactName || 'Contato Principal',
            companyName: data.company || data.companyName || 'Empresa sem nome',
            contactEmail: data.contactEmail || '',
            contactPhone: data.contactPhone || '',
            status: 'ATIVO'
        });
        return this.customerRepo.save(newCustomer);
    }
    async getCustomerWithContracts(customerId) {
        const customer = await this.customerRepo.findOne({ where: { id: customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Cliente não encontrado');
        const contracts = await this.contractRepo.find({
            where: { customerId },
            order: { createdAt: 'DESC' }
        });
        const contractsWithDetails = await Promise.all(contracts.map(async (contract) => {
            const receivables = await this.receivableRepo.find({
                where: { contractId: contract.id },
                order: { dueDate: 'ASC' }
            });
            const totalReceived = receivables.filter((r) => r.status === 'RECEBIDO').reduce((sum, r) => sum + Number(r.amount), 0);
            const totalPending = receivables.filter((r) => r.status === 'PENDENTE').reduce((sum, r) => sum + Number(r.amount), 0);
            const today = new Date();
            const totalOverdue = receivables.filter((r) => {
                const isPending = r.status === 'PENDENTE' || r.status === 'ATRASADO';
                const isPastDue = new Date(r.dueDate) < today;
                return isPending && isPastDue;
            }).reduce((sum, r) => sum + Number(r.amount), 0);
            return {
                ...contract,
                receivablesCount: receivables.length,
                financialSummary: { totalReceived, totalPending, totalOverdue }
            };
        }));
        return { customer, contracts: contractsWithDetails };
    }
    async archiveOpportunity(id, reason) {
        const opportunity = await this.opportunityRepo.findOne({ where: { id } });
        if (!opportunity)
            throw new common_1.NotFoundException('Oportunidade não encontrada');
        opportunity.archived = true;
        opportunity.archivedAt = new Date();
        opportunity.archiveReason = reason || 'Contrato formalizado';
        return this.opportunityRepo.save(opportunity);
    }
    async getArchivedOpportunities(customerId) {
        const query = this.opportunityRepo.createQueryBuilder('o')
            .where('o.archived = :archived', { archived: true })
            .orderBy('o.archivedAt', 'DESC');
        if (customerId) {
            query.andWhere('o.customerId = :customerId', { customerId });
        }
        return query.getMany();
    }
    async findAllContracts() {
        return this.contractRepo.find({
            order: { createdAt: 'DESC' }
        });
    }
    async updateContract(id, data) {
        console.log('📝 [updateContract] ========== INÍCIO DA ATUALIZAÇÃO ==========');
        console.log('📝 [updateContract] Dados recebidos:', data);
        const currentContract = await this.contractRepo.findOne({ where: { id } });
        if (!currentContract) {
            throw new common_1.NotFoundException('Contrato não encontrado');
        }
        const allowedFields = [
            'customerId', 'type', 'totalValue', 'startDate', 'billingDate',
            'endDate', 'paymentCondition', 'installments', 'frequency', 'status',
            'title', 'description'
        ];
        const filteredData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined) {
                filteredData[key] = data[key];
            }
        }
        console.log('💾 [updateContract] Campos filtrados para salvar:', filteredData);
        const needsRegenerate = Number(filteredData.installments) !== Number(currentContract.installments) ||
            filteredData.frequency !== currentContract.frequency ||
            Number(filteredData.totalValue) !== Number(currentContract.totalValue) ||
            filteredData.startDate !== currentContract.startDate ||
            filteredData.billingDate !== currentContract.billingDate;
        console.log('🔍 [updateContract] Precisa regenerar parcelas?', needsRegenerate);
        console.log('🔍 [updateContract] Parcelas atuais:', currentContract.installments, '-> Novas:', filteredData.installments);
        await this.contractRepo.update(id, filteredData);
        const updatedContract = await this.contractRepo.findOne({ where: { id } });
        if (needsRegenerate && Number(updatedContract.installments) > 1) {
            console.log('🔄 [updateContract] Regenerando contas a receber...');
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
                }
                else if (updatedContract.frequency === 'BIMESTRAL') {
                    dueDate.setMonth(dueDate.getMonth() + (i - 1) * 2);
                }
                else if (updatedContract.frequency === 'TRIMESTRAL') {
                    dueDate.setMonth(dueDate.getMonth() + (i - 1) * 3);
                }
                else if (updatedContract.frequency === 'SEMESTRAL') {
                    dueDate.setMonth(dueDate.getMonth() + (i - 1) * 6);
                }
                else if (updatedContract.frequency === 'ANUAL') {
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
        }
        else {
            console.log('⚠️ [updateContract] Parcelas NÃO regeneradas (não houve mudança ou é à vista).');
        }
        console.log('📝 [updateContract] ========== FIM DA ATUALIZAÇÃO ==========');
        return updatedContract;
    }
    async deleteContract(id) {
        console.log('🗑️ [Service] Tentando deletar contrato:', id);
        const contract = await this.contractRepo.findOne({ where: { id } });
        if (!contract)
            throw new common_1.NotFoundException('Contrato não encontrado');
        try {
            await this.receivableRepo.delete({ contractId: id });
            await this.contractRepo.delete(id);
            console.log('✅ [Service] Contrato e parcelas deletados com sucesso.');
            return { message: 'Contrato excluído com sucesso' };
        }
        catch (error) {
            console.error('❌ [Service] Erro ao deletar contrato:', error.message);
            throw new Error(`Não foi possível excluir o contrato: ${error.message}`);
        }
    }
    async findAllReceivables() {
        console.log('🔍 [findAllReceivables] Buscando contas a receber...');
        const receivables = await this.receivableRepo.find({
            order: { dueDate: 'ASC' }
        });
        console.log(`✅ [findAllReceivables] Encontradas ${receivables.length} contas a receber`);
        return receivables;
    }
    async createContract(data) {
        console.log('📋 [createContract] Iniciando criação de contrato...');
        const startDateObj = new Date(data.startDate);
        const formattedDate = startDateObj.toLocaleDateString('pt-BR');
        const userTitle = data.title ? String(data.title).trim() : 'Contrato';
        const finalTitle = `${userTitle} - ${formattedDate}`;
        console.log(`📋 [createContract] Título gerado: ${finalTitle}`);
        const contractData = {
            ...data,
            title: finalTitle,
            status: data.status || 'ATIVO',
        };
        const newContract = this.contractRepo.create(contractData);
        const savedContract = await this.contractRepo.save(newContract);
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
                }
                else if (data.frequency === 'BIMESTRAL') {
                    dueDate.setMonth(dueDate.getMonth() + (i - 1) * 2);
                }
                else if (data.frequency === 'TRIMESTRAL') {
                    dueDate.setMonth(dueDate.getMonth() + (i - 1) * 3);
                }
                else if (data.frequency === 'SEMESTRAL') {
                    dueDate.setMonth(dueDate.getMonth() + (i - 1) * 6);
                }
                else if (data.frequency === 'ANUAL') {
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
        }
        else {
            console.log('⚠️ [createContract] Contas a receber NÃO geradas. Motivo:', {
                numInstallments,
                customerId: savedContract.customerId,
                startDate: savedContract.startDate
            });
        }
        return savedContract;
    }
    async markReceivableAsPaid(id, paidAt) {
        console.log(`💰 [markReceivableAsPaid] Marcando conta a receber ${id} como RECEBIDO...`);
        const paymentDate = paidAt ? new Date(paidAt) : new Date();
        try {
            await this.receivableRepo.query(`UPDATE receivables 
         SET status = 'RECEBIDO'::receivables_status_enum, 
             "paidAt" = $1 
         WHERE id = $2`, [paymentDate, id]);
            console.log(`✅ [markReceivableAsPaid] Conta ${id} marcada como RECEBIDO com sucesso!`);
            return this.receivableRepo.findOne({ where: { id } });
        }
        catch (error) {
            console.error(`❌ [markReceivableAsPaid] ERRO ao marcar como RECEBIDO:`, error);
            throw error;
        }
    }
    async markReceivableAsOpen(id) {
        await this.receivableRepo.update(id, { status: 'PENDENTE', paidAt: null });
        return this.receivableRepo.findOne({ where: { id } });
    }
    async updateReceivable(id, data) {
        await this.receivableRepo.update(id, data);
        return this.receivableRepo.findOne({ where: { id } });
    }
    async deleteReceivable(id) {
        const result = await this.receivableRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Conta a receber não encontrada');
        return { success: true };
    }
    async findAllPayables() {
        return this.payableRepo.find({ order: { dueDate: 'ASC' } });
    }
    async createPayable(data) {
        const newPayable = this.payableRepo.create(data);
        return this.payableRepo.save(newPayable);
    }
    async markPayableAsPaid(id, data) {
        const payable = await this.payableRepo.findOne({
            where: { id },
            relations: ['recurringExpense', 'expense']
        });
        if (!payable)
            throw new common_1.NotFoundException('Conta a pagar não encontrada');
        payable.status = 'PAGO';
        payable.paidAt = data.paidAt ? new Date(data.paidAt) : new Date();
        payable.paymentMethod = data.paymentMethod || payable.paymentMethod || 'PIX';
        await this.payableRepo.save(payable);
        const shouldGenerateReceipt = payable.generatesReceipt ||
            payable.recurringExpense?.generatesReceipt ||
            payable.expense?.generatesReceipt;
        if (shouldGenerateReceipt) {
            this.logger.log(`🧾 Gerando recibo automático para a conta ${id}...`);
            try {
                await this.receiptsService.createReceipt({
                    type: payable.recurringExpense?.type === 'PJ' ? receipt_entity_1.ReceiptType.PJ : receipt_entity_1.ReceiptType.RESSARCIMENTO,
                    description: payable.description,
                    amount: payable.amount,
                    receiptDate: payable.paidAt,
                    issuerName: payable.providerName || 'Fornecedor',
                    issuerDocument: payable.providerDocument || '',
                    linkedEntityType: 'PAYABLE',
                    linkedEntityId: payable.id,
                    status: receipt_entity_1.ReceiptStatus.PAGO,
                    paymentMethod: payable.paymentMethod,
                    notes: 'Recibo gerado automaticamente após confirmação de pagamento.'
                }, []);
                this.logger.log(`✅ Recibo gerado com sucesso para a conta ${id}`);
            }
            catch (error) {
                this.logger.error(`❌ Falha ao gerar recibo automático: ${error.message || error}`);
            }
        }
        return payable;
    }
    async updatePayable(id, data) {
        await this.payableRepo.update(id, data);
        return this.payableRepo.findOne({ where: { id } });
    }
    async deletePayable(id) {
        const result = await this.payableRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Conta a pagar não encontrada');
        return { success: true };
    }
    async findAllExpenses() {
        console.log('💸 [findAllExpenses] Buscando todas as despesas...');
        return this.expenseRepo.find({
            relations: ['expenseType'],
            order: { expenseDate: 'DESC' }
        });
    }
    async createExpense(data) {
        console.log('💸 [createExpense] Criando nova despesa com orquestração automática...');
        try {
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
            const savedExpense = await this.expenseRepo.save(newExpense);
            console.log('✅ [createExpense] Ficha de despesa criada! ID:', savedExpense.id);
            if (data.isRecurring) {
                console.log('🔄 [createExpense] Configurando automação de despesa recorrente...');
                const recurringRecord = this.recurringExpenseRepo.create({
                    description: data.description,
                    category: data.category || 'Outros',
                    estimatedAmount: data.amount,
                    dueDay: new Date(data.dueDate || data.expenseDate).getDate(),
                    recurrencePeriod: data.recurrencePeriod || 'MONTHLY',
                    status: 'ATIVO',
                    lastGenerated: data.expenseDate
                });
                const savedRecurring = await this.recurringExpenseRepo.save(recurringRecord);
                savedExpense.recurringExpenseId = savedRecurring.id;
                await this.expenseRepo.save(savedExpense);
                await this.generateCashFlowForecasts(savedRecurring);
                console.log('✅ [createExpense] Automação de recorrência configurada com sucesso!');
            }
            else {
                await this.createPayableFromExpense(savedExpense);
            }
            return savedExpense;
        }
        catch (error) {
            console.error('❌ [createExpense] Erro ao criar despesa:', error);
            throw error;
        }
    }
    async createPayableFromExpense(expense) {
        console.log('📝 [createPayableFromExpense] Criando conta a pagar para despesa:', expense.id);
        const isRecurring = expense.isRecurring === true;
        const payableData = {
            description: expense.description,
            category: expense.expenseType?.name || 'Outros',
            amount: expense.amount,
            dueDate: expense.dueDate || expense.expenseDate,
            status: 'PENDENTE',
            notes: `Gerado automaticamente a partir da despesa ID: ${expense.id}`,
            isRecurring: isRecurring,
        };
        if (isRecurring) {
            console.log('⚠️ [createPayableFromExpense] Despesa recorrente detectada, mas lógica de criação em recurring_expenses ainda não implementada.');
            payableData.notes += ' (Recorrente - configuração pendente)';
        }
        else {
            payableData.expenseId = expense.id;
        }
        const newPayable = this.payableRepo.create(payableData);
        await this.payableRepo.save(newPayable);
        console.log('✅ [createPayableFromExpense] Conta a pagar criada com sucesso!');
    }
    async generateCashFlowForecasts(recurringExpense) {
        console.log('📈 [generateCashFlowForecasts] Gerando previsões...');
        const period = recurringExpense.recurrencePeriod || 'MONTHLY';
        const maxCount = 12;
        const startDate = new Date(recurringExpense.lastGenerated || new Date());
        let currentDate = new Date(startDate);
        let count = 0;
        while (count < maxCount) {
            this.advanceDate(currentDate, period);
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
                ExpenseId: recurringExpense.id,
                status: 'PREVISTO'
            });
            await this.cashFlowForecastRepo.save(forecast);
            count++;
        }
        console.log(`✅ [generateCashFlowForecasts] ${count - 1} previsões geradas.`);
    }
    advanceDate(date, period) {
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
                date.setMonth(date.getMonth() + 1);
        }
    }
    async deleteExpense(id) {
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
    async getTotalExpenses(startDate, endDate) {
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
    async getCashFlowForecasts(month, year) {
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
    async getFinancialDashboard() {
        console.log('💰 [getFinancialDashboard] Calculando dashboard financeiro...');
        const totalReceivablesRaw = await this.receivableRepo
            .createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .getRawOne();
        const totalReceivedRaw = await this.receivableRepo
            .createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .where('r.status::text = :status', { status: 'RECEBIDO' })
            .getRawOne();
        const totalCostsRaw = await this.expenseRepo
            .createQueryBuilder('e')
            .innerJoin('e.expenseType', 'et')
            .select('SUM(e.amount)', 'total')
            .where('et.classification = :classification', { classification: 'CUSTO' })
            .getRawOne();
        const totalExpensesRaw = await this.expenseRepo
            .createQueryBuilder('e')
            .innerJoin('e.expenseType', 'et')
            .select('SUM(e.amount)', 'total')
            .where('et.classification = :classification', { classification: 'DESPESA' })
            .getRawOne();
        const totalPendingReceivablesRaw = await this.receivableRepo
            .createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .where('r.status::text = :status', { status: 'PENDENTE' })
            .getRawOne();
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
            where: { status: 'PENDENTE' },
            relations: ['contract', 'customer'],
            order: { dueDate: 'ASC' }
        });
    }
    async markContractReceivablesAsOverdue(contractId) {
        await this.receivableRepo.update({ contractId, status: 'PENDENTE' }, { status: 'ATRASADO' });
        return { message: 'Parcelas marcadas como atrasadas' };
    }
    async getSalesKPIs() {
        console.log('📊 [getSalesKPIs] Iniciando cálculo de KPIs...');
        const totalOpportunities = await this.opportunityRepo.count();
        const wonOpportunities = await this.opportunityRepo.count({
            where: { pipelineStage: 'FECHADO_GANHO' },
        });
        const lostOpportunities = await this.opportunityRepo.count({
            where: [
                { pipelineStage: 'FECHADO_PERDIDO' },
                { pipelineStage: 'FECHADO_PERDIDO' },
            ],
        });
        const conversionRate = totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0;
        const allContracts = await this.contractRepo.find();
        console.log('📋 [getSalesKPIs] Contratos encontrados:', allContracts.length);
        console.log('📋 [getSalesKPIs] Detalhes:', allContracts.map(c => ({
            id: c.id,
            title: c.title,
            totalValue: c.totalValue,
            status: c.status
        })));
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
        const pipelineRaw = await this.opportunityRepo
            .createQueryBuilder('o')
            .select('SUM(o.estimatedValue)', 'total')
            .where('o.pipelineStage NOT IN (:...stages)', {
            stages: ['FECHADO_GANHO', 'FECHADO_PERDIDO', 'FECHADO_PERDIDO'],
        })
            .getRawOne();
        const pipelineTotal = Number(pipelineRaw?.total) || 0;
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const newCustomers = await this.customerRepo
            .createQueryBuilder('c')
            .where('c.createdAt >= :date', { date: twelveMonthsAgo })
            .getCount();
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
            if (item.status === 'RECEBIDO' || item.status === 'PAGO')
                statusData.RECEBIDO = total;
            if (item.status === 'PENDENTE')
                statusData.PENDENTE = total;
            if (item.status === 'ATRASADO')
                statusData.ATRASADO = total;
            if (item.status === 'CANCELADO')
                statusData.CANCELADO = total;
        }
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
            if (stage === 'LEAD_CAPTURADO')
                pipelinePieData[0].value = count;
            else if (stage === 'QUALIFICACAO')
                pipelinePieData[1].value = count;
            else if (stage === 'PROPOSTA_ENVIADA')
                pipelinePieData[2].value = count;
            else if (stage === 'NEGOCIACAO')
                pipelinePieData[3].value = count;
            else if (stage === 'FECHADO_GANHO')
                pipelinePieData[4].value = count;
            else if (stage === 'FECHADO_PERDIDO' || stage === 'FECHADO_PERDIDO')
                pipelinePieData[5].value = count;
        }
        console.log('✅ [getChartsData] Dados calculados:', { statusData, pipelinePieData });
        return {
            receivablesByStatus: statusData,
            pipelinePieData: pipelinePieData,
        };
    }
    async setInitialBalance(date, amount) {
        console.log(`💰 [setInitialBalance] Configurando saldo inicial de ${amount} na data ${date}`);
        if (amount > 0) {
            const initialReceivable = this.receivableRepo.create({
                description: 'Saldo Inicial (Ajuste de Sistema)',
                amount: amount,
                dueDate: date,
                paidAt: date,
                status: 'RECEBIDO',
                isInitialBalance: true,
            });
            await this.receivableRepo.save(initialReceivable);
            console.log('✅ Saldo inicial positivo registrado como Receita Recebida.');
        }
        else if (amount < 0) {
            const initialPayable = this.payableRepo.create({
                description: 'Saldo Inicial Negativo (Ajuste de Sistema)',
                amount: Math.abs(amount),
                dueDate: date,
                paidAt: date,
                status: 'PAGO',
                isInitialBalance: true,
            });
            await this.payableRepo.save(initialPayable);
            console.log('✅ Saldo inicial negativo registrado como Despesa Paga.');
        }
        return { success: true, message: 'Saldo inicial configurado com sucesso!' };
    }
    async markAsPaid(entityId, type) {
        if (type === 'receivable') {
            return this.markReceivableAsPaid(entityId);
        }
        else {
            return this.markPayableAsPaid(entityId, { paidDate: new Date().toISOString() });
        }
    }
    async addAlertSubscriber(email) {
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
        }
        catch (error) {
            return { message: 'Erro ao adicionar assinante', error: error.message };
        }
    }
    async findAllRecurringExpenses() {
        console.log('🔄 [findAllRecurringExpenses] Buscando despesas recorrentes...');
        return this.recurringExpenseRepo.find({
            order: { dueDay: 'ASC' }
        });
    }
    async createRecurringExpense(data) {
        console.log('🔄 [createRecurringExpense] Criando despesa recorrente:', data);
        const newExpense = this.recurringExpenseRepo.create(data);
        const saved = await this.recurringExpenseRepo.save(newExpense);
        console.log('✅ [createRecurringExpense] Despesa recorrente criada! ID:', saved.id);
        return saved;
    }
    async updateRecurringExpense(id, data) {
        console.log('🔄 [updateRecurringExpense] Atualizando despesa recorrente:', id);
        await this.recurringExpenseRepo.update(id, data);
        return this.recurringExpenseRepo.findOne({ where: { id } });
    }
    async deleteRecurringExpense(id) {
        console.log('🔄 [deleteRecurringExpense] Deletando despesa recorrente:', id);
        await this.recurringExpenseRepo.delete(id);
        return { success: true };
    }
    async generateRecurringPayables() {
        console.log('🔄 [generateRecurringPayables] Gerando contas a pagar automáticas...');
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 2);
        const targetDay = targetDate.getDate();
        const targetMonth = targetDate.getMonth() + 1;
        const targetYear = targetDate.getFullYear();
        const recurringExpenses = await this.recurringExpenseRepo
            .createQueryBuilder('re')
            .where('re.status = :status', { status: 'ATIVO' })
            .andWhere('re.dueDay = :day', { day: targetDay })
            .getMany();
        console.log(`🔄 [generateRecurringPayables] Encontradas ${recurringExpenses.length} despesas recorrentes para gerar`);
        for (const expense of recurringExpenses) {
            if (expense.lastGenerated) {
                const lastGenDate = new Date(expense.lastGenerated);
                if (lastGenDate.getMonth() === targetMonth - 1 && lastGenDate.getFullYear() === targetYear) {
                    console.log(`⏭️ [generateRecurringPayables] Pulando "${expense.description}" (já gerada neste mês)`);
                    continue;
                }
            }
            const dueDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
            const newPayable = this.payableRepo.create({
                description: expense.description,
                category: expense.category,
                amount: expense.estimatedAmount,
                dueDate: dueDate,
                status: 'PENDENTE',
                notes: `Gerado automaticamente a partir de despesa recorrente. Valor estimado: R$ ${expense.estimatedAmount}`,
                isRecurring: true,
                recurringExpenseId: expense.id
            });
            await this.payableRepo.save(newPayable);
            await this.recurringExpenseRepo.update(expense.id, { lastGenerated: dueDate });
            console.log(`✅ [generateRecurringPayables] Conta a pagar criada para "${expense.description}" - Vencimento: ${dueDate}`);
        }
        return { generated: recurringExpenses.length };
    }
    async updateExpense(id, data) {
        console.log('💸 [updateExpense] Recebido para atualizar:', id, data);
        const expense = await this.expenseRepo.findOne({ where: { id } });
        if (!expense) {
            throw new Error('Despesa não encontrada');
        }
        console.log('📋 [updateExpense] Despesa atual antes da atualização:', expense);
        if (data.description !== undefined)
            expense.description = data.description;
        if (data.amount !== undefined)
            expense.amount = data.amount;
        if (data.expenseDate !== undefined)
            expense.expenseDate = data.expenseDate;
        if (data.status !== undefined)
            expense.status = data.status;
        if (data.expenseTypeId !== undefined) {
            expense.expenseTypeId = data.expenseTypeId === '' ? null : data.expenseTypeId;
            console.log(' [updateExpense] Atualizando expenseTypeId para:', expense.expenseTypeId);
        }
        if (data.transactionType !== undefined) {
            expense.transactionType = data.transactionType;
        }
        else if (data.type !== undefined) {
            expense.type = data.type;
        }
        if (data.dueDate !== undefined)
            expense.dueDate = data.dueDate;
        if (data.notes !== undefined)
            expense.notes = data.notes;
        if (data.isRecurring !== undefined)
            expense.isRecurring = data.isRecurring;
        if (data.recurrencePeriod !== undefined)
            expense.recurrencePeriod = data.recurrencePeriod;
        if (data.recurrenceCount !== undefined)
            expense.recurrenceCount = data.recurrenceCount;
        if (data.recurrenceEndDate !== undefined) {
            expense.recurrenceEndDate = data.recurrenceEndDate === '' ? null : data.recurrenceEndDate;
        }
        console.log('💾 [updateExpense] Salvando despesa com save()...');
        const saved = await this.expenseRepo.save(expense);
        console.log('✅ [updateExpense] Despesa salva com sucesso:', saved);
        return this.expenseRepo.findOne({
            where: { id },
            relations: ['expenseType']
        });
    }
    async generateExpenseReport(startDate, endDate, classification) {
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
        const totalCosts = expenses
            .filter(e => e.expenseType?.classification === 'CUSTO')
            .reduce((sum, e) => sum + Number(e.amount), 0);
        const totalExpenses = expenses
            .filter(e => e.expenseType?.classification === 'DESPESA')
            .reduce((sum, e) => sum + Number(e.amount), 0);
        const totalCAC = expenses
            .filter(e => e.expenseType?.isCACComponent)
            .reduce((sum, e) => sum + Number(e.amount), 0);
        const byType = {};
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
    async generatePayablesReport(status, overdueOnly = false) {
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
            .filter(p => p.status === 'PENDENTE')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const totalPaid = payables
            .filter(p => p.status === 'PAGO')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const totalOverdue = payables
            .filter(p => {
            const isOverdue = new Date(p.dueDate) < new Date() && p.status === 'PENDENTE';
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
    async generateReceivablesReport(status) {
        console.log('📊 [generateReceivablesReport] Gerando relatório de contas a receber...');
        let query = this.receivableRepo.createQueryBuilder('r').orderBy('r."dueDate"', 'ASC');
        if (status) {
            query = query.andWhere('r.status::text = :status', { status });
        }
        const receivables = await query.getMany();
        const totalReceived = receivables
            .filter(r => r.status === 'RECEBIDO')
            .reduce((sum, r) => sum + Number(r.amount), 0);
        const totalPending = receivables
            .filter(r => r.status === 'PENDENTE')
            .reduce((sum, r) => sum + Number(r.amount), 0);
        const totalOverdue = receivables
            .filter(r => {
            const isOverdue = new Date(r.dueDate) < new Date() &&
                ['PENDENTE', 'ATRASADO'].includes(r.status);
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
    async generateCashFlowReport(month, year) {
        console.log('📊 [generateCashFlowReport] Gerando relatório de fluxo de caixa...');
        const targetYear = year || new Date().getFullYear();
        const targetMonth = month || new Date().getMonth() + 1;
        const receivables = await this.receivableRepo
            .createQueryBuilder('r')
            .where('EXTRACT(MONTH FROM r."dueDate") = :month', { month: targetMonth })
            .andWhere('EXTRACT(YEAR FROM r."dueDate") = :year', { year: targetYear })
            .getMany();
        const expenses = await this.expenseRepo
            .createQueryBuilder('e')
            .where('EXTRACT(MONTH FROM e."expenseDate") = :month', { month: targetMonth })
            .andWhere('EXTRACT(YEAR FROM e."expenseDate") = :year', { year: targetYear })
            .leftJoinAndSelect('e.expenseType', 'et')
            .getMany();
        const forecasts = await this.cashFlowForecastRepo
            .createQueryBuilder('cf')
            .where('cf.month = :month', { month: targetMonth })
            .andWhere('cf.year = :year', { year: targetYear })
            .getMany();
        const totalReceivables = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
        const totalReceived = receivables
            .filter(r => r.status === 'RECEBIDO')
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
    async generateContractsReport(status) {
        console.log('📊 [generateContractsReport] Gerando relatório de contratos...');
        let query = this.contractRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.customer', 'customer')
            .orderBy('c."startDate"', 'DESC');
        if (status) {
            query = query.andWhere('c.status = :status', { status });
        }
        const contracts = await query.getMany();
        const totalValue = contracts.reduce((sum, c) => sum + Number(c.totalValue || 0), 0);
        const activeCount = contracts.filter(c => c.status === 'ATIVO').length;
        return {
            contracts,
            summary: {
                total: contracts.length,
                active: activeCount,
                totalValue,
            },
        };
    }
    async getMonthlyFinancialData(months = 6, startDate, endDate) {
        console.log('📈 [getMonthlyFinancialData] Buscando dados financeiros...', {
            months,
            startDate,
            endDate,
        });
        const now = new Date();
        let data = [];
        let effectiveMonths = months;
        let startReference = new Date(now.getFullYear(), now.getMonth(), 1);
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth()) + 1;
            effectiveMonths = Math.max(1, monthDiff);
            startReference = new Date(start.getFullYear(), start.getMonth(), 1);
        }
        for (let i = effectiveMonths - 1; i >= 0; i--) {
            const date = new Date(startReference.getFullYear(), startReference.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthShort = date
                .toLocaleString('pt-BR', { month: 'short' })
                .replace('.', '');
            const receivablesRaw = await this.receivableRepo
                .createQueryBuilder('r')
                .select('SUM(r.amount)', 'total')
                .where('EXTRACT(MONTH FROM r."dueDate") = :month', { month })
                .andWhere('EXTRACT(YEAR FROM r."dueDate") = :year', { year })
                .andWhere('r.status::text = :status', { status: 'RECEBIDO' })
                .getRawOne();
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
                monthShort: monthShort.charAt(0).toUpperCase() + monthShort.slice(1),
                year,
                monthNumber: month,
                receivables: Number(receivablesRaw?.total) || 0,
                costs: Number(costsRaw?.total) || 0,
                expenses: Number(expensesRaw?.total) || 0,
            });
        }
        return data;
    }
    async getUserPresets(page, userId) {
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
    async createUserPreset(data) {
        console.log('🔖 [createUserPreset] Criando preset:', data);
        const newPreset = this.userPresetRepo.create(data);
        return this.userPresetRepo.save(newPreset);
    }
    async deleteUserPreset(id) {
        console.log('🔖 [deleteUserPreset] Deletando preset:', id);
        await this.userPresetRepo.delete(id);
        return { success: true };
    }
    async findAllExpenseTypes() {
        console.log('🏷️ [findAllExpenseTypes] Buscando tipos de despesa...');
        return this.expenseTypeRepo.find({ order: { name: 'ASC' } });
    }
    async createExpenseType(data) {
        console.log('🏷️ [createExpenseType] Criando tipo de despesa:', data);
        const newType = this.expenseTypeRepo.create(data);
        const saved = await this.expenseTypeRepo.save(newType);
        console.log('✅ [createExpenseType] Tipo criado! ID:', saved.id);
        return saved;
    }
    async updateExpenseType(id, data) {
        console.log('🏷️ [updateExpenseType] Atualizando tipo de despesa:', id);
        await this.expenseTypeRepo.update(id, data);
        return this.expenseTypeRepo.findOne({ where: { id } });
    }
    async deleteExpenseType(id) {
        console.log('🏷️ [deleteExpenseType] Deletando tipo de despesa:', id);
        await this.expenseTypeRepo.delete(id);
        return { success: true };
    }
    async exportOpportunitiesToCSV() {
        const opportunities = await this.opportunityRepo
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.customer', 'c')
            .select([
            'o.id', 'o.title', 'o.pipelineStage', 'o.estimatedValue',
            'o.createdAt', 'c.name', 'c.companyName'
        ])
            .orderBy('o.createdAt', 'DESC')
            .getMany();
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
    async exportLeads() {
        console.log('📤 [exportLeads] Exportando leads...');
        const opportunities = await this.opportunityRepo.find({ order: { createdAt: 'DESC' } });
        const fields = ['title', 'company', 'contactName', 'contactPhone', 'contactEmail', 'estimatedValue', 'pipelineStage'];
        const header = fields.join(',');
        const rows = opportunities.map(item => fields.map(field => `"${String(item[field] || '').replace(/"/g, '""')}"`).join(','));
        return {
            filename: `leads_${new Date().toISOString().split('T')[0]}.csv`,
            data: [header, ...rows].join('\n'),
            count: opportunities.length
        };
    }
    async importLeads(file) {
        console.log('📥 [importLeads] Importando leads...', file?.originalname);
        if (!file)
            throw new common_2.BadRequestException('Nenhum arquivo enviado');
        if (!file.originalname.toLowerCase().endsWith('.csv')) {
            throw new common_2.BadRequestException('Apenas arquivos CSV sao permitidos');
        }
        const content = file.buffer.toString('utf-8').replace(/^\uFEFF/, '');
        const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
        if (lines.length < 2)
            throw new common_2.BadRequestException('Arquivo CSV vazio ou invalido');
        const rawHeaders = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, '').replace(',', '').toLowerCase());
        console.log('📋 [importLeads] Cabeçalhos detectados:', rawHeaders);
        const imported = [];
        const errors = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line)
                continue;
            const values = line.split(';').map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            rawHeaders.forEach((header, index) => {
                row[header] = values[index] !== undefined ? values[index] : '';
            });
            try {
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
                const newLead = this.opportunityRepo.create(leadData);
                const saved = await this.opportunityRepo.save(newLead);
                imported.push({ ...leadData, id: saved.id });
            }
            catch (error) {
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
    async searchLeadsOnline(keywords) {
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
    async automateRecurringExpenses() {
        console.log('⏰ [Cron] Iniciando verificação automática de despesas recorrentes...');
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const recurringExpenses = await this.recurringExpenseRepo.find({
            where: { status: 'ATIVO' }
        });
        let generatedCount = 0;
        for (const rec of recurringExpenses) {
            const existingPayable = await this.payableRepo.findOne({
                where: {
                    recurringExpenseId: rec.id,
                }
            });
            let needsGeneration = false;
            if (!rec.lastGenerated) {
                needsGeneration = true;
            }
            else {
                const lastGenDate = new Date(rec.lastGenerated);
                if (lastGenDate.getMonth() + 1 < currentMonth || lastGenDate.getFullYear() < currentYear) {
                    needsGeneration = true;
                }
            }
            if (needsGeneration) {
                console.log(`🔄 [Cron] Gerando conta para recorrência: ${rec.description}`);
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
                });
                await this.payableRepo.save(newPayable);
                await this.recurringExpenseRepo.update(rec.id, {
                    lastGenerated: formattedDueDate
                });
                generatedCount++;
            }
        }
        if (generatedCount > 0) {
            console.log(`✅ [Cron] Automação concluída! ${generatedCount} novas contas a pagar geradas.`);
        }
        else {
            console.log('ℹ️ [Cron] Nenhuma nova conta recorrente precisou ser gerada hoje.');
        }
    }
};
exports.CrmService = CrmService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CrmService.prototype, "automateRecurringExpenses", null);
exports.CrmService = CrmService = CrmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(opportunity_entity_1.Opportunity)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(contract_entity_1.Contract)),
    __param(3, (0, typeorm_1.InjectRepository)(receivable_entity_1.Receivable)),
    __param(4, (0, typeorm_1.InjectRepository)(recurring_expense_entity_1.RecurringExpense)),
    __param(5, (0, typeorm_1.InjectRepository)(payable_entity_1.Payable)),
    __param(7, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __param(8, (0, typeorm_1.InjectRepository)(expense_type_entity_1.ExpenseType)),
    __param(9, (0, typeorm_1.InjectRepository)(user_preset_entity_1.UserPreset)),
    __param(10, (0, typeorm_1.InjectRepository)(cash_flow_forecast_entity_1.CashFlowForecast)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        receipts_service_1.ReceiptsService])
], CrmService);
//# sourceMappingURL=crm.service.js.map