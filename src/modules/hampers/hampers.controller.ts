import { Controller, Get } from '@nestjs/common';
import { HampersService } from './hampers.service';

@Controller('hampers')
export class HampersController {
  constructor(private readonly hampersService: HampersService) {}

  @Get()
  findAll() { return this.hampersService.findAll(); }
}
