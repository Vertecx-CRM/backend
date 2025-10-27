import { Repository } from 'typeorm';
import { Suppliers } from './entities/suppliers.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Users } from 'src/users/entities/users.entity';
export declare class SuppliersService {
    private readonly repo;
    private readonly usersRepo;
    constructor(repo: Repository<Suppliers>, usersRepo: Repository<Users>);
    private ensureUserExists;
    private ensureNitUnique;
    create(dto: CreateSupplierDto): Promise<Suppliers>;
    createMany(dtos: CreateSupplierDto[]): Promise<Suppliers[]>;
    findAll(): Promise<Suppliers[]>;
    findOne(id: number): Promise<Suppliers>;
    update(id: number, dto: UpdateSupplierDto): Promise<Suppliers>;
    remove(id: number): Promise<void>;
}
