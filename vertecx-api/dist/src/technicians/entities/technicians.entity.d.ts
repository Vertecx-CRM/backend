import { Roleconfiguration } from 'src/roles/entities/roleconfiguration.entity';
import { Users } from 'src/users/entities/users.entity';
export declare class Technicians {
    technicianid: number;
    userid: number;
    roleconfigurationid: number;
    users: Users;
    roleconfiguration: Roleconfiguration;
}
