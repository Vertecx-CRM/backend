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

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersServicesService,
        { provide: getRepositoryToken(OrdersServices), useValue: mockRepo },
        { provide: getRepositoryToken(OrdersServicesProducts), useValue: mockRepo },
        { provide: getRepositoryToken(Products), useValue: mockRepo },
        { provide: getRepositoryToken(Technicians), useValue: mockRepo },
        { provide: getRepositoryToken(Customers), useValue: mockRepo },
        { provide: getRepositoryToken(States), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<OrdersServicesService>(OrdersServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should call repository.create and save', async () => {
    mockRepo.create.mockReturnValue({});
    mockRepo.save.mockResolvedValue({});
    await service.create({} as any);
    expect(mockRepo.create).toHaveBeenCalled();
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('findAll should call repository.find', async () => {
    await service.findAll();
    expect(mockRepo.find).toHaveBeenCalled();
  });

  it('findOne should call repository.findOne', async () => {
    mockRepo.findOne.mockResolvedValue({});
    await service.findOne(1);
    expect(mockRepo.findOne).toHaveBeenCalled();
  });
});
