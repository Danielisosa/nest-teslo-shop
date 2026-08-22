import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  
  async getOrCreateCart(user: User): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'], 
    });

    if (!cart) {
      cart = this.cartRepository.create({ user });
      cart.items = [];
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  /**
   * AGREGAR PRODUCTO: Añade un producto al carrito o le suma cantidad si ya existía.
   */
  async addItemToCart(addToCartDto: AddToCartDto, user: User): Promise<Cart> {
    const { productId, quantity } = addToCartDto;
    const cart = await this.getOrCreateCart(user);

    // 1. Verificar si el producto real existe en el catálogo
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('El producto que intentas agregar no existe.');

    // 2. Revisar si el producto ya estaba metido en este carrito
    let cartItem = cart.items.find((item) => item.product.id === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getOrCreateCart(user);
  }

  /**
   * ACTUALIZAR CANTIDAD DIRECTA: Modifica la cantidad desde un input.
   */
  async updateItemQuantity(itemId: string, updateCartItemDto: UpdateCartItemDto, user: User): Promise<Cart> {
    const { quantity } = updateCartItemDto;
    
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { user: { id: user.id } } }, // Seguridad: que pertenezca al usuario logueado
    });

    if (!cartItem) throw new NotFoundException('Línea del carrito no encontrada.');

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getOrCreateCart(user);
  }

  /**
   * ELIMINAR UN PRODUCTO: Saca un ítem por completo del carrito.
   */
  async removeItemFromCart(itemId: string, user: User): Promise<Cart> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { user: { id: user.id } } },
    });

    if (!cartItem) throw new NotFoundException('Línea del carrito no encontrada.');

    await this.cartItemRepository.remove(cartItem);
    return this.getOrCreateCart(user);
  }


  async clearCart(user: User): Promise<Cart> {
    const cart = await this.getOrCreateCart(user);
    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
    return this.getOrCreateCart(user);
  }
}