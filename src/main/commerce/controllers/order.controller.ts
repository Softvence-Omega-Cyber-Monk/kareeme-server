import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';

@ApiTags('Commerce - Orders')
@Controller('commerce/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':userId')
  getOrders(@Param('userId') userId: string) {
    return this.orderService.getOrdersByUser(userId);
  }

  @Get('details/:orderId')
  getOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOrderById(orderId);
  }
}