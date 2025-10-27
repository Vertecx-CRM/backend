"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppoimentsModule = void 0;
const common_1 = require("@nestjs/common");
const appoiments_service_1 = require("./appoiments.service");
const appoiments_controller_1 = require("./appoiments.controller");
let AppoimentsModule = class AppoimentsModule {
};
exports.AppoimentsModule = AppoimentsModule;
exports.AppoimentsModule = AppoimentsModule = __decorate([
    (0, common_1.Module)({
        controllers: [appoiments_controller_1.AppoimentsController],
        providers: [appoiments_service_1.AppoimentsService],
    })
], AppoimentsModule);
//# sourceMappingURL=appoiments.module.js.map