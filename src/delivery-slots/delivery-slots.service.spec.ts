import { Test, TestingModule } from '@nestjs/testing';
import { DeliverySlotsService } from './delivery-slots.service.js';

describe('DeliverySlotsService', () => {
  let service: DeliverySlotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliverySlotsService],
    }).compile();

    service = module.get<DeliverySlotsService>(DeliverySlotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
