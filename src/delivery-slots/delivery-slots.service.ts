import { Injectable } from '@nestjs/common';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto.js';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto.js';

@Injectable()
export class DeliverySlotsService {
  create(createDeliverySlotDto: CreateDeliverySlotDto) {
    return 'This action adds a new deliverySlot';
  }

  findAll() {
    return `This action returns all deliverySlots`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deliverySlot`;
  }

  update(id: number, updateDeliverySlotDto: UpdateDeliverySlotDto) {
    return `This action updates a #${id} deliverySlot`;
  }

  remove(id: number) {
    return `This action removes a #${id} deliverySlot`;
  }
}
