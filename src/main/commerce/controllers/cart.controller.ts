import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@ApiTags('Commerce - Cart')
@Controller('commerce/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiBearerAuth()
  @Post()
  addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @ApiBearerAuth()
  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCartByUser(userId);
  }

  @ApiBearerAuth()
  @Patch('item/:cartItemId')
  updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(cartItemId, dto);
  }

  @ApiBearerAuth()
  @Delete('item/:cartItemId')
  removeCartItem(@Param('cartItemId') cartItemId: string) {
    return this.cartService.removeCartItem(cartItemId);
  }

  @ApiBearerAuth()
  @Delete(':userId/clear')
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}