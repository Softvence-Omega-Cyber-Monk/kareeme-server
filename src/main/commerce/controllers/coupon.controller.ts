import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { CouponService } from '../services/coupon.service';

@ApiTags('Commerce - Coupons')
@Controller('commerce/coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new coupon',
    description: `
      Create a new coupon for the commerce system.

      **Example Use Case:**
      - EID25 → 25% discount
      - SAVE100 → 100 BDT off
      `,
  })
  @ApiBody({ type: CreateCouponDto })
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all coupons',
    description: 'Retrieve a list of all coupons with optional filters',
  })
  findAll(@Query() query: QueryCouponDto) {
    return this.couponService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get coupon by ID',
    description: 'Retrieve a single coupon using its unique ID',
  })
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update coupon by ID',
    description: 'Update coupon details such as value, status, or limits',
  })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete coupon by ID',
    description: 'Remove a coupon permanently from the system',
  })
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate coupon',
    description:
      'Validate a coupon code against the user cart and calculate discount',
  })
  @ApiBody({ type: ValidateCouponDto })
  async validate(@Body() dto: ValidateCouponDto) {
    // get cart total
    const cart = await this.couponService['prisma'].cart.findUnique({
      where: { userId: dto.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const cartTotal = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    return this.couponService.validateCoupon(dto.code, dto.userId, cartTotal);
  }
}
