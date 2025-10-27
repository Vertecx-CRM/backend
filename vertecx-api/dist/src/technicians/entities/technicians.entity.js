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
exports.Technicians = void 0;
const roleconfiguration_entity_1 = require("../../roles/entities/roleconfiguration.entity");
const users_entity_1 = require("../../users/entities/users.entity");
const typeorm_1 = require("typeorm");
let Technicians = class Technicians {
};
exports.Technicians = Technicians;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Technicians.prototype, "technicianid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Technicians.prototype, "userid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Technicians.prototype, "roleconfigurationid", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.Users),
    (0, typeorm_1.JoinColumn)({ name: 'userid' }),
    __metadata("design:type", users_entity_1.Users)
], Technicians.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => roleconfiguration_entity_1.Roleconfiguration),
    (0, typeorm_1.JoinColumn)({ name: 'roleconfigurationid' }),
    __metadata("design:type", roleconfiguration_entity_1.Roleconfiguration)
], Technicians.prototype, "roleconfiguration", void 0);
exports.Technicians = Technicians = __decorate([
    (0, typeorm_1.Entity)('technicians')
], Technicians);
//# sourceMappingURL=technicians.entity.js.map