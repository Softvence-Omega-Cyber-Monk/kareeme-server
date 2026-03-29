import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { GetOrdersQueryDto } from '../dto/get-order-query.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Get all orders for admin' })
  getAllOrders(@Query() query: GetOrdersQueryDto) {
    return this.orderService.getAllOrders(query);
  }

  @Get('my-orders/:userId')
  @ApiOperation({ summary: 'Get all orders of a user' })
  getOrdersByUser(@Param('userId') userId: string) {
    return this.orderService.getOrdersByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto);
  }
}