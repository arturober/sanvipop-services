import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Delete,
  HttpCode,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Product } from './entities/product.entity.js';
import { ProductsService } from './products.service.js';
import { InsertProductDto } from './dto/insert-product.dto.js';
import { ProductListResponseInterceptor } from './interceptors/product-list-response.interceptor.js';
import { ProductResponseInterceptor } from './interceptors/product-response.interceptor.js';
import { EditProductDto } from './dto/edit-product.dto.js';
import { ProductPhoto } from './entities/product-photo.entity.js';
import { PhotoResponseInterceptor } from './interceptors/photo-response.interceptor.js';
import { AddPhotoDto } from './dto/add-photo.dto.js';
import { AuthUser } from '../../common/decorators/user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available products ordered by distance' })
  @ApiResponse({ status: 200, description: 'List of products' })
  @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
  async getAllProducts(
    @AuthUser() authUser: User,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    pagination?: PaginationDto,
  ): Promise<Product[]> {
    return await this.productsService.findAllByDistance(
      authUser,
      pagination?.limit,
      pagination?.offset,
    );
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get products bookmarked by current user' })
  @ApiResponse({ status: 200, description: 'Bookmarked products list' })
  @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
  async getBookmarkedProducts(@AuthUser() authUser: User): Promise<Product[]> {
    return await this.productsService.findBookmarked(authUser, authUser.id);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get products created by current user' })
  @ApiResponse({ status: 200, description: 'My products list' })
  @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
  async getMyProducts(@AuthUser() authUser: User): Promise<Product[]> {
    return await this.productsService.findByOwner(authUser, authUser.id);
  }

  @Get('mine/sold')
  @ApiOperation({ summary: 'Get products sold by current user' })
  @ApiResponse({ status: 200, description: 'My sold products list' })
  @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
  async getMySoldProducts(@AuthUser() authUser: User): Promise<Product[]> {
    return await this.productsService.findSold(authUser, authUser.id);
  }

  @Get('mine/bought')
  @ApiOperation({ summary: 'Get products bought by current user' })
  @ApiResponse({ status: 200, description: 'My bought products list' })
  @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
  async getMyBoughtProducts(@AuthUser() authUser: User): Promise<Product[]> {
    return await this.productsService.findBought(authUser, authUser.id);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get active products owned by specified user' })
  @ApiResponse({ status: 200, description: 'User products list' })
  @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
  async getUserProducts(
    @Param('id', ParseIntPipe) userId: number,
    @AuthUser() authUser: User,
  ): Promise<Product[]> {
    return await this.productsService.findByOwner(authUser, userId);
  }

  @Get('user/:id/sold')
  @ApiOperation({ summary: 'Get sold products by specified user' })
  @ApiResponse({ status: 200, description: 'User sold products list' })
  @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
  async getUserSoldProducts(
    @Param('id', ParseIntPipe) userId: number,
    @AuthUser() authUser: User,
  ): Promise<Product[]> {
    return await this.productsService.findSold(authUser, userId);
  }

  @Get('user/:id/bought')
  @ApiOperation({ summary: 'Get bought products by specified user' })
  @ApiResponse({ status: 200, description: 'User bought products list' })
  @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
  async getUserBoughtProducts(
    @Param('id', ParseIntPipe) userId: number,
    @AuthUser() authUser: User,
  ): Promise<Product[]> {
    return await this.productsService.findBought(authUser, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @UseInterceptors(ProductResponseInterceptor, ClassSerializerInterceptor)
  async getProduct(
    @Param('id', ParseIntPipe) prodId: number,
    @AuthUser() authUser: User,
  ): Promise<Product> {
    return await this.productsService.findById(authUser, prodId);
  }

  @Post()
  @ApiOperation({ summary: 'Publish a new product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  @UseInterceptors(ProductResponseInterceptor, ClassSerializerInterceptor)
  async insertProduct(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    prodDto: InsertProductDto,
    @AuthUser() authUser: User,
  ): Promise<Product> {
    return this.productsService.insert(authUser, prodDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit an existing product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 403, description: 'Forbidden: not product owner' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @UseInterceptors(ProductResponseInterceptor, ClassSerializerInterceptor)
  async updateProduct(
    @Param('id', ParseIntPipe) prodId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    prodDto: EditProductDto,
    @AuthUser() authUser: User,
  ): Promise<Product> {
    return this.productsService.update(authUser, prodId, prodDto);
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
  @UseInterceptors(PhotoResponseInterceptor, ClassSerializerInterceptor)
  async addPhoto(
    @Param('id', ParseIntPipe) prodId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    photoDto: AddPhotoDto,
    @AuthUser() authUser: User,
  ): Promise<ProductPhoto> {
    return this.productsService.addPhoto(authUser, prodId, photoDto);
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
