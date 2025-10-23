import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchasesmanagement } from './entities/purchasesmanagement.entity';
import { CreatePurchasesmanagementDto } from './dto/create-purchasesmanagement.dto';
import { UpdatePurchasesmanagementDto } from './dto/update-purchasesmanagement.dto';

@Injectable()
export class PurchasesmanagementService {
  constructor(
    @InjectRepository(Purchasesmanagement)
    private readonly purchasesRepo: Repository<Purchasesmanagement>,
  ) {}

  async create(dto: CreatePurchasesmanagementDto) {
    const purchase = this.purchasesRepo.create(dto);
    return await this.purchasesRepo.save(purchase);
  }

  async findAll() {
    return await this.purchasesRepo.find({
      relations: ['states', 'suppliers'],
    });
  }

  async findOne(id: number) {
    const purchase = await this.purchasesRepo.findOne({
      where: { purchaseorderid: id },
      relations: ['states', 'suppliers'],
    });
    if (!purchase) throw new NotFoundException(`Purchase ${id} not found`);
    return purchase;
  }

  async update(id: number, dto: UpdatePurchasesmanagementDto) {
    const purchase = await this.findOne(id);
    Object.assign(purchase, dto);
    return await this.purchasesRepo.save(purchase);
  }

  async remove(id: number) {
    const purchase = await this.findOne(id);
    await this.purchasesRepo.remove(purchase);
    return { message: `Purchase ${id} deleted successfully` };
  }
}
