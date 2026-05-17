import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class RestockDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  created_by?: string;
}
