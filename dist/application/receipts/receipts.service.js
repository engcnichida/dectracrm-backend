"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ReceiptsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const receipt_entity_1 = require("../../domain/receipt.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
let ReceiptsService = ReceiptsService_1 = class ReceiptsService {
    constructor(receiptRepo) {
        this.receiptRepo = receiptRepo;
        this.logger = new common_1.Logger(ReceiptsService_1.name);
    }
    async findOne(id) {
        const receipt = await this.receiptRepo.findOne({ where: { id } });
        if (!receipt)
            throw new common_1.NotFoundException('Recibo não encontrado');
        return {
            ...receipt,
            city: this.cleanCity(receipt.city)
        };
    }
    cleanCity(city) {
        if (!city)
            return '';
        if (typeof city === 'string') {
            let cleaned = city.replace(/[{}"]/g, '').replace(/,,/g, ',').trim();
            if (cleaned === 'Goiânia')
                return 'Goiânia/GO';
            return cleaned;
        }
        return '';
    }
    async generateReceiptNumber() {
        const year = new Date().getFullYear();
        const lastReceipt = await this.receiptRepo
            .createQueryBuilder('r')
            .where('r.receiptNumber LIKE :prefix', { prefix: `REC-${year}-%` })
            .orderBy('r.receiptNumber', 'DESC')
            .getOne();
        let nextNumber = 1;
        if (lastReceipt) {
            const parts = lastReceipt.receiptNumber.split('-');
            nextNumber = parseInt(parts[2]) + 1;
        }
        return `REC-${year}-${String(nextNumber).padStart(4, '0')}`;
    }
    async createReceipt(data, files) {
        this.logger.log(' [createReceipt] Iniciando criação...');
        try {
            const receiptNumber = await this.generateReceiptNumber();
            const attachments = [];
            if (files && files.length > 0) {
                const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                for (const file of files) {
                    const fileName = `${receiptNumber}-${Date.now()}-${file.originalname}`;
                    const filePath = path.join(uploadDir, fileName);
                    fs.writeFileSync(filePath, file.buffer);
                    attachments.push(`/uploads/receipts/${fileName}`);
                }
            }
            const cleanData = {
                type: data.type,
                description: data.description,
                amount: parseFloat(data.amount) || 0,
                receiptDate: data.receiptDate,
                issuerName: data.issuerName,
                city: data.city === '' ? null : data.city,
                status: data.status || 'PENDENTE',
                paymentMethod: data.paymentMethod || 'PIX',
                receiptNumber: receiptNumber,
                issuerDocument: data.issuerDocument === '' ? null : data.issuerDocument,
                issuerAddress: data.issuerAddress === '' ? null : data.issuerAddress,
                linkedEntityType: data.linkedEntityType === '' ? null : data.linkedEntityType,
                linkedEntityId: data.linkedEntityId === '' ? null : data.linkedEntityId,
                notes: data.notes === '' ? null : data.notes,
                attachments: attachments.length > 0 ? attachments : null,
            };
            const receipt = this.receiptRepo.create(cleanData);
            const saved = await this.receiptRepo.save(receipt);
            this.logger.log(`✅ [createReceipt] Recibo ${receiptNumber} criado com sucesso!`);
            return saved;
        }
        catch (error) {
            this.logger.error('❌ [createReceipt] Erro ao criar recibo:', error.message);
            throw error;
        }
    }
    async findAll(filters) {
        const query = this.receiptRepo.createQueryBuilder('r');
        if (filters?.type)
            query.andWhere('r.type = :type', { type: filters.type });
        if (filters?.status)
            query.andWhere('r.status = :status', { status: filters.status });
        if (filters?.startDate)
            query.andWhere('r.receiptDate >= :startDate', { startDate: filters.startDate });
        if (filters?.endDate)
            query.andWhere('r.receiptDate <= :endDate', { endDate: filters.endDate });
        const receipts = await query.orderBy('r.receiptDate', 'DESC').getMany();
        return receipts.map(r => ({
            ...r,
            city: this.cleanCity(r.city)
        }));
    }
    async updateReceipt(id, data, files) {
        this.logger.log('🔄 [updateReceipt] Atualizando recibo...');
        const receipt = await this.receiptRepo.findOne({ where: { id } });
        if (!receipt)
            throw new common_1.NotFoundException('Recibo não encontrado');
        if (files && files.length > 0) {
            const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const attachments = receipt.attachments || [];
            for (const file of files) {
                const fileName = `${receipt.receiptNumber}-${Date.now()}-${file.originalname}`;
                const filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, file.buffer);
                attachments.push(`/uploads/receipts/${fileName}`);
            }
            data.attachments = attachments;
        }
        const cleanData = {};
        cleanData.type = data.type;
        cleanData.description = data.description;
        cleanData.amount = parseFloat(data.amount) || 0;
        cleanData.receiptDate = data.receiptDate;
        cleanData.issuerName = data.issuerName;
        cleanData.status = data.status;
        cleanData.paymentMethod = data.paymentMethod;
        cleanData.notes = data.notes === '' ? null : data.notes;
        cleanData.issuerDocument = data.issuerDocument === '' ? null : data.issuerDocument;
        cleanData.issuerAddress = data.issuerAddress === '' ? null : data.issuerAddress;
        cleanData.linkedEntityType = data.linkedEntityType === '' ? null : data.linkedEntityType;
        cleanData.linkedEntityId = data.linkedEntityId === '' ? null : data.linkedEntityId;
        cleanData.city = data.city === '' ? null : this.cleanCity(data.city);
        Object.assign(receipt, cleanData);
        try {
            const saved = await this.receiptRepo.save(receipt);
            this.logger.log(`✅ [updateReceipt] Recibo ${receipt.receiptNumber} atualizado com sucesso!`);
            return saved;
        }
        catch (error) {
            this.logger.error('❌ [updateReceipt] Erro ao atualizar recibo:', error.message);
            throw error;
        }
    }
    async deleteReceipt(id) {
        const receipt = await this.findOne(id);
        if (receipt.attachments) {
            for (const attachmentPath of receipt.attachments) {
                const fullPath = path.join(process.cwd(), attachmentPath);
                if (fs.existsSync(fullPath))
                    fs.unlinkSync(fullPath);
            }
        }
        return this.receiptRepo.remove(receipt);
    }
    async removeAttachment(receiptId, attachmentIndex) {
        const receipt = await this.findOne(receiptId);
        if (!receipt.attachments || !receipt.attachments[attachmentIndex]) {
            throw new common_1.BadRequestException('Comprovante não encontrado');
        }
        const attachmentPath = receipt.attachments[attachmentIndex];
        const fullPath = path.join(process.cwd(), attachmentPath);
        if (fs.existsSync(fullPath))
            fs.unlinkSync(fullPath);
        receipt.attachments.splice(attachmentIndex, 1);
        return this.receiptRepo.save(receipt);
    }
    async generatePdf(id) {
        const receipt = await this.findOne(id);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const logoPath = path.join(process.cwd(), 'logo-dectra.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 45, { width: 60 });
                doc.moveDown(2.5);
            }
            else {
                doc.moveDown(1);
            }
            doc.fontSize(20).font('Helvetica-Bold').text('RECIBO DE PAGAMENTO', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica').text(`Nº ${receipt.receiptNumber}`, { align: 'center' });
            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#333');
            doc.moveDown(1);
            const valueInBRL = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(Number(receipt.amount));
            doc.fontSize(14).font('Helvetica-Bold').text(`VALOR: ${valueInBRL}`, { align: 'right' });
            doc.moveDown(1);
            doc.fontSize(11).font('Helvetica-Bold').text('RECEBI(EMOS) de ');
            doc.font('Helvetica').text('DECTRA TECNOLOGIA LTDA', { continued: true });
            doc.font('Helvetica-Bold').text(' - CNPJ: 53.450.778/0001-69');
            doc.moveDown(0.3);
            doc.font('Helvetica').text('a importância supra de ');
            doc.font('Helvetica-Bold').text(`${valueInBRL}`, { continued: true });
            doc.font('Helvetica').text(` (${this.extenso(Number(receipt.amount))})`);
            doc.moveDown(0.5);
            doc.font('Helvetica').text(`referente a: ${receipt.description}`);
            doc.moveDown(1);
            doc.fontSize(11).font('Helvetica-Bold').text('DADOS DO RECEBEDOR:');
            doc.moveDown(0.3);
            doc.font('Helvetica').text(`Nome: ${receipt.issuerName}`);
            if (receipt.issuerDocument) {
                doc.text(`CPF/CNPJ: ${receipt.issuerDocument}`);
            }
            if (receipt.issuerAddress) {
                doc.text(`Endereço: ${receipt.issuerAddress}`);
            }
            doc.moveDown(0.5);
            const typeLabel = {
                PRO_LABORE: 'PRÓ-LABORE',
                PJ: 'PESSOA JURÍDICA',
                RESSARCIMENTO: 'RESSARCIMENTO DE DESPESA',
            }[receipt.type] || receipt.type;
            doc.font('Helvetica-Bold').text(`TIPO: ${typeLabel}`);
            doc.moveDown(1);
            const dateStr = new Date(receipt.receiptDate).toLocaleDateString('pt-BR');
            const local = receipt.city || '________________________';
            doc.font('Helvetica').text(`Local e Data: ${local}, ${dateStr}`, { align: 'right' });
            doc.moveDown(2);
            doc.moveTo(150, doc.y).lineTo(450, doc.y).stroke('#333');
            doc.moveDown(0.3);
            doc.fontSize(10).text(receipt.issuerName, { align: 'center' });
            if (receipt.issuerDocument) {
                doc.text(receipt.issuerDocument, { align: 'center' });
            }
            doc.fontSize(8).font('Helvetica-Oblique').text(`Recibo gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
            doc.end();
        });
    }
    extenso(value) {
        const intPart = Math.floor(value);
        const decPart = Math.round((value - intPart) * 100);
        const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
        const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
        const hundreds = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
        const convertHundreds = (n) => {
            if (n === 0)
                return '';
            if (n === 100)
                return 'cem';
            if (n < 20)
                return units[n];
            if (n < 100) {
                const t = Math.floor(n / 10);
                const u = n % 10;
                return u === 0 ? tens[t] : `${tens[t]} e ${units[u]}`;
            }
            const h = Math.floor(n / 100);
            const rest = n % 100;
            return rest === 0 ? hundreds[h] : `${hundreds[h]} e ${convertHundreds(rest)}`;
        };
        const convertThousands = (n) => {
            if (n === 0)
                return '';
            const thousands = Math.floor(n / 1000);
            const rest = n % 1000;
            let result = '';
            if (thousands === 1)
                result = 'mil';
            else if (thousands > 1)
                result = `${convertHundreds(thousands)} mil`;
            if (rest > 0)
                result += ` ${convertHundreds(rest)}`;
            return result.trim();
        };
        let result = '';
        if (intPart > 0) {
            result = convertThousands(intPart);
            result += intPart === 1 ? ' real' : ' reais';
        }
        if (decPart > 0) {
            if (result)
                result += ' e ';
            result += convertHundreds(decPart);
            result += decPart === 1 ? ' centavo' : ' centavos';
        }
        return result || 'zero reais';
    }
    async getReceiptMetrics() {
        const total = await this.receiptRepo.count();
        const totalValue = await this.receiptRepo.createQueryBuilder('r').select('SUM(r.amount)', 'total').where('r.status = :status', { status: receipt_entity_1.ReceiptStatus.PAGO }).getRawOne();
        const byType = await this.receiptRepo.createQueryBuilder('r').select('r.type', 'type').addSelect('COUNT(*)', 'count').addSelect('SUM(r.amount)', 'total').groupBy('r.type').getRawMany();
        return { total, totalValuePaid: Number(totalValue?.total || 0), byType };
    }
    async findLastFromSupplier(supplierId) {
        const lastReceipt = await this.receiptRepo.findOne({
            where: { supplierId },
            order: { createdAt: 'DESC' },
            relations: ['supplier'],
        });
        if (!lastReceipt) {
            return null;
        }
        return lastReceipt;
    }
};
exports.ReceiptsService = ReceiptsService;
exports.ReceiptsService = ReceiptsService = ReceiptsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(receipt_entity_1.Receipt)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReceiptsService);
//# sourceMappingURL=receipts.service.js.map