import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'number' },
        isActive: { type: 'boolean' },
        features: {
          type: 'array',
          items: { type: 'string' },
          example: ['High quality', 'Light weight', '1 year warranty'],
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['name', 'price'],
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.create(createProductDto, file);
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'number' },
        isActive: { type: 'boolean' },
        features: {
          type: 'array',
          items: { type: 'string' },
          example: ['High quality', 'Light weight'],
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.update(id, updateProductDto, file);
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