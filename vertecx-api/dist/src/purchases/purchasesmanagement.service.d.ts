import { Repository } from 'typeorm';
import { Purchasesmanagement } from './entities/purchasesmanagement.entity';
import { CreatePurchasesmanagementDto } from './dto/create-purchasesmanagement.dto';
import { UpdatePurchasesmanagementDto } from './dto/update-purchasesmanagement.dto';
export declare class PurchasesmanagementService {
    private readonly purchasesRepo;
    constructor(purchasesRepo: Repository<Purchasesmanagement>);
    create(dto: CreatePurchasesmanagementDto): Promise<Purchasesmanagement>;
    findAll(): Promise<Purchasesmanagement[]>;
    findOne(id: number): Promise<Purchasesmanagement>;
    update(id: number, dto: UpdatePurchasesmanagementDto): Promise<Purchasesmanagement>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
