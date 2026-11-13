import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt, ReceiptType, ReceiptStatus } from '../../domain/receipt.entity';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    @InjectRepository(Receipt)
    private receiptRepo: Repository<Receipt>,
  ) {}

  // ✅ Método findOne que estava faltando
  async findOne(id: string) {
    const receipt = await this.receiptRepo.findOne({ where: { id } });
    if (!receipt) throw new NotFoundException('Recibo não encontrado');
    return {
      ...receipt,
      city: this.cleanCity(receipt.city)
    };
  }

  // Função para limpar dados sujos
  private cleanCity(city: any): string {
    if (!city) return '';
    if (typeof city === 'string') {
      let cleaned = city.replace(/[{}"]/g, '').replace(/,,/g, ',').trim();
      if (cleaned === 'Goiânia') return 'Goiânia/GO';
      return cleaned;
    }
    return '';
  }

  private async generateReceiptNumber(): Promise<string> {
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

  async createReceipt(data: any, files?: any[]) {
    this.logger.log(' [createReceipt] Iniciando criação...');
    
    try {
      const receiptNumber = await this.generateReceiptNumber();
      const attachments: string[] = [];

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

    } catch (error: any) {
      this.logger.error('❌ [createReceipt] Erro ao criar recibo:', error.message);
      throw error;
    }
  }

  async findAll(filters?: { type?: string; status?: string; startDate?: string; endDate?: string }) {
    const query = this.receiptRepo.createQueryBuilder('r');
    if (filters?.type) query.andWhere('r.type = :type', { type: filters.type });
    if (filters?.status) query.andWhere('r.status = :status', { status: filters.status });
    if (filters?.startDate) query.andWhere('r.receiptDate >= :startDate', { startDate: filters.startDate });
    if (filters?.endDate) query.andWhere('r.receiptDate <= :endDate', { endDate: filters.endDate });
    
    const receipts = await query.orderBy('r.receiptDate', 'DESC').getMany();
    
    return receipts.map(r => ({
      ...r,
      city: this.cleanCity(r.city)
    }));
  }

  async updateReceipt(id: string, data: any, files?: any[]) {
    this.logger.log(`🔄 [updateReceipt] Atualizando recibo ${id}...`);
    
    const receipt = await this.receiptRepo.findOne({ where: { id } });
    if (!receipt) throw new NotFoundException('Recibo não encontrado');
    
    // 1. Processar upload de arquivos (se houver)
    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      const attachments = receipt.attachments || [];
      for (const file of files) {
        const fileName = `${receipt.receiptNumber || 'REC'}-${Date.now()}-${file.originalname}`;
        fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);
        attachments.push(`/uploads/receipts/${fileName}`);
      }
      data.attachments = attachments;
    }

    // 2. ✅ CORREÇÃO INFALÍVEL: Usar .update() direto no repositório
    const updatePayload: any = {};
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.amount !== undefined) updatePayload.amount = data.amount;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.supplierId !== undefined) updatePayload.supplierId = data.supplierId;
    if (data.city !== undefined) updatePayload.city = data.city;
    if (data.attachments !== undefined) updatePayload.attachments = data.attachments;
    
    // Correção de fuso horário para as datas
    if (data.issueDate !== undefined) {
      updatePayload.receiptDate = new Date(data.issueDate + 'T12:00:00');
    }
    if (data.dueDate !== undefined) {
      updatePayload.dueDate = new Date(data.dueDate + 'T12:00:00');
    }

    // Executa a atualização no banco
    await this.receiptRepo.update(id, updatePayload);
    
    this.logger.log(`✅ [updateReceipt] Recibo ${id} atualizado com sucesso!`);
    return this.receiptRepo.findOne({ where: { id } });
  }

  async deleteReceipt(id: string) {
    const receipt = await this.findOne(id);
    if (receipt.attachments) {
      for (const attachmentPath of receipt.attachments) {
        const fullPath = path.join(process.cwd(), attachmentPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }
    return this.receiptRepo.remove(receipt);
  }

  async removeAttachment(receiptId: string, attachmentIndex: number) {
    const receipt = await this.findOne(receiptId);
    if (!receipt.attachments || !receipt.attachments[attachmentIndex]) {
      throw new BadRequestException('Comprovante não encontrado');
    }
    const attachmentPath = receipt.attachments[attachmentIndex];
    const fullPath = path.join(process.cwd(), attachmentPath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    
    receipt.attachments.splice(attachmentIndex, 1);
    return this.receiptRepo.save(receipt);
  }

  async generatePdf(id: string): Promise<Buffer> {
      const receipt = await this.receiptRepo.findOne({ 
        where: { id }, 
        relations: ['supplier'] // ✅ Isso força o TypeORM a trazer os dados do prestador, incluindo o CNPJ
      });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const logoPath = path.join(process.cwd(), 'logo-dectra.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 60 });
        doc.moveDown(2.5); 
      } else {
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

      // ✅ CORREÇÃO 1: Prioriza o nome do prestador vinculado (que atualiza dinamicamente)
      const nomeRecebedor = receipt.supplier?.name || receipt.issuerName || 'Não informado';
      doc.font('Helvetica').text(`Nome: ${nomeRecebedor}`);
      
      // ✅ CORREÇÃO 2: Pega o CPF/CNPJ do prestador vinculado
      const docIdentificacao = receipt.supplier?.cnpj || receipt.issuerDocument;
      if (docIdentificacao) {
        doc.text(`CPF/CNPJ: ${docIdentificacao}`);
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

      // ✅ CORREÇÃO: Formata a data manualmente para EVITAR o bug de fuso horário (1 dia a menos)
      let dateStr = '__/__/____';
      if (receipt.receiptDate) {
        // Converte para string ISO e pega apenas a parte da data (YYYY-MM-DD)
        const dateObj = new Date(receipt.receiptDate);
        const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
        dateStr = adjustedDate.toLocaleDateString('pt-BR');
      }

      const local = receipt.city || '________________________';
      doc.font('Helvetica').text(`${local}, ${dateStr}`, { align: 'right' });
      doc.moveDown(2);

      doc.moveTo(150, doc.y).lineTo(450, doc.y).stroke('#333');
      doc.moveDown(0.3);
      
      // Assinatura com o nome correto
      doc.fontSize(10).text(nomeRecebedor, { align: 'center' });
      if (docIdentificacao) {
        doc.text(docIdentificacao, { align: 'center' });
      }

      doc.fontSize(8).font('Helvetica-Oblique').text(
        `Recibo gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}`,
        { align: 'center' }
      );

      doc.end();
    });
  }

  private extenso(value: number): string {
    const intPart = Math.floor(value);
    const decPart = Math.round((value - intPart) * 100);
    const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const hundreds = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    const convertHundreds = (n: number): string => {
      if (n === 0) return '';
      if (n === 100) return 'cem';
      if (n < 20) return units[n];
      if (n < 100) {
        const t = Math.floor(n / 10);
        const u = n % 10;
        return u === 0 ? tens[t] : `${tens[t]} e ${units[u]}`;
      }
      const h = Math.floor(n / 100);
      const rest = n % 100;
      return rest === 0 ? hundreds[h] : `${hundreds[h]} e ${convertHundreds(rest)}`;
    };

    const convertThousands = (n: number): string => {
      if (n === 0) return '';
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;
      let result = '';
      if (thousands === 1) result = 'mil';
      else if (thousands > 1) result = `${convertHundreds(thousands)} mil`;
      if (rest > 0) result += ` ${convertHundreds(rest)}`;
      return result.trim();
    };

    let result = '';
    if (intPart > 0) {
      result = convertThousands(intPart);
      result += intPart === 1 ? ' real' : ' reais';
    }
    if (decPart > 0) {
      if (result) result += ' e ';
      result += convertHundreds(decPart);
      result += decPart === 1 ? ' centavo' : ' centavos';
    }
    return result || 'zero reais';
  }

  async getReceiptMetrics() {
    const total = await this.receiptRepo.count();
    const totalValue = await this.receiptRepo.createQueryBuilder('r').select('SUM(r.amount)', 'total').where('r.status = :status', { status: ReceiptStatus.PAGO }).getRawOne();
    const byType = await this.receiptRepo.createQueryBuilder('r').select('r.type', 'type').addSelect('COUNT(*)', 'count').addSelect('SUM(r.amount)', 'total').groupBy('r.type').getRawMany();
    return { total, totalValuePaid: Number(totalValue?.total || 0), byType };
  }
  async findLastFromSupplier(supplierId: string) {
  const lastReceipt = await this.receiptRepo.findOne({
    where: { supplierId },
    order: { createdAt: 'DESC' },
    relations: ['supplier'],
  });
  
  if (!lastReceipt) {
    return null; // Nunca emitiu recibo para esse prestador
  }
  
  return lastReceipt;
}
}