import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    create(createRequestDto: CreateRequestDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateRequestDto: UpdateRequestDto): string;
    remove(id: string): string;
}
