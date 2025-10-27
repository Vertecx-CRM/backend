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
exports.Ordersservices = void 0;
const states_entity_1 = require("../../shared/entities/states.entity");
const typeorm_1 = require("typeorm");
let Ordersservices = class Ordersservices {
};
exports.Ordersservices = Ordersservices;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ordersservices.prototype, "ordersservicesid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Ordersservices.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Ordersservices.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Ordersservices.prototype, "clientid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Ordersservices.prototype, "stateid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Ordersservices.prototype, "productorderid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Ordersservices.prototype, "technicalid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Ordersservices.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Ordersservices.prototype, "files", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => states_entity_1.States),
    (0, typeorm_1.JoinColumn)({ name: 'stateid' }),
    __metadata("design:type", states_entity_1.States)
], Ordersservices.prototype, "states", void 0);
exports.Ordersservices = Ordersservices = __decorate([
    (0, typeorm_1.Entity)('ordersservices')
], Ordersservices);
//# sourceMappingURL=ordersservices.entity.js.map