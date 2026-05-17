import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateCateringEnquiryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  event_type?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  guest_count?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  selected_set?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  selected_items?: string;
}
