import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
export declare class TechniciansController {
    private readonly techniciansService;
    constructor(techniciansService: TechniciansService);
    create(createTechnicianDto: CreateTechnicianDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateTechnicianDto: UpdateTechnicianDto): string;
    remove(id: string): string;
}
