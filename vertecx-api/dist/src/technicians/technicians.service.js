"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechniciansService = void 0;
const common_1 = require("@nestjs/common");
let TechniciansService = class TechniciansService {
    create(createTechnicianDto) {
        return 'This action adds a new technician';
    }
    findAll() {
        return `This action returns all technicians`;
    }
    findOne(id) {
        return `This action returns a #${id} technician`;
    }
    update(id, updateTechnicianDto) {
        return `This action updates a #${id} technician`;
    }
    remove(id) {
        return `This action removes a #${id} technician`;
    }
};
exports.TechniciansService = TechniciansService;
exports.TechniciansService = TechniciansService = __decorate([
    (0, common_1.Injectable)()
], TechniciansService);
//# sourceMappingURL=technicians.service.js.map