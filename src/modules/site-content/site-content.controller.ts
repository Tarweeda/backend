import { Controller, Get, Param } from '@nestjs/common';
import { SiteContentService } from './site-content.service';

@Controller('site-content')
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  @Get()
  findAll() {
    return this.siteContentService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.siteContentService.findOne(key);
  }
}
