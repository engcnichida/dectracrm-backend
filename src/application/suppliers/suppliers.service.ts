import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../domain/supplier.entity';

@Injectable()
export class suppliersService {
  private readonly logger = new Logger(suppliersService.name);

  constructor(
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
  ) {}

  async findAll() {
    return this.supplierRepo.find({
      where: { active: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Prestador não encontrado');
    return supplier;
  }

  async create(data: Partial<Supplier>) {
    const supplier = this.supplierRepo.create(data);
    const saved = await this.supplierRepo.save(supplier);
    this.logger.log(`✅ Prestador criado: ${saved.name}`);
    return saved;
  }

  async update(id: string, data: Partial<Supplier>) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, data);
    return this.supplierRepo.save(supplier);
  }

  async remove(id: string) {
    const supplier = await this.findOne(id);
    supplier.active = false; // Soft delete
    return this.supplierRepo.save(supplier);
  }
}