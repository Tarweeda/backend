import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  theme: string;

  @IsString()
  @IsNotEmpty()
  event_date: string;

  @IsString()
  @IsNotEmpty()
  event_time: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsInt()
  @Min(1)
  total_seats: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  seats_left?: number;

  @IsInt()
  @Min(0)
  price_pence: number;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsArray()
  menu?: any[];

  @IsOptional()
  @IsEnum(['upcoming', 'sold_out', 'past', 'cancelled'])
  status?: string;
}
