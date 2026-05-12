import { Controller, Post, Body } from '@nestjs/common';
import { CateringService } from './catering.service';
import { CreateCateringEnquiryDto } from './dto/create-catering-enquiry.dto';

@Controller('catering')
export class CateringController {
  constructor(private readonly cateringService: CateringService) {}

  @Post('enquiries')
  createEnquiry(@Body() dto: CreateCateringEnquiryDto) { return this.cateringService.createEnquiry(dto); }
}
