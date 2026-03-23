import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';

@ApiTags('Commerce - Orders')
@Controller('commerce/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiBearerAuth()
  @Get(':userId')
  getOrders(@Param('userId') userId: string) {
    return this.orderService.getOrdersByUser(userId);
  }

  @ApiBearerAuth()
  @Get('details/:orderId')
  getOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOrderById(orderId);
  }
}