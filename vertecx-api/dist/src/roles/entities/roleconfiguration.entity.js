"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roleconfiguration = void 0;
const typeorm_1 = require("typeorm");
const roles_entity_1 = require("./roles.entity");
const privileges_entity_1 = require("../../shared/entities/privileges.entity");
let Roleconfiguration = class Roleconfiguration {
};
exports.Roleconfiguration = Roleconfiguration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Roleconfiguration.prototype, "roleconfigurationid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Roleconfiguration.prototype, "roleid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Roleconfiguration.prototype, "permissionid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Roleconfiguration.prototype, "privilegeid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => roles_entity_1.Roles),
    (0, typeorm_1.JoinColumn)({ name: 'roleid' }),
    __metadata("design:type", roles_entity_1.Roles)
], Roleconfiguration.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Permissions),
    (0, typeorm_1.JoinColumn)({ name: 'permissionid' }),
    __metadata("design:type", Permissions)
], Roleconfiguration.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => privileges_entity_1.Privileges),
    (0, typeorm_1.JoinColumn)({ name: 'privilegeid' }),
    __metadata("design:type", privileges_entity_1.Privileges)
], Roleconfiguration.prototype, "privileges", void 0);
exports.Roleconfiguration = Roleconfiguration = __decorate([
    (0, typeorm_1.Entity)('roleconfiguration')
], Roleconfiguration);
//# sourceMappingURL=roleconfiguration.entity.js.map