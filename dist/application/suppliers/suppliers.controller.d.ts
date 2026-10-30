import { suppliersService } from './suppliers.service';
export declare class suppliersController {
    private readonly suppliersService;
    constructor(suppliersService: suppliersService);
    findAll(): Promise<import("../../domain/supplier.entity").Supplier[]>;
    findOne(id: string): Promise<import("../../domain/supplier.entity").Supplier>;
    create(data: any): Promise<import("../../domain/supplier.entity").Supplier>;
    update(id: string, data: any): Promise<import("../../domain/supplier.entity").Supplier>;
    remove(id: string): Promise<import("../../domain/supplier.entity").Supplier>;
}
