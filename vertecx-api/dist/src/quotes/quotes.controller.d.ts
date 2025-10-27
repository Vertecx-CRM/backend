import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    create(createQuoteDto: CreateQuoteDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateQuoteDto: UpdateQuoteDto): string;
    remove(id: string): string;
}
