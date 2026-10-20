import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductsQueryDto } from './products-query.dto.js';

export enum ProductUserStatus {
  SELLING = 'selling',
  SOLD = 'sold',
  BOUGHT = 'bought',
  BOOKMARKS = 'bookmarks',
}

export class UserProductsQueryDto extends ProductsQueryDto {
  /**
   * ID del usuario cuyos productos se quieren consultar (opcional, por defecto el usuario autenticado)
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  user?: number;

  /**
   * Estado de los productos ('selling', 'sold', 'bought' o 'bookmarks')
   * @example "selling"
   */
  @IsOptional()
  @IsEnum(ProductUserStatus)
  status?: ProductUserStatus;
}

