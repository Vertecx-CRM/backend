import { CreatePurchasesmanagementDto } from './dto/create-purchasesmanagement.dto';
import { UpdatePurchasesmanagementDto } from './dto/update-purchasesmanagement.dto';
import { Purchasesmanagement } from './entities/purchasesmanagement.entity';
import { PurchasesmanagementService } from './purchasesmanagement.service';
export declare class PurchasesmanagementController {
    private readonly service;
    constructor(service: PurchasesmanagementService);
    create(dto: CreatePurchasesmanagementDto): Promise<Purchasesmanagement>;
    findAll(): Promise<Purchasesmanagement[]>;
    findOne(id: number): Promise<Purchasesmanagement>;
    update(id: number, dto: UpdatePurchasesmanagementDto): Promise<Purchasesmanagement>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
