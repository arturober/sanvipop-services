import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

import { vi, describe, beforeEach, it, expect } from 'vitest';
import { User } from '../users/entities/user.entity.js';
import { ProductSort } from './dto/products-query.dto.js';
import { UserProductsQueryDto, ProductUserStatus } from './dto/user-products-query.dto.js';

describe('Products Controller', () => {
  let controller: ProductsController;
  let productsServiceMock: {
    findAll: ReturnType<typeof vi.fn>;
    findByUser: ReturnType<typeof vi.fn>;
    findBookmarked: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    productsServiceMock = {
      findAll: vi.fn().mockResolvedValue({
        products: [],
        page: 2,
        total_pages: 1,
        total_products: 5,
      }),
      findByUser: vi.fn().mockResolvedValue({
        products: [],
        page: 1,
        total_pages: 1,
        total_products: 3,
      }),
      findBookmarked: vi.fn().mockResolvedValue({
        products: [],
        page: 1,
        total_pages: 1,
        total_products: 2,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsServiceMock,
        },
        {
          provide: ConfigService,
          useValue: { get: () => '' },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllProducts should call productsService.findAll when neither user nor status is provided', async () => {
    const authUser = { id: 1 } as User;
    const query: UserProductsQueryDto = {
      page: 2,
      sort: ProductSort.PRICE,
      search: 'bici',
    };

    const result = await controller.getAllProducts(authUser, query);

    expect(productsServiceMock.findAll).toHaveBeenCalledWith(authUser, query);
    expect(result).toEqual({
      products: [],
      page: 2,
      total_pages: 1,
      total_products: 5,
    });
  });

  it('getAllProducts should call productsService.findByUser when user or user status is provided', async () => {
    const authUser = { id: 1 } as User;
    const query: UserProductsQueryDto = {
      page: 1,
      user: 5,
      status: ProductUserStatus.SOLD,
      sort: ProductSort.VIEWS,
      search: 'moto',
    };

    const result = await controller.getAllProducts(authUser, query);

    expect(productsServiceMock.findByUser).toHaveBeenCalledWith(authUser, query);
    expect(result).toEqual({
      products: [],
      page: 1,
      total_pages: 1,
      total_products: 3,
    });
  });

  it('getAllProducts should call productsService.findByUser when only status selling is provided', async () => {
    const authUser = { id: 1 } as User;
    const query: UserProductsQueryDto = {
      status: ProductUserStatus.SELLING,
    };

    const result = await controller.getAllProducts(authUser, query);

    expect(productsServiceMock.findByUser).toHaveBeenCalledWith(authUser, query);
    expect(result).toEqual({
      products: [],
      page: 1,
      total_pages: 1,
      total_products: 3,
    });
  });

  it('getAllProducts should call productsService.findBookmarked when status is bookmarks', async () => {
    const authUser = { id: 1 } as User;
    const query: UserProductsQueryDto = {
      page: 1,
      status: ProductUserStatus.BOOKMARKS,
      sort: ProductSort.DISTANCE,
      search: 'bici',
    };

    const result = await controller.getAllProducts(authUser, query);

    expect(productsServiceMock.findBookmarked).toHaveBeenCalledWith(
      authUser,
      query,
      authUser.id,
    );
    expect(result).toEqual({
      products: [],
      page: 1,
      total_pages: 1,
      total_products: 2,
    });
  });

  it('getAllProducts should call productsService.findBookmarked with target user id when status is bookmarks and user is provided', async () => {
    const authUser = { id: 1 } as User;
    const query: UserProductsQueryDto = {
      page: 1,
      user: 5,
      status: ProductUserStatus.BOOKMARKS,
    };

    const result = await controller.getAllProducts(authUser, query);

    expect(productsServiceMock.findBookmarked).toHaveBeenCalledWith(
      authUser,
      query,
      5,
    );
    expect(result).toEqual({
      products: [],
      page: 1,
      total_pages: 1,
      total_products: 2,
    });
  });
});
