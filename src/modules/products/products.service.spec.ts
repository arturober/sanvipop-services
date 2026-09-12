import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepoMock: { findOne: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    productRepoMock = {
      findOne: vi.fn(),
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
          useValue: {},
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
});
