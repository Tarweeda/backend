import { Controller, Get, Post, Body } from '@nestjs/common';
import { HireService } from './hire.service';
import { CreateHireEnquiryDto } from './dto/create-hire-enquiry.dto';

@Controller('hire')
export class HireController {
  constructor(private readonly hireService: HireService) {}

  @Get('roles')
  findAllRoles() { return this.hireService.findAllRoles(); }

  @Post('enquiries')
  createEnquiry(@Body() dto: CreateHireEnquiryDto) { return this.hireService.createEnquiry(dto); }
}
