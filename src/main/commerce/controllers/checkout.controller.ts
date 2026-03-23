import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutDto } from '../dto/checkout.dto';

@ApiTags('Commerce - Checkout')
@Controller('commerce/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(@Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(dto);
  }
}