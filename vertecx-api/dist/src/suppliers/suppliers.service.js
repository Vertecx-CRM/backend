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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const suppliers_entity_1 = require("./entities/suppliers.entity");
const users_entity_1 = require("../users/entities/users.entity");
let SuppliersService = class SuppliersService {
    constructor(repo, usersRepo) {
        this.repo = repo;
        this.usersRepo = usersRepo;
    }
    async ensureUserExists(userid) {
        const user = await this.usersRepo.findOne({ where: { userid } });
        if (!user)
            throw new common_1.BadRequestException('El usuario no existe');
        return user;
    }
    async ensureNitUnique(nit, excludeId) {
        const qb = this.repo.createQueryBuilder('s').where('s.nit = :nit', { nit });
        if (excludeId)
            qb.andWhere('s.supplierid <> :id', { id: excludeId });
        const exists = await qb.getExists();
        if (exists)
            throw new common_1.BadRequestException('El NIT ya está registrado');
    }
    async create(dto) {
        const user = await this.ensureUserExists(dto.userid);
        await this.ensureNitUnique(dto.nit);
        const entity = this.repo.create({
            servicetype: dto.servicetype,
            contactname: dto.contactname,
            nit: dto.nit,
            address: dto.address,
            rating: dto.rating ?? 0,
            user,
        });
        return await this.repo.save(entity);
    }
    async createMany(dtos) {
        const entities = [];
        for (const dto of dtos) {
            const user = await this.ensureUserExists(dto.userid);
            await this.ensureNitUnique(dto.nit);
            const entity = this.repo.create({
                servicetype: dto.servicetype,
                contactname: dto.contactname,
                nit: dto.nit,
                address: dto.address,
                rating: dto.rating ?? 0,
                user,
            });
            entities.push(entity);
        }
        return await this.repo.save(entities);
    }
    async findAll() {
        return await this.repo.find({ relations: ['user'] });
    }
    async findOne(id) {
        const entity = await this.repo.findOne({
            where: { supplierid: id },
            relations: ['user'],
        });
        if (!entity)
            throw new common_1.NotFoundException('Proveedor no encontrado');
        return entity;
    }
    async update(id, dto) {
        const current = await this.findOne(id);
        if (dto.nit)
            await this.ensureNitUnique(dto.nit, id);
        let user = current.user;
        if (dto.userid && dto.userid !== current.user.userid) {
            user = await this.ensureUserExists(dto.userid);
        }
        const entity = await this.repo.preload({
            supplierid: id,
            servicetype: dto.servicetype ?? current.servicetype,
            contactname: dto.contactname ?? current.contactname,
            nit: dto.nit ?? current.nit,
            address: dto.address ?? current.address,
            rating: dto.rating ?? current.rating,
            user,
        });
        if (!entity)
            throw new common_1.NotFoundException('Proveedor no encontrado');
        return await this.repo.save(entity);
    }
    async remove(id) {
        const entity = await this.findOne(id);
        await this.repo.remove(entity);
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(suppliers_entity_1.Suppliers)),
    __param(1, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map