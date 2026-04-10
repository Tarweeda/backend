import { Module } from '@nestjs/common';
import { HampersController } from './hampers.controller';
import { HampersService } from './hampers.service';

@Module({
  controllers: [HampersController],
  providers: [HampersService],
  exports: [HampersService],
})
export class HampersModule {}
