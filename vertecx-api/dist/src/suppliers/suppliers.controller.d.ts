import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(dto: CreateSupplierDto): Promise<import("./entities/suppliers.entity").Suppliers>;
    createBulk(dtos: CreateSupplierDto[]): Promise<import("./entities/suppliers.entity").Suppliers[]>;
    findAll(): Promise<import("./entities/suppliers.entity").Suppliers[]>;
    findOne(id: number): Promise<import("./entities/suppliers.entity").Suppliers>;
    update(id: number, dto: UpdateSupplierDto): Promise<import("./entities/suppliers.entity").Suppliers>;
    remove(id: number): Promise<void>;
}
