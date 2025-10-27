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
exports.Salesdetail = void 0;
const typeorm_1 = require("typeorm");
const sales_entity_1 = require("./sales.entity");
const products_entity_1 = require("../../products/entities/products.entity");
let Salesdetail = class Salesdetail {
};
exports.Salesdetail = Salesdetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Salesdetail.prototype, "saledetailid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Salesdetail.prototype, "saleid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Salesdetail.prototype, "productid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Salesdetail.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Salesdetail.prototype, "unitprice", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Salesdetail.prototype, "linetotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Salesdetail.prototype, "discountpercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Salesdetail.prototype, "discountamount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Salesdetail.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_entity_1.Sales),
    (0, typeorm_1.JoinColumn)({ name: 'saleid' }),
    __metadata("design:type", sales_entity_1.Sales)
], Salesdetail.prototype, "sales", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => products_entity_1.Products),
    (0, typeorm_1.JoinColumn)({ name: 'productid' }),
    __metadata("design:type", products_entity_1.Products)
], Salesdetail.prototype, "products", void 0);
exports.Salesdetail = Salesdetail = __decorate([
    (0, typeorm_1.Entity)('salesdetail')
], Salesdetail);
//# sourceMappingURL=salesdetail.entity.js.map