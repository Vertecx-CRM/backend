import { States } from 'src/shared/entities/states.entity';
import { Users } from 'src/users/entities/users.entity';
export declare class Customers {
    customerid: number;
    userid: number;
    stateid: number;
    customeraddress: string;
    customercity: string;
    customerzipcode: string;
    users: Users;
    states: States;
}
