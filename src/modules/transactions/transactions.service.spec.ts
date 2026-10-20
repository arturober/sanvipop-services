import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { Transaction } from './entities/transaction.entity.js';
import { Product, ProductStatus } from '../products/entities/product.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AddRatingDto } from './dto/add-rating.dto.js';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockEm = {
    persist: vi.fn(),
    flush: vi.fn(),
  };

  const mockTransactionRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    getEntityManager: vi.fn().mockReturnValue(mockEm),
  };

  const mockProductRepository = {
    findOne: vi.fn(),
    findOneOrFail: vi.fn(),
  };

  const mockUserRepository = {
    findOne: vi.fn(),
  };

  const sellerUser = { id: 1, name: 'Seller' } as User;
  const buyerUser = { id: 2, name: 'Buyer' } as User;
  const otherUser = { id: 3, name: 'Stranger' } as User;

  const soldProduct = {
    id: 10,
    title: 'Bicicleta',
    status: ProductStatus.SOLD,
    owner: sellerUser,
    soldTo: buyerUser,
  } as Product;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRatings', () => {
    it('should return ratings mapped with the counterparty user', async () => {
      const mockTransactions = [
        {
          product: soldProduct,
          seller: sellerUser,
          buyer: buyerUser,
          sellerRating: 5,
          sellerComment: 'Muy buen comprador',
          buyerRating: 4,
          buyerComment: 'Buen vendedor',
        },
      ];
      mockTransactionRepository.find.mockResolvedValue(mockTransactions);

      const result = await service.getUserRatings(buyerUser.id);

      expect(mockTransactionRepository.find).toHaveBeenCalled();
      expect(result.ratings).toHaveLength(1);
      expect(result.ratings[0]).toEqual({
        product: soldProduct,
        user: sellerUser,
        rating: 5,
        comment: 'Muy buen comprador',
      });
    });
  });

  describe('addRating', () => {
    const ratingDto: AddRatingDto = {
      product: 10,
      rating: 5,
      comment: 'Todo perfecto',
    };

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.addRating(ratingDto, sellerUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if product is not SOLD', async () => {
      mockProductRepository.findOne.mockResolvedValue({
        id: 10,
        status: ProductStatus.AVAILABLE,
      });

      await expect(service.addRating(ratingDto, sellerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if user is not involved in transaction', async () => {
      mockProductRepository.findOne.mockResolvedValue(soldProduct);
      mockTransactionRepository.findOne.mockResolvedValue({
        seller: sellerUser,
        buyer: buyerUser,
        product: soldProduct,
      });

      await expect(service.addRating(ratingDto, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should add rating and return the added rating when seller rates buyer', async () => {
      mockProductRepository.findOne.mockResolvedValue(soldProduct);
      const existingTransaction = {
        seller: sellerUser,
        buyer: buyerUser,
        product: soldProduct,
        sellerRating: null,
        sellerComment: null,
      };
      mockTransactionRepository.findOne.mockResolvedValue(existingTransaction);

      const result = await service.addRating(ratingDto, sellerUser);

      expect(existingTransaction.sellerRating).toBe(5);
      expect(existingTransaction.sellerComment).toBe('Todo perfecto');
      expect(mockEm.persist).toHaveBeenCalledWith(existingTransaction);
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result).toEqual({
        rating: {
          product: soldProduct,
          user: buyerUser,
          rating: 5,
          comment: 'Todo perfecto',
        },
      });
    });

    it('should add rating and return the added rating when buyer rates seller', async () => {
      mockProductRepository.findOne.mockResolvedValue(soldProduct);
      const existingTransaction = {
        seller: sellerUser,
        buyer: buyerUser,
        product: soldProduct,
        buyerRating: null,
        buyerComment: null,
      };
      mockTransactionRepository.findOne.mockResolvedValue(existingTransaction);

      const result = await service.addRating(ratingDto, buyerUser);

      expect(existingTransaction.buyerRating).toBe(5);
      expect(existingTransaction.buyerComment).toBe('Todo perfecto');
      expect(mockEm.persist).toHaveBeenCalledWith(existingTransaction);
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result).toEqual({
        rating: {
          product: soldProduct,
          user: sellerUser,
          rating: 5,
          comment: 'Todo perfecto',
        },
      });
    });

    it('should create a new transaction if none exists and set rating', async () => {
      mockProductRepository.findOne.mockResolvedValue(soldProduct);
      mockTransactionRepository.findOne.mockResolvedValue(null);
      mockProductRepository.findOneOrFail.mockResolvedValue(soldProduct);

      const result = await service.addRating(ratingDto, sellerUser);

      expect(mockProductRepository.findOneOrFail).toHaveBeenCalledWith(
        { id: ratingDto.product },
        { populate: ['owner', 'soldTo'] },
      );
      expect(mockEm.persist).toHaveBeenCalled();
      expect(mockEm.flush).toHaveBeenCalled();
      expect(result.rating.product).toBe(soldProduct);
      expect(result.rating.user).toBe(buyerUser);
      expect(result.rating.rating).toBe(5);
    });

    it('should throw ConflictException if user already rated this transaction', async () => {
      mockProductRepository.findOne.mockResolvedValue(soldProduct);
      const existingTransaction = {
        seller: sellerUser,
        buyer: buyerUser,
        product: soldProduct,
        sellerRating: 4,
        sellerComment: 'Ya valorado',
      };
      mockTransactionRepository.findOne.mockResolvedValue(existingTransaction);

      await expect(service.addRating(ratingDto, sellerUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
