import { States } from 'src/shared/entities/states.entity';
import { Services } from './services.entity';
export declare class Servicerequests {
    clientid: number;
    scheduledat: Date;
    serviceid: number;
    servicerequestid: number;
    createdat: Date;
    stateid: number;
    servicetype: string;
    description: string;
    states: States;
    services: Services;
}
