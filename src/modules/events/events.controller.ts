import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() { return this.eventsService.findAll(); }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) { return this.eventsService.findBySlug(slug); }
}
