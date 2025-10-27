import { Ordersservices } from 'src/services/entities/ordersservices.entity';
import { States } from 'src/shared/entities/states.entity';
export declare class Quotes {
    quotesid: number;
    ordersservicesid: number;
    statesid: number;
    quotedata: string;
    observation: string;
    ordersservices: Ordersservices;
    states: States;
}
