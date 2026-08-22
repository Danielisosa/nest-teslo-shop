import { IsUUID, IsInt, Min, IsPositive } from 'class-validator';

export class AddToCartDto {
  
  @IsUUID('all', { message: 'El ID del producto debe ser un UUID válido.' })
  readonly productId: string;

  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero.' })
  @Min(1, { message: 'Debes agregar al menos 1 producto.' })
  readonly quantity: number;
}