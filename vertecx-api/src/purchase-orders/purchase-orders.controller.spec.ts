import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByNumeroOrden: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    remove: jest.fn(),
    findBySupplier: jest.fn(),
    findByState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [
        {
          provide: PurchaseOrdersService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<PurchaseOrdersController>(
      PurchaseOrdersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
