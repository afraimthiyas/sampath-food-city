import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeliverySlotsService } from './delivery-slots.service.js';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto.js';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto.js';

@Controller('delivery-slots')
export class DeliverySlotsController {
  constructor(private readonly deliverySlotsService: DeliverySlotsService) {}

  @Post()
  create(@Body() createDeliverySlotDto: CreateDeliverySlotDto) {
    return this.deliverySlotsService.create(createDeliverySlotDto);
  }

  @Get()
  findAll() {
    return this.deliverySlotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliverySlotsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliverySlotDto: UpdateDeliverySlotDto) {
    return this.deliverySlotsService.update(+id, updateDeliverySlotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliverySlotsService.remove(+id);
  }
}
