import { Module } from '@nestjs/common';
import { HampersController } from './hampers.controller';
import { HampersService } from './hampers.service';

@Module({
  controllers: [HampersController],
  providers: [HampersService],
})
export class HampersModule {}
