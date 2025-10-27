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
exports.Servicerequests = void 0;
const states_entity_1 = require("../../shared/entities/states.entity");
const typeorm_1 = require("typeorm");
const services_entity_1 = require("./services.entity");
let Servicerequests = class Servicerequests {
};
exports.Servicerequests = Servicerequests;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Servicerequests.prototype, "clientid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Servicerequests.prototype, "scheduledat", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Servicerequests.prototype, "serviceid", void 0);
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Servicerequests.prototype, "servicerequestid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Servicerequests.prototype, "createdat", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Servicerequests.prototype, "stateid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Servicerequests.prototype, "servicetype", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Servicerequests.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => states_entity_1.States),
    (0, typeorm_1.JoinColumn)({ name: 'stateid' }),
    __metadata("design:type", states_entity_1.States)
], Servicerequests.prototype, "states", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => services_entity_1.Services),
    (0, typeorm_1.JoinColumn)({ name: 'serviceid' }),
    __metadata("design:type", services_entity_1.Services)
], Servicerequests.prototype, "services", void 0);
exports.Servicerequests = Servicerequests = __decorate([
    (0, typeorm_1.Entity)('servicerequests')
], Servicerequests);
//# sourceMappingURL=servicerequests.entity.js.map