import { Module } from '@nestjs/common';
import { HireController } from './hire.controller';
import { HireService } from './hire.service';

@Module({
  controllers: [HireController],
  providers: [HireService],
})
export class HireModule {}
