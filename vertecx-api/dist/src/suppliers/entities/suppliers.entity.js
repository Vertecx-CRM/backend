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
exports.Suppliers = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("../../users/entities/users.entity");
let Suppliers = class Suppliers {
};
exports.Suppliers = Suppliers;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Suppliers.prototype, "supplierid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 120 }),
    __metadata("design:type", String)
], Suppliers.prototype, "servicetype", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 120 }),
    __metadata("design:type", String)
], Suppliers.prototype, "contactname", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, unique: true, length: 50 }),
    __metadata("design:type", String)
], Suppliers.prototype, "nit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, length: 200 }),
    __metadata("design:type", String)
], Suppliers.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], Suppliers.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => users_entity_1.Users, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userid' }),
    __metadata("design:type", users_entity_1.Users)
], Suppliers.prototype, "user", void 0);
exports.Suppliers = Suppliers = __decorate([
    (0, typeorm_1.Entity)('suppliers')
], Suppliers);
//# sourceMappingURL=suppliers.entity.js.map