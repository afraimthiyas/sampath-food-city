import { Test, TestingModule } from '@nestjs/testing';
import { DeliverySlotsController } from './delivery-slots.controller.js';
import { DeliverySlotsService } from './delivery-slots.service.js';

describe('DeliverySlotsController', () => {
  let controller: DeliverySlotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliverySlotsController],
      providers: [DeliverySlotsService],
    }).compile();

    controller = module.get<DeliverySlotsController>(DeliverySlotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
