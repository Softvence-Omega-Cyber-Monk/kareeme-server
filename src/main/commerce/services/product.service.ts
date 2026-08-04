import { S3Service } from '@/lib/file/services/s3.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    let imageUrl: string | undefined;

    if (file) {
      const uploaded = await this.s3Service.uploadFile(file);
      imageUrl = uploaded.url;
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: this.parseNumber(createProductDto.price, 'price'),
        imageUrl,
        stock:
          createProductDto.stock === undefined
            ? 0
            : this.parseNumber(createProductDto.stock, 'stock'),
        isActive: this.parseBoolean(createProductDto.isActive, true),
        features: this.parseFeatures(createProductDto.features),
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
      const uploaded = await this.s3Service.uploadFile(file);
      imageUrl = uploaded.url;
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...this.normalizeUpdateData(updateProductDto),
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

  private normalizeUpdateData(dto: UpdateProductDto) {
    return {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.price !== undefined
        ? { price: this.parseNumber(dto.price, 'price') }
        : {}),
      ...(dto.stock !== undefined
        ? { stock: this.parseNumber(dto.stock, 'stock') }
        : {}),
      ...(dto.isActive !== undefined
        ? { isActive: this.parseBoolean(dto.isActive, true) }
        : {}),
      ...(dto.features !== undefined
        ? { features: this.parseFeatures(dto.features) }
        : {}),
    };
  }

  private parseNumber(value: unknown, field: string): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`${field} must be a valid number`);
    }

    return parsed;
  }

  private parseBoolean(value: unknown, fallback: boolean): boolean {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value === 'true';
    return Boolean(value);
  }

  private parseFeatures(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value !== 'string') return [];

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
}
