import { Repository } from 'typeorm';
import { Supplier } from '../../domain/supplier.entity';
export declare class suppliersService {
    private supplierRepo;
    private readonly logger;
    constructor(supplierRepo: Repository<Supplier>);
    findAll(): Promise<Supplier[]>;
    findOne(id: string): Promise<Supplier>;
    create(data: Partial<Supplier>): Promise<Supplier>;
    update(id: string, data: Partial<Supplier>): Promise<Supplier>;
    remove(id: string): Promise<Supplier>;
}
