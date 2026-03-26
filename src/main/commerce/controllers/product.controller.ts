import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';
import { ValidateSuperAdmin } from '@/core/jwt/jwt.decorator';

@ApiTags('Commerce - Products')
@Controller('commerce/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Post()
  @ApiOperation({
    summary: 'Create product',
    description: 'Create a new product in the system',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve a list of products with optional filters',
  })
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve details of a specific product',
  })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Update product information by ID',
  })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Remove a product from the system',
  })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
