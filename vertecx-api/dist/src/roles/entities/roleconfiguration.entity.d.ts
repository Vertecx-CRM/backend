import { Roles } from './roles.entity';
import { Privileges } from 'src/shared/entities/privileges.entity';
export declare class Roleconfiguration {
    roleconfigurationid: number;
    roleid: number;
    permissionid: number;
    privilegeid: number;
    roles: Roles;
    permissions: Permissions;
    privileges: Privileges;
}
