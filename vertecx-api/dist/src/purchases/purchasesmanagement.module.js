"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesmanagementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const purchasesmanagement_service_1 = require("./purchasesmanagement.service");
const purchasesmanagement_controller_1 = require("./purchasesmanagement.controller");
const purchasesmanagement_entity_1 = require("./entities/purchasesmanagement.entity");
const states_entity_1 = require("../shared/entities/states.entity");
const suppliers_entity_1 = require("../suppliers/entities/suppliers.entity");
let PurchasesmanagementModule = class PurchasesmanagementModule {
};
exports.PurchasesmanagementModule = PurchasesmanagementModule;
exports.PurchasesmanagementModule = PurchasesmanagementModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([purchasesmanagement_entity_1.Purchasesmanagement, states_entity_1.States, suppliers_entity_1.Suppliers])],
        controllers: [purchasesmanagement_controller_1.PurchasesmanagementController],
        providers: [purchasesmanagement_service_1.PurchasesmanagementService],
    })
], PurchasesmanagementModule);
//# sourceMappingURL=purchasesmanagement.module.js.map