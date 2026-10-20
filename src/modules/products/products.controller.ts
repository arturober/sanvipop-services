import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  ValidationPipe,
  Delete,
  HttpCode,
  Put,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { ProductsService } from './products.service.js';
import { InsertProductDto } from './dto/insert-product.dto.js';
import { EditProductDto } from './dto/edit-product.dto.js';
import { AddPhotoDto } from './dto/add-photo.dto.js';
import { AuthUser } from '../../common/decorators/user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { UserProductsQueryDto, ProductUserStatus } from './dto/user-products-query.dto.js';
import {
  PaginatedProductsResponseDto,
  SingleProductResponseDto,
  PhotoUploadResponseDto,
} from './dto/product-response.dto.js';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products with pagination, sorting and optional user or status filter' })
  @ApiResponse({ status: 200, description: 'List of products with pagination info' })
  async getAllProducts(
    @AuthUser() authUser: User,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: UserProductsQueryDto,
    @Req() req?: Request,
  ): Promise<PaginatedProductsResponseDto> {
    let result;
    if (query.status === ProductUserStatus.BOOKMARKS) {
      result = await this.productsService.findBookmarked(
        authUser,
        query,
        query.user ?? authUser.id,
      );
    } else if (query.user !== undefined || query.status !== undefined) {
      result = await this.productsService.findByUser(authUser, query);
    } else {
      result = await this.productsService.findAll(authUser, query);
    }
    return PaginatedProductsResponseDto.from(result, req, authUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(
    @Param('id', ParseIntPipe) prodId: number,
    @AuthUser() authUser: User,
    @Req() req?: Request,
  ): Promise<SingleProductResponseDto> {
    const product = await this.productsService.findById(authUser, prodId);
    return SingleProductResponseDto.from(product, req, authUser.id);
  }

  @Post()
  @ApiOperation({ summary: 'Publish a new product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  async insertProduct(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    prodDto: InsertProductDto,
    @AuthUser() authUser: User,
    @Req() req?: Request,
  ): Promise<SingleProductResponseDto> {
    const product = await this.productsService.insert(authUser, prodDto);
    return SingleProductResponseDto.from(product, req, authUser.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit an existing product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 403, description: 'Forbidden: not product owner' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('id', ParseIntPipe) prodId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    prodDto: EditProductDto,
    @AuthUser() authUser: User,
    @Req() req?: Request,
  ): Promise<SingleProductResponseDto> {
    const product = await this.productsService.update(authUser, prodId, prodDto);
    return SingleProductResponseDto.from(product, req, authUser.id);
  }

  @Put(':id/buy')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark a product as bought by current user' })
  @ApiResponse({ status: 204, description: 'Product bought' })
  async buyProduct(
    @Param('id', ParseIntPipe) prodId: number,
    @AuthUser() authUser: User,
  ): Promise<void> {
    await this.productsService.buyProduct(authUser, prodId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden: not product owner' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(
    @Param('id', ParseIntPipe) prodId: number,
    @AuthUser() authUser: User,
  ): Promise<void> {
    await this.productsService.delete(authUser, prodId);
  }

  @Post(':id/bookmarks')
  @HttpCode(204)
  @ApiOperation({ summary: 'Bookmark a product' })
  @ApiResponse({ status: 204, description: 'Product bookmarked' })
  async addBookmark(
    @Param('id', ParseIntPipe) prodId: number,
    @AuthUser() authUser: User,
  ): Promise<void> {
    await this.productsService.addBookmark(authUser, prodId);
  }

  @Delete(':id/bookmarks')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove bookmark from a product' })
  @ApiResponse({ status: 204, description: 'Bookmark removed' })
  async deleteBookmark(
    @Param('id', ParseIntPipe) prodId: number,
    @AuthUser() authUser: User,
  ): Promise<void> {
    await this.productsService.removeBookmark(authUser, prodId);
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Add a photo to a product' })
  @ApiResponse({ status: 201, description: 'Photo added' })
  async addPhoto(
    @Param('id', ParseIntPipe) prodId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    photoDto: AddPhotoDto,
    @AuthUser() authUser: User,
    @Req() req?: Request,
  ): Promise<PhotoUploadResponseDto> {
    const photo = await this.productsService.addPhoto(authUser, prodId, photoDto);
    return PhotoUploadResponseDto.from(photo, req);
  }

  @Delete(':idProd/photos/:idPhoto')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a photo from a product' })
  @ApiResponse({ status: 204, description: 'Photo deleted' })
  async deletePhoto(
    @Param('idProd', ParseIntPipe) prodId: number,
    @Param('idPhoto', ParseIntPipe) photoId: number,
    @AuthUser() authUser: User,
  ): Promise<void> {
    await this.productsService.removePhoto(authUser, prodId, photoId);
  }
}
