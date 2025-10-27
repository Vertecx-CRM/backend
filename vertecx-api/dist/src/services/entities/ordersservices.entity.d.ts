import { States } from 'src/shared/entities/states.entity';
export declare class Ordersservices {
    ordersservicesid: number;
    date: Date;
    total: number;
    clientid: number;
    stateid: number;
    productorderid: number;
    technicalid: number;
    description: string;
    files: string;
    states: States;
}
