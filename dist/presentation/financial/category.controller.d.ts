import { CategoryService } from '../../application/financial/category.service';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    findAll(type?: 'RECEITA' | 'DESPESA'): Promise<import("../../domain/financial-category.entity").FinancialCategory[]>;
    create(data: {
        name: string;
        type: 'RECEITA' | 'DESPESA';
        description?: string;
    }): Promise<import("../../domain/financial-category.entity").FinancialCategory>;
    update(id: string, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<import("../../domain/financial-category.entity").FinancialCategory>;
    remove(id: string): Promise<import("../../domain/financial-category.entity").FinancialCategory>;
}
