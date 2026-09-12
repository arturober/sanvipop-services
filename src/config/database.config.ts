import { defineConfig } from '@mikro-orm/sqlite';
import { User } from '../modules/users/entities/user.entity.js';
import { Category } from '../modules/categories/entities/category.entity.js';
import { Product } from '../modules/products/entities/product.entity.js';
import { ProductPhoto } from '../modules/products/entities/product-photo.entity.js';
import { ProductBookmark } from '../modules/products/entities/product-bookmark.entity.js';
import { Transaction } from '../modules/transactions/entities/transaction.entity.js';

export default defineConfig({
  dbName: 'sanvipop.db',
  entities: [User, Category, Product, ProductPhoto, ProductBookmark, Transaction],
  debug: process.env.NODE_ENV !== 'production',
});
