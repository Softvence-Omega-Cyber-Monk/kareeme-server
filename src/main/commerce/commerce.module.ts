import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { CouponController } from './controllers/coupon.controller';
import { OrderController } from './controllers/order.controller';
import { PaymentController } from './controllers/payment.controller';
import { ProductController } from './controllers/product.controller';
import { CartService } from './services/cart.service';
import { CouponService } from './services/coupon.service';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { ProductService } from './services/product.service';
import { StripeService } from './services/stripe.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [
    ProductController,
    CartController,
    OrderController,
    PaymentController,
    CouponController,
  ],
  providers: [
    PrismaService,
    ProductService,
    CartService,
    OrderService,
    PaymentService,
    StripeService,
    CouponService,
  ],
})
export class CommerceModule {}
