import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@ApiTags('Commerce - Cart')
@Controller('commerce/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCartByUser(userId);
  }

  @Patch('item/:cartItemId')
  updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(cartItemId, dto);
  }

  @Delete('item/:cartItemId')
  removeCartItem(@Param('cartItemId') cartItemId: string) {
    return this.cartService.removeCartItem(cartItemId);
  }

  @Delete(':userId/clear')
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}