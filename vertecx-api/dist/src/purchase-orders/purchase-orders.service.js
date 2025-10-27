"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
let PurchaseOrdersService = class PurchaseOrdersService {
    create(createPurchaseOrderDto) {
        return 'This action adds a new purchaseOrder';
    }
    findAll() {
        return `This action returns all purchaseOrders`;
    }
    findOne(id) {
        return `This action returns a #${id} purchaseOrder`;
    }
    update(id, updatePurchaseOrderDto) {
        return `This action updates a #${id} purchaseOrder`;
    }
    remove(id) {
        return `This action removes a #${id} purchaseOrder`;
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)()
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map