import { Test, TestingModule } from '@nestjs/testing';
import { OrdersServicesController } from './orders-services.controller';
import { OrdersServicesService } from './orders-services.service';

describe('OrdersServicesController', () => {
  let controller: OrdersServicesController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addProduct: jest.fn(),
    removeProduct: jest.fn(),
    assignTechnicians: jest.fn(),
    finishOrder: jest.fn(),
    findByTechnician: jest.fn(),
    findByClient: jest.fn(),
    findByState: jest.fn(),
    findByDateRange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersServicesController],
      providers: [{ provide: OrdersServicesService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersServicesController>(OrdersServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledTimes(1);
  });
});
