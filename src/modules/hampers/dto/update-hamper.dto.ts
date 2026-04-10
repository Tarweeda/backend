import { PartialType } from '@nestjs/mapped-types';
import { CreateHamperDto } from './create-hamper.dto';

export class UpdateHamperDto extends PartialType(CreateHamperDto) {}
