import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
export declare class PurchaseOrdersService {
    create(createPurchaseOrderDto: CreatePurchaseOrderDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updatePurchaseOrderDto: UpdatePurchaseOrderDto): string;
    remove(id: number): string;
}
