import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { TransactionsController } from './transactions.controller.js';
import { TransactionsService } from './transactions.service.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { AddRatingDto } from './dto/add-rating.dto.js';

describe('Transactions Controller', () => {
  let controller: TransactionsController;

  const mockService = {
    getUserRatings: vi.fn(),
    addRating: vi.fn(),
  };

  const mockUser = {
    id: 1,
    name: 'Arturo',
    email: 'arturo@test.com',
  } as User;

  const mockOtherUser = {
    id: 2,
    name: 'María',
    email: 'maria@test.com',
  } as User;

  const mockProduct = {
    id: 10,
    title: 'Bicicleta de montaña',
  } as Product;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyRatings', () => {
    it('should return ratings for the authenticated user', async () => {
      const mockResult = {
        ratings: [
          {
            product: mockProduct,
            user: mockOtherUser,
            rating: 5,
            comment: 'Gran comprador',
          },
        ],
      };
      mockService.getUserRatings.mockResolvedValue(mockResult);

      const result = await controller.getMyRatings(mockUser);
      expect(mockService.getUserRatings).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserRatings', () => {
    it('should return ratings for the specified user', async () => {
      const mockResult = { ratings: [] };
      mockService.getUserRatings.mockResolvedValue(mockResult);

      const result = await controller.getUserRatings(2);
      expect(mockService.getUserRatings).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createTransaction', () => {
    const ratingDto: AddRatingDto = {
      product: 10,
      rating: 5,
      comment: 'Excelente experiencia de compra',
    };

    it('should return the added rating on successful creation', async () => {
      const expectedRatingResponse = {
        rating: {
          product: mockProduct,
          user: mockOtherUser,
          rating: 5,
          comment: 'Excelente experiencia de compra',
        },
      };
      mockService.addRating.mockResolvedValue(expectedRatingResponse);

      const result = await controller.createTransaction(mockUser, ratingDto);

      expect(mockService.addRating).toHaveBeenCalledWith(ratingDto, mockUser);
      expect(result).toEqual(expectedRatingResponse);
    });

    it('should throw ForbiddenException if user tries to rate more than once (UniqueConstraintViolation)', async () => {
      const constraintErr = new UniqueConstraintViolationException(new Error('duplicate key'));
      mockService.addRating.mockRejectedValue(constraintErr);

      await expect(controller.createTransaction(mockUser, ratingDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should rethrow unexpected errors', async () => {
      const unexpectedErr = new Error('Database connection failed');
      mockService.addRating.mockRejectedValue(unexpectedErr);

      await expect(controller.createTransaction(mockUser, ratingDto)).rejects.toThrow(
        unexpectedErr,
      );
    });
  });
});
