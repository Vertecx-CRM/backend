import { Test, TestingModule } from '@nestjs/testing';
import { OrdersServicesController } from './orders-services.controller';
import { OrdersServicesService } from './orders-services.service';

describe('OrdersServicesController', () => {
  let controller: OrdersServicesController;
  let service: OrdersServicesService;

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
      providers: [
        {
          provide: OrdersServicesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OrdersServicesController>(OrdersServicesController);
    service = module.get<OrdersServicesService>(OrdersServicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', async () => {
    const dto = {};
    await controller.create(dto as any);
    expect(service.create).toHaveBeenCalled();
  });

  it('should call service.findAll', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.findOne', async () => {
    await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalled();
  });

  it('should call service.update', async () => {
    const dto = {};
    await controller.update(1, dto as any);
    expect(service.update).toHaveBeenCalled();
  });

  it('should call service.remove', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalled();
  });
});
