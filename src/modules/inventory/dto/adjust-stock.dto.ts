import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AdjustStockDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  direction?: 'add' | 'subtract';

  @IsOptional()
  @IsString()
  created_by?: string;
}
