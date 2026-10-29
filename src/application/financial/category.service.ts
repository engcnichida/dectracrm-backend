import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialCategory } from '../../domain/financial-category.entity';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(FinancialCategory)
    private categoryRepo: Repository<FinancialCategory>,
  ) {}

  async findAll(type?: 'RECEITA' | 'DESPESA') {
    const where = type ? { type, isActive: true } : { isActive: true };
    return this.categoryRepo.find({ where, order: { name: 'ASC' } });
  }

  async create(data: { name: string; type: 'RECEITA' | 'DESPESA'; description?: string }) {
    this.logger.log(` Criando categoria: ${data.name} (${data.type})`);
    
    const category = this.categoryRepo.create({
      ...data,
      isActive: true,
    });
    
    return this.categoryRepo.save(category);
  }

  async update(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    this.logger.log(`✏️ Atualizando categoria: ${id}`);
    
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    Object.assign(category, data);
    return this.categoryRepo.save(category);
  }

  async remove(id: string) {
    this.logger.log(`️ Removendo categoria: ${id}`);
    
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Soft delete: apenas desativa
    category.isActive = false;
    return this.categoryRepo.save(category);
  }
}