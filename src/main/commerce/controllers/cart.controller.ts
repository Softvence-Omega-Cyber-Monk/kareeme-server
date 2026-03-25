import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartService } from '../services/cart.service';

@ApiTags('Commerce - Cart')
@Controller('commerce/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiBearerAuth()
  @ValidateAuth()
  @Post()
  @ApiOperation({
    summary: 'Add item to cart',
    description: 'Add a product to the user cart',
  })
  addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @ApiBearerAuth()
  @ValidateAuth()
  @Get(':userId')
  @ApiOperation({
    summary: 'Get user cart',
    description: 'Retrieve all items in the user cart',
  })
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCartByUser(userId);
  }

  @ApiBearerAuth()
  @ValidateAuth()
  @Patch('item/:cartItemId')
  @ApiOperation({
    summary: 'Update cart item',
    description: 'Update quantity or details of a cart item',
  })
  updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(cartItemId, dto);
  }

  @ApiBearerAuth()
  @ValidateAuth()
  @Delete('item/:cartItemId')
  @ApiOperation({
    summary: 'Remove cart item',
    description: 'Remove a specific item from the cart',
  })
  removeCartItem(@Param('cartItemId') cartItemId: string) {
    return this.cartService.removeCartItem(cartItemId);
  }

  @ApiBearerAuth()
  @ValidateAuth()
  @Delete(':userId/clear')
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Remove all items from the user cart',
  })
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
