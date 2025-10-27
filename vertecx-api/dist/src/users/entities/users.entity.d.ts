import { States } from 'src/shared/entities/states.entity';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';
export declare class Users {
    createat: Date;
    stateid: number;
    updateat: Date;
    typeid: number;
    userid: number;
    phone: string;
    documentnumber: string;
    image: string;
    name: string;
    lastname: string;
    email: string;
    password: string;
    states: States;
    typeofdocuments: Typeofdocuments;
}
