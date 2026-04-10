import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePackageDto {
  @IsUUID()
  event_id: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  price_pence: number;

  @IsInt()
  @Min(1)
  guests: number;

  @IsString()
  @IsNotEmpty()
  inclusions: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  is_enquiry?: boolean;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
