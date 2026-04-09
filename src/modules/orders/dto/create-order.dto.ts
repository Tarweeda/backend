import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @IsEmail()
  customer_email: string;

  @IsEnum(['delivery', 'collection'])
  fulfilment_type: 'delivery' | 'collection';

  @IsOptional()
  @IsString()
  delivery_address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
