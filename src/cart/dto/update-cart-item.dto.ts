import { IsInt, Min, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero.' })
  @Min(1, { message: 'La cantidad mínima es 1.' })
  readonly quantity: number;
}