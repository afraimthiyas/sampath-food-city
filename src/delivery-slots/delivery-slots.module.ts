import { Module } from '@nestjs/common';
import { DeliverySlotsService } from './delivery-slots.service.js';
import { DeliverySlotsController } from './delivery-slots.controller.js';

@Module({
  controllers: [DeliverySlotsController],
  providers: [DeliverySlotsService],
})
export class DeliverySlotsModule {}
