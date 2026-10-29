import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReceiptsService } from '../../application/receipts/receipts.service';
import { Response } from 'express';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments', 10, { limits: { fileSize: 2 * 1024 * 1024 } }))
  createReceipt(
    @Body() data: any,
    @UploadedFiles() files: any[],
  ) {
    return this.receiptsService.createReceipt(data, files);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.receiptsService.findAll({ type, status, startDate, endDate });
  }

  @Get('metrics')
  getMetrics() {
    return this.receiptsService.getReceiptMetrics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('attachments', 10, { limits: { fileSize: 2 * 1024 * 1024 } }))
  updateReceipt(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFiles() files: any[],
  ) {
    return this.receiptsService.updateReceipt(id, data, files);
  }

  @Delete(':id')
  deleteReceipt(@Param('id') id: string) {
    return this.receiptsService.deleteReceipt(id);
  }

  @Delete(':id/attachments/:index')
  removeAttachment(
    @Param('id') id: string,
    @Param('index') index: string,
  ) {
    return this.receiptsService.removeAttachment(id, parseInt(index));
  }

  @Get('last-from-supplier/:supplierId')
  findLastFromSupplier(@Param('supplierId') supplierId: string) {
    return this.receiptsService.findLastFromSupplier(supplierId);
  }
  
  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const receipt = await this.receiptsService.findOne(id);
    const pdfBuffer = await this.receiptsService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${receipt.receiptNumber}.pdf"`,
    });
    res.send(pdfBuffer);
  }

  @Get(':id/pdf/preview')
  async previewPdf(@Param('id') id: string, @Res() res: Response) {
    const receipt = await this.receiptsService.findOne(id);
    const pdfBuffer = await this.receiptsService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${receipt.receiptNumber}.pdf"`,
    });
    res.send(pdfBuffer);
  }}