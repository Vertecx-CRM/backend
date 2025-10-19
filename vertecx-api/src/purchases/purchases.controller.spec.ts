import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesController } from './purchasesmanagement.controller';
import { PurchasesService } from './purchasesmanagement.service';

describe('PurchasesController', () => {
  let controller: PurchasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasesController],
      providers: [PurchasesService],
    }).compile();

    controller = module.get<PurchasesController>(PurchasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
