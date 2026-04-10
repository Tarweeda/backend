import { Controller, Get, Query } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  findAll(@Query('event_id') eventId?: string) {
    if (eventId) return this.packagesService.findByEventId(eventId);
    return this.packagesService.findAll();
  }
}
