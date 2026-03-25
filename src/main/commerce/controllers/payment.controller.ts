import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { PaymentService } from '../services/payment.service';
import { StripeService } from '../services/stripe.service';

@ApiTags('Commerce - Payment')
@Controller('commerce/payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) {}

  @ApiBearerAuth()
  @ValidateAuth()
  @Post('create-intent')
  @ApiOperation({
    summary: 'Create payment intent',
    description: 'Create a Stripe payment intent for the order',
  })
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(dto);
  }

  @ApiBearerAuth()
  @ValidateAuth()
  @Get(':orderId')
  @ApiOperation({
    summary: 'Get payment status',
    description: 'Retrieve payment status using order ID',
  })
  getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentStatus(orderId);
  }

  @ApiBearerAuth()
  @ValidateAuth()
  @Post('webhook')
  @ApiOperation({
    summary: 'Handle Stripe webhook',
    description: 'Process Stripe webhook events to update payment status',
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripeService.client.webhooks.constructEvent(
      req.rawBody!,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );

    return this.paymentService.handleWebhookEvent(event);
  }
}
