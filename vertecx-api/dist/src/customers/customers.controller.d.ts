import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateCustomerDto: UpdateCustomerDto): string;
    remove(id: string): string;
}
