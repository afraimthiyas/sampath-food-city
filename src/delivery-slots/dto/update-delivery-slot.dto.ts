import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliverySlotDto } from './create-delivery-slot.dto.js';

export class UpdateDeliverySlotDto extends PartialType(CreateDeliverySlotDto) {}
