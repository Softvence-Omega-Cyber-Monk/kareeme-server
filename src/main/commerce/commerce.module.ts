import { PrismaService } from '@/lib/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CheckoutController } from './controllers/checkout.controller';
import { OrderController } from './controllers/order.controller';
import { ProductController } from './controllers/product.controller';
import { CartService } from './services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { OrderService } from './services/order.service';
import { ProductService } from './services/product.service';

@Module({
  controllers: [
    ProductController,
    CartController,
    CheckoutController,
    OrderController,
  ],
  providers: [
    PrismaService,
    ProductService,
    CartService,
    CheckoutService,
    OrderService,
  ],
})
export class CommerceModule {}
