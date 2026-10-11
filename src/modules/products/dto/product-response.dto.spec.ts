import { describe, it, expect } from 'vitest';
import { Collection } from '@mikro-orm/core';
import {
  ProductResponseDto,
  PaginatedProductsResponseDto,
  PaginatedProductsDto,
} from './product-response.dto.js';
import { Product, ProductStatus } from '../entities/product.entity.js';
import { ProductPhoto } from '../entities/product-photo.entity.js';
import { User } from '../../users/entities/user.entity.js';

describe('ProductResponseDto', () => {
  it('should handle uninitialized Collection of photos without throwing', () => {
    const product = new Product();
    product.id = 17;
    product.title = 'Test Product';
    product.description = 'Test Description';
    product.price = 25;
    product.status = ProductStatus.AVAILABLE;
    product.datePublished = new Date();
    product.numVisits = 3;
    product.owner = {
      id: 1,
      name: 'Owner',
      email: 'owner@test.com',
      lat: 38.4,
      lng: -0.5,
      photo: 'users/test.jpg',
    } as unknown as User;
    product.category = { id: 2, name: 'Informática' } as any;

    // Simulate an uninitialized MikroORM Collection where getItems() throws
    const uninitializedPhotosCollection = Object.create(Collection.prototype);
    uninitializedPhotosCollection.isInitialized = () => false;
    uninitializedPhotosCollection.getItems = () => {
      throw new Error('Collection<ProductPhoto> of entity Product[17] not initialized');
    };
    product.photos = uninitializedPhotosCollection;

    const dto = ProductResponseDto.fromEntity(product);

    expect(dto).toBeDefined();
    expect(dto.id).toBe(17);
    expect(dto.title).toBe('Test Product');
    expect(dto.photos).toBeUndefined();
  });

  it('should map initialized Collection of photos properly', () => {
    const product = new Product();
    product.id = 10;
    product.title = 'Product With Photos';
    product.description = 'Desc';
    product.price = 50;
    product.status = ProductStatus.AVAILABLE;
    product.datePublished = new Date();
    product.numVisits = 0;
    product.owner = { id: 1, name: 'Owner' } as any;

    const mockPhoto1 = { id: 101, url: 'products/photo1.jpg' } as ProductPhoto;
    const mockPhoto2 = { id: 102, url: 'products/photo2.jpg' } as ProductPhoto;

    const initializedPhotosCollection = Object.create(Collection.prototype);
    initializedPhotosCollection.isInitialized = () => true;
    initializedPhotosCollection.getItems = () => [mockPhoto1, mockPhoto2];
    product.photos = initializedPhotosCollection;

    const dto = ProductResponseDto.fromEntity(product);

    expect(dto.photos).toBeDefined();
    expect(dto.photos).toHaveLength(2);
    expect(dto.photos?.[0]).toEqual({
      id: 101,
      url: 'http://localhost:3000/products/photo1.jpg',
    });
    expect(dto.photos?.[1]).toEqual({
      id: 102,
      url: 'http://localhost:3000/products/photo2.jpg',
    });
  });

  it('should transform paginated products containing uninitialized photos in PaginatedProductsResponseDto.from', () => {
    const product = new Product();
    product.id = 17;
    product.title = 'Paginated Product';
    product.description = 'Paginated Description';
    product.price = 99;
    product.status = ProductStatus.AVAILABLE;
    product.datePublished = new Date();
    product.owner = { id: 2, name: 'Seller' } as any;

    const uninitCol = Object.create(Collection.prototype);
    uninitCol.isInitialized = () => false;
    uninitCol.getItems = () => {
      throw new Error('Collection<ProductPhoto> of entity Product[17] not initialized');
    };
    product.photos = uninitCol;

    const paginated = PaginatedProductsDto.create([product], 1, 12, 1);
    const result = PaginatedProductsResponseDto.from(paginated);

    expect(result.page).toBe(1);
    expect(result.total_products).toBe(1);
    expect(result.total_pages).toBe(1);
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe(17);
    expect(result.products[0].photos).toBeUndefined();
  });
});
