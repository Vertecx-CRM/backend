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
exports.Quotes = void 0;
const ordersservices_entity_1 = require("../../services/entities/ordersservices.entity");
const states_entity_1 = require("../../shared/entities/states.entity");
const typeorm_1 = require("typeorm");
let Quotes = class Quotes {
};
exports.Quotes = Quotes;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Quotes.prototype, "quotesid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Quotes.prototype, "ordersservicesid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Quotes.prototype, "statesid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Quotes.prototype, "quotedata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Quotes.prototype, "observation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ordersservices_entity_1.Ordersservices),
    (0, typeorm_1.JoinColumn)({ name: 'ordersservicesid' }),
    __metadata("design:type", ordersservices_entity_1.Ordersservices)
], Quotes.prototype, "ordersservices", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => states_entity_1.States),
    (0, typeorm_1.JoinColumn)({ name: 'quotesid' }),
    __metadata("design:type", states_entity_1.States)
], Quotes.prototype, "states", void 0);
exports.Quotes = Quotes = __decorate([
    (0, typeorm_1.Entity)('quotes')
], Quotes);
//# sourceMappingURL=quotes.entity.js.map