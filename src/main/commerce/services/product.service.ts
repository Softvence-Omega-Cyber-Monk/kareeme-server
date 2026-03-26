import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploaded.secure_url;
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        imageUrl,
        stock: createProductDto.stock ?? 0,
        isActive: createProductDto.isActive ?? true,
      },
    });
  }

  async findAll(query: QueryProductDto) {
    const { search, page = 1, limit = 10, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    await this.findOne(id);

    let imageUrl: string | undefined;

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploaded.secure_url;
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}