import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Product } from 'src/entities/Product';
import { CommonsModule } from 'src/commons/commons.module';
import { Category } from 'src/entities/Category';
import { User } from 'src/entities/User';
import { ProductPhoto } from 'src/entities/ProductPhoto';
import { ProductBookmark } from 'src/entities/ProductBookmark';

@Module({
  imports: [
    MikroOrmModule.forFeature([Product, ProductPhoto, Category, User, ProductBookmark]),
    CommonsModule
  ],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule {}
