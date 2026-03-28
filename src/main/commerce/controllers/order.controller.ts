import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';

@ApiTags('Commerce - Orders')
@Controller('commerce/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @ApiBearerAuth()
  @ValidateAuth()
  @Get(':userId')
  @ApiOperation({
    summary: 'Get user orders',
    description: 'Retrieve all orders for a specific user',
  })
  getOrders(@Param('userId') userId: string) {
    return this.orderService.getOrdersByUser(userId);
  }

  @ApiBearerAuth()
  @ValidateAuth()
  @Get('details/:orderId')
  @ApiOperation({
    summary: 'Get order details',
    description: 'Retrieve detailed information of a specific order',
  })
  getOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOrderById(orderId);
  }
}
