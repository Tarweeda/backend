import { Controller, Get, Post, Body } from '@nestjs/common';
import { HireService } from './hire.service';

@Controller('hire')
export class HireController {
  constructor(private readonly hireService: HireService) {}

  @Get('roles')
  findAllRoles() { return this.hireService.findAllRoles(); }

  @Post('enquiries')
  createEnquiry(@Body() dto: any) { return this.hireService.createEnquiry(dto); }
}
