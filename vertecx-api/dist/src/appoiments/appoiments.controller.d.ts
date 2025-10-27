import { AppoimentsService } from './appoiments.service';
import { CreateAppoimentDto } from './dto/create-appoiment.dto';
import { UpdateAppoimentDto } from './dto/update-appoiment.dto';
export declare class AppoimentsController {
    private readonly appoimentsService;
    constructor(appoimentsService: AppoimentsService);
    create(createAppoimentDto: CreateAppoimentDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateAppoimentDto: UpdateAppoimentDto): string;
    remove(id: string): string;
}
