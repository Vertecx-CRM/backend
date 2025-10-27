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
exports.TechnicianCertifications = void 0;
const typeorm_1 = require("typeorm");
const technicians_entity_1 = require("./technicians.entity");
const certifications_entity_1 = require("../../shared/entities/certifications.entity");
const states_entity_1 = require("../../shared/entities/states.entity");
let TechnicianCertifications = class TechnicianCertifications {
};
exports.TechnicianCertifications = TechnicianCertifications;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TechnicianCertifications.prototype, "technician_certification_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], TechnicianCertifications.prototype, "technicianid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], TechnicianCertifications.prototype, "certificationid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TechnicianCertifications.prototype, "uploaded_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], TechnicianCertifications.prototype, "stateid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TechnicianCertifications.prototype, "file_path", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => technicians_entity_1.Technicians),
    (0, typeorm_1.JoinColumn)({ name: 'technicianid' }),
    __metadata("design:type", technicians_entity_1.Technicians)
], TechnicianCertifications.prototype, "technicians", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => certifications_entity_1.Certifications),
    (0, typeorm_1.JoinColumn)({ name: 'certificationid' }),
    __metadata("design:type", certifications_entity_1.Certifications)
], TechnicianCertifications.prototype, "certifications", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => states_entity_1.States),
    (0, typeorm_1.JoinColumn)({ name: 'stateid' }),
    __metadata("design:type", states_entity_1.States)
], TechnicianCertifications.prototype, "states", void 0);
exports.TechnicianCertifications = TechnicianCertifications = __decorate([
    (0, typeorm_1.Entity)('technician_certifications')
], TechnicianCertifications);
//# sourceMappingURL=technician_certifications.entity.js.map