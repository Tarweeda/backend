import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @IsString()
  @IsNotEmpty()
  package_id: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsArray()
  @IsString({ each: true })
  dietary: string[];

  @IsOptional()
  @IsString()
  special_requests?: string;
}
