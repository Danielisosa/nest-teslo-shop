import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';


import { Auth, GetUser } from '../auth/decorators'; 
import { User } from '../auth/entities/user.entity';

@Controller('cart')
@Auth() 
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(
    @Body() addToCartDto: AddToCartDto,
    @GetUser() user: User 
  ) {
    return this.cartService.addItemToCart(addToCartDto, user);
  }

  @Get()
  getCart(@GetUser() user: User) {
    return this.cartService.getOrCreateCart(user);
  }

  @Patch(':id') 
  updateQuantity(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateCartItemDto: UpdateCartItemDto,
    @GetUser() user: User
  ) {
    return this.cartService.updateItemQuantity(id, updateCartItemDto, user);
  }

  @Delete(':id')
  removeItem(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser() user: User
  ) {
    return this.cartService.removeItemFromCart(id, user);
  }

  @Delete()
  clearCart(@GetUser() user: User) {
    return this.cartService.clearCart(user);
  }
}