import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ProductsService } from './products.service.js';
import { Product, ProductStatus } from './entities/product.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { ProductPhoto } from './entities/product-photo.entity.js';
import { ProductBookmark } from './entities/product-bookmark.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { ImageService } from '../../common/services/image/image.service.js';
import { FirebaseService } from '../../common/services/firebase/firebase.service.js';

import { QueryOrder } from '@mikro-orm/core';
import { ProductSort } from './dto/products-query.dto.js';
import { ProductUserStatus } from './dto/user-products-query.dto.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let emMock: {
    remove: ReturnType<typeof vi.fn>;
    flush: ReturnType<typeof vi.fn>;
  };
  let imageServiceMock: {
    removeImage: ReturnType<typeof vi.fn>;
  };
  let productRepoMock: {
    findOne: ReturnType<typeof vi.fn>;
    findByDistance: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    populate: ReturnType<typeof vi.fn>;
    getEntityManager: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    emMock = {
      remove: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    };
    imageServiceMock = {
      removeImage: vi.fn().mockResolvedValue(undefined),
    };
    productRepoMock = {
      findOne: vi.fn(),
      findByDistance: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      populate: vi.fn().mockImplementation((products) => Promise.resolve(products)),
      getEntityManager: vi.fn().mockReturnValue(emMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: productRepoMock,
        },
        {
          provide: getRepositoryToken(ProductPhoto),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductBookmark),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {},
        },
        {
          provide: ImageService,
          useValue: imageServiceMock,
        },
        {
          provide: FirebaseService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const authUser = { id: 1, lat: 38.4, lng: -0.5 } as User;

    it('should query general catalog with default page 1 (limit 12, offset 0) and distance sort', async () => {
      await service.findAll(authUser, {});

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { $not: { status: ProductStatus.SOLD } },
        { distance: QueryOrder.ASC },
        null,
        12,
        0,
      );
      expect(productRepoMock.populate).toHaveBeenCalled();
    });

    it('should paginate correctly with page 2', async () => {
      await service.findAll(authUser, { page: 2 });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { $not: { status: ProductStatus.SOLD } },
        { distance: QueryOrder.ASC },
        null,
        12,
        12,
      );
    });

    it('should sort by price ascending when sort=price', async () => {
      await service.findAll(authUser, { sort: ProductSort.PRICE });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { $not: { status: ProductStatus.SOLD } },
        { price: QueryOrder.ASC },
        null,
        12,
        0,
      );
    });

    it('should sort by views ascending when sort=views', async () => {
      await service.findAll(authUser, { sort: ProductSort.VIEWS });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { $not: { status: ProductStatus.SOLD } },
        { numVisits: QueryOrder.ASC },
        null,
        12,
        0,
      );
    });

    it('should filter by title or description when search is provided', async () => {
      await service.findAll(authUser, { search: 'bici' });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        {
          $not: { status: ProductStatus.SOLD },
          $or: [
            { title: { $like: '%bici%' } },
            { description: { $like: '%bici%' } },
          ],
        },
        { distance: QueryOrder.ASC },
        null,
        12,
        0,
      );
    });
  });

  describe('findByUser', () => {
    const authUser = { id: 1, lat: 38.4, lng: -0.5 } as User;

    it('should default to authUser.id and SELLING status when query is empty', async () => {
      await service.findByUser(authUser, {});

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { owner: { id: 1 }, $not: { status: ProductStatus.SOLD } },
        { distance: QueryOrder.ASC },
        null,
        12,
        0,
      );
      expect(productRepoMock.populate).toHaveBeenCalled();
    });

    it('should query specific user when user param is provided', async () => {
      await service.findByUser(authUser, { user: 42 });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { owner: { id: 42 }, $not: { status: ProductStatus.SOLD } },
        { distance: QueryOrder.ASC },
        null,
        12,
        0,
      );
    });

    it('should query sold products when status=sold', async () => {
      await service.findByUser(authUser, { status: ProductUserStatus.SOLD });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { owner: { id: 1 }, status: ProductStatus.SOLD },
        { distance: QueryOrder.ASC },
        null,
        12,
        0,
      );
    });

    it('should query bought products when status=bought and user=42', async () => {
      await service.findByUser(authUser, {
        user: 42,
        status: ProductUserStatus.BOUGHT,
      });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { soldTo: { id: 42 }, status: ProductStatus.SOLD },
        { distance: QueryOrder.ASC },
        null,
        12,
        0,
      );
    });

    it('should support pagination and sorting in findByUser', async () => {
      await service.findByUser(authUser, {
        page: 3,
        sort: ProductSort.PRICE,
      });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        { owner: { id: 1 }, $not: { status: ProductStatus.SOLD } },
        { price: QueryOrder.ASC },
        null,
        12,
        24,
      );
    });

    it('should filter by title or description when search is provided in findByUser', async () => {
      await service.findByUser(authUser, { search: 'monitor' });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        {
          owner: { id: 1 },
          $not: { status: ProductStatus.SOLD },
          $or: [
            { title: { $like: '%monitor%' } },
            { description: { $like: '%monitor%' } },
          ],
        },
        { distance: QueryOrder.ASC },
        null,
        12,
        0,
      );
    });
  });

  describe('findBookmarked', () => {
    const authUser = { id: 1, lat: 38.4, lng: -0.5 } as User;

    it('should query bookmarked products with default page 1, limit 12, offset 0 and distance sort', async () => {
      const result = await service.findBookmarked(authUser, {});

      const expectedJoin = new Map<string, any>();
      expectedJoin.set('bookmarks', { 'bookmarks.user': 1 });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        null,
        { distance: QueryOrder.ASC },
        expectedJoin,
        12,
        0,
      );
      expect(productRepoMock.count).toHaveBeenCalledWith({
        bookmarks: { user: 1 },
      });
      expect(result.page).toBe(1);
    });

    it('should paginate correctly with page 2', async () => {
      await service.findBookmarked(authUser, { page: 2 });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        null,
        { distance: QueryOrder.ASC },
        expect.any(Map),
        12,
        12,
      );
    });

    it('should sort by price when sort=price', async () => {
      await service.findBookmarked(authUser, { sort: ProductSort.PRICE });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        null,
        { price: QueryOrder.ASC },
        expect.any(Map),
        12,
        0,
      );
    });

    it('should filter by title or description when search is provided', async () => {
      await service.findBookmarked(authUser, { search: 'teclado' });

      expect(productRepoMock.findByDistance).toHaveBeenCalledWith(
        authUser.lat,
        authUser.lng,
        authUser.id,
        {
          $or: [
            { title: { $like: '%teclado%' } },
            { description: { $like: '%teclado%' } },
          ],
        },
        { distance: QueryOrder.ASC },
        expect.any(Map),
        12,
        0,
      );
      expect(productRepoMock.count).toHaveBeenCalledWith({
        bookmarks: { user: 1 },
        $or: [
          { title: { $like: '%teclado%' } },
          { description: { $like: '%teclado%' } },
        ],
      });
    });
  });

  describe('buyProduct', () => {
    const buyer = { id: 1 } as User;

    it('should throw NotFoundException if product is not found', async () => {
      productRepoMock.findOne.mockResolvedValue(null);
      await expect(service.buyProduct(buyer, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user tries to buy their own product', async () => {
      productRepoMock.findOne.mockResolvedValue({
        id: 10,
        owner: { id: buyer.id },
        status: ProductStatus.AVAILABLE,
      });

      await expect(service.buyProduct(buyer, 10)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if product is already sold', async () => {
      productRepoMock.findOne.mockResolvedValue({
        id: 11,
        owner: { id: 99 },
        status: ProductStatus.SOLD,
      });

      await expect(service.buyProduct(buyer, 11)).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    const owner = { id: 1 } as User;
    const otherUser = { id: 2 } as User;

    it('should throw NotFoundException if product is not found', async () => {
      productRepoMock.findOne.mockResolvedValue(null);
      await expect(service.delete(owner, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      productRepoMock.findOne.mockResolvedValue({
        id: 1,
        owner: { id: 99 },
      });
      await expect(service.delete(otherUser, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should remove product, flush entity manager, and remove photos from disk', async () => {
      const mockPhoto = { id: 10, url: 'img/products/p1.jpg' };
      const mockProduct = {
        id: 1,
        owner: { id: owner.id },
        photos: {
          getItems: () => [mockPhoto],
        },
      };
      productRepoMock.findOne.mockResolvedValue(mockProduct);

      await service.delete(owner, 1);

      expect(emMock.remove).toHaveBeenCalledWith(mockProduct);
      expect(emMock.flush).toHaveBeenCalled();
      expect(imageServiceMock.removeImage).toHaveBeenCalledWith('img/products/p1.jpg');
    });
  });
});
