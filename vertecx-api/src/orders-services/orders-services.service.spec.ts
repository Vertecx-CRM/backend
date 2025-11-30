import { Test, TestingModule } from '@nestjs/testing';
import { OrdersServicesService } from './orders-services.service';
import { getRepositoryToken } from '@nestjs/typeorm';

import { OrdersServices } from './entities/orders-services.entity';
import { OrdersServicesProducts } from './entities/orders-services-products.entity';
import { Products } from 'src/products/entities/products.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { States } from 'src/shared/entities/states.entity';

describe('OrdersServicesService', () => {
  let service: OrdersServicesService;

  const mkRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((x) => x),
    remove: jest.fn(),
    manager: {
      transaction: jest.fn(async (cb) => {
        const em = { getRepository: () => mkRepo() as any };
        return cb(em as any);
      }),
    },
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  });

  const repo = mkRepo();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersServicesService,
        { provide: getRepositoryToken(OrdersServices), useValue: repo },
        { provide: getRepositoryToken(OrdersServicesProducts), useValue: repo },
        { provide: getRepositoryToken(Products), useValue: repo },
        { provide: getRepositoryToken(Technicians), useValue: repo },
        { provide: getRepositoryToken(Customers), useValue: repo },
        { provide: getRepositoryToken(States), useValue: repo },
      ],
    }).compile();

    service = module.get<OrdersServicesService>(OrdersServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
