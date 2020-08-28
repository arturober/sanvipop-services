import { Controller, Get, Param, ParseIntPipe, Post, Body, ValidationPipe, UseInterceptors, ClassSerializerInterceptor, Delete, HttpCode, Put, UseGuards } from '@nestjs/common';
import { Product } from 'src/entities/Product';
import { ProductsService } from './products.service';
import { InsertProductDto } from './dto/insert-product.dto';
import { ProductListResponseInterceptor } from './interceptors/product-list-response.interceptor';
import { ProductResponseInterceptor } from './interceptors/product-response.interceptor';
import { EditProductDto } from './dto/edit-product.dto';
import { ProductPhoto } from 'src/entities/ProductPhoto';
import { PhotoResponseInterceptor } from './interceptors/photo-response.interceptor';
import { AddPhotoDto } from './dto/add-photo.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/entities/User';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
    async getAllProducts(@AuthUser() authUser: User): Promise<Product[]> {
        return await this.productsService.findAllByDistance(authUser);
    }

    @Get('bookmarks')
    @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
    async getBookmarkedProducts(@AuthUser() authUser: User): Promise<Product[]> {
        return await this.productsService.findBookmarked(authUser, authUser.id); 
    }

    @Get('mine')
    @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
    async getMyProducts(@AuthUser() authUser: User): Promise<Product[]> {
        return await this.productsService.findByOwner(authUser, authUser.id); 
    }

    @Get('mine/sold')
    @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
    async getMySoldProducts(@AuthUser() authUser: User): Promise<Product[]> {
        return await this.productsService.findSold(authUser, authUser.id);
    }

    @Get('mine/bought')
    @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
    async getMyBoughtProducts(@AuthUser() authUser: User): Promise<Product[]> {
        return await this.productsService.findBought(authUser, authUser.id);
    }

    @Get('user/:id')
    @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
    async getUserProducts(
        @Param('id', ParseIntPipe) userId: number,
        @AuthUser() authUser: User
    ): Promise<Product[]> {
        return await this.productsService.findByOwner(authUser, userId); // TODO
    }

    @Get('user/:id/sold')
    @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
    async getUserSoldProducts(
        @Param('id', ParseIntPipe) userId: number,
        @AuthUser() authUser: User
    ): Promise<Product[]> {
        return await this.productsService.findSold(authUser, userId); // TODO
    }

    @Get('user/:id/bought')
    @UseInterceptors(ProductListResponseInterceptor, ClassSerializerInterceptor)
    async getUserBoughtProducts(
        @Param('id', ParseIntPipe) userId: number,
        @AuthUser() authUser: User
    ): Promise<Product[]> {
        return await this.productsService.findBought(authUser, userId); // TODO
    }

    @Get(':id')
    @UseInterceptors(ProductResponseInterceptor, ClassSerializerInterceptor)
    async getProduct(
        @Param('id', ParseIntPipe) prodId: number,
        @AuthUser() authUser: User
    ): Promise<Product> {
        const resp = await this.productsService.findById(authUser, prodId);
        return resp;
    }

    @Post()
    @UseInterceptors(ProductResponseInterceptor, ClassSerializerInterceptor)
    async insertProduct(
        @Body(new ValidationPipe({ transform: true, whitelist: true})) prodDto: InsertProductDto,
        @AuthUser() authUser: User
    ): Promise<Product>{
        return this.productsService.insert(authUser, prodDto);
    }

    @Put(':id')
    @UseInterceptors(ProductResponseInterceptor, ClassSerializerInterceptor)
    async updateProduct(
        @Param('id', ParseIntPipe) prodId: number,
        @Body(new ValidationPipe({ transform: true, whitelist: true})) prodDto: EditProductDto,
        @AuthUser() authUser: User
    ): Promise<Product>{
        return this.productsService.update(authUser, prodId, prodDto);
    }

    @Put(':id/buy')
    @HttpCode(204)
    async buyProduct(
        @Param('id', ParseIntPipe) prodId: number,
        @AuthUser() authUser: User
    ): Promise<void>{
        await this.productsService.buyProduct(authUser, prodId);
    }

    @Delete(':id')
    @HttpCode(204)
    async deleteProduct(
        @Param('id', ParseIntPipe) prodId: number,
        @AuthUser() authUser: User
    ): Promise<void>{
        await this.productsService.delete(authUser, prodId);
    }

    @Post(':id/bookmarks')
    @HttpCode(204)
    async addBookmark(
        @Param('id', ParseIntPipe) prodId: number,
        @AuthUser() authUser: User
    ): Promise<void> {
        await this.productsService.addBookmark(authUser, prodId);
    }

    @Delete(':id/bookmarks')
    @HttpCode(204)
    async deleteBookmark(
        @Param('id', ParseIntPipe) prodId: number,
        @AuthUser() authUser: User
    ): Promise<void> {
        await this.productsService.removeBookmark(authUser, prodId);
    }

    @Post(':id/photos')
    @UseInterceptors(PhotoResponseInterceptor, ClassSerializerInterceptor)
    async addPhoto(
        @Param('id', ParseIntPipe) prodId: number,
        @Body(new ValidationPipe({ transform: true, whitelist: true})) photoDto: AddPhotoDto,
        @AuthUser() authUser: User
    ): Promise<ProductPhoto> {
        return this.productsService.addPhoto(authUser, prodId, photoDto);
    }

    @Delete(':idProd/photos/:idPhoto')
    @HttpCode(204)
    async deletePhoto(
        @Param('idProd', ParseIntPipe) prodId: number,
        @Param('idPhoto', ParseIntPipe) photoId: number,
        @AuthUser() authUser: User
    ): Promise<void> {
        await this.productsService.removePhoto(authUser, prodId, photoId);
    }
}
