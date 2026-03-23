import { PrismaService } from '@/lib/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { OrderController } from './controllers/order.controller';
import { PaymentController } from './controllers/payment.controller';
import { ProductController } from './controllers/product.controller';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { ProductService } from './services/product.service';
import { StripeService } from './services/stripe.service';

@Module({
  controllers: [
    ProductController,
    CartController,
    OrderController,
    PaymentController,
  ],
  providers: [
    PrismaService,
    ProductService,
    CartService,
    OrderService,
    PaymentService,
    StripeService,
  ],
})
export class CommerceModule {}
