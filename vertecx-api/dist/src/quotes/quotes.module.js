"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesModule = void 0;
const common_1 = require("@nestjs/common");
const quotes_service_1 = require("./quotes.service");
const quotes_controller_1 = require("./quotes.controller");
const quotes_entity_1 = require("./entities/quotes.entity");
const typeorm_1 = require("@nestjs/typeorm");
const ordersservices_entity_1 = require("../services/entities/ordersservices.entity");
const states_entity_1 = require("../shared/entities/states.entity");
let QuotesModule = class QuotesModule {
};
exports.QuotesModule = QuotesModule;
exports.QuotesModule = QuotesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([quotes_entity_1.Quotes, ordersservices_entity_1.Ordersservices, states_entity_1.States])],
        controllers: [quotes_controller_1.QuotesController],
        providers: [quotes_service_1.QuotesService],
        exports: [quotes_service_1.QuotesService],
    })
], QuotesModule);
//# sourceMappingURL=quotes.module.js.map