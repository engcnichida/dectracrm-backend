import { Repository } from 'typeorm';
import { FinancialCategory } from '../../domain/financial-category.entity';
export declare class CategoryService {
    private categoryRepo;
    private readonly logger;
    constructor(categoryRepo: Repository<FinancialCategory>);
    findAll(type?: 'RECEITA' | 'DESPESA'): Promise<FinancialCategory[]>;
    create(data: {
        name: string;
        type: 'RECEITA' | 'DESPESA';
        description?: string;
    }): Promise<FinancialCategory>;
    update(id: string, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<FinancialCategory>;
    remove(id: string): Promise<FinancialCategory>;
}
