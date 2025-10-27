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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppoimentsController = void 0;
const common_1 = require("@nestjs/common");
const appoiments_service_1 = require("./appoiments.service");
const create_appoiment_dto_1 = require("./dto/create-appoiment.dto");
const update_appoiment_dto_1 = require("./dto/update-appoiment.dto");
let AppoimentsController = class AppoimentsController {
    constructor(appoimentsService) {
        this.appoimentsService = appoimentsService;
    }
    create(createAppoimentDto) {
        return this.appoimentsService.create(createAppoimentDto);
    }
    findAll() {
        return this.appoimentsService.findAll();
    }
    findOne(id) {
        return this.appoimentsService.findOne(+id);
    }
    update(id, updateAppoimentDto) {
        return this.appoimentsService.update(+id, updateAppoimentDto);
    }
    remove(id) {
        return this.appoimentsService.remove(+id);
    }
};
exports.AppoimentsController = AppoimentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appoiment_dto_1.CreateAppoimentDto]),
    __metadata("design:returntype", void 0)
], AppoimentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppoimentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppoimentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_appoiment_dto_1.UpdateAppoimentDto]),
    __metadata("design:returntype", void 0)
], AppoimentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppoimentsController.prototype, "remove", null);
exports.AppoimentsController = AppoimentsController = __decorate([
    (0, common_1.Controller)('appoiments'),
    __metadata("design:paramtypes", [appoiments_service_1.AppoimentsService])
], AppoimentsController);
//# sourceMappingURL=appoiments.controller.js.map