import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    create(createServiceDto: CreateServiceDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateServiceDto: UpdateServiceDto): string;
    remove(id: string): string;
}
