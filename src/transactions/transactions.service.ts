import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product } from 'src/entities/Product';
import { ProductsRepository } from 'src/products/products.repository';
import { EntityRepository } from '@mikro-orm/core';
import { Transaction } from 'src/entities/Transaction';
import { AddRatingDto } from './dto/add-rating.dto';
import { User } from 'src/entities/User';
import { RatingResponse, RatingResponses } from './interfaces/rating-response';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Product) private readonly productRepository: ProductsRepository,
        @InjectRepository(User) private readonly userRepository: EntityRepository<User>,
        @InjectRepository(Transaction) private readonly transactionRepository: EntityRepository<Transaction>,
    ) {}

    async getUserRatings(userId: number): Promise<RatingResponses> {
        const transactions = await this.transactionRepository.find({
            $or: [
                {buyer: {id: userId}, $not: {sellerRating: null}}, 
                {seller: {id: userId}, $not: {buyerRating: null}}
            ]
        }, {populate: ['product', 'seller', 'buyer']});
        return { ratings: transactions.map(t => {
            return {
                product: t.product,
                user: t.buyer.id === userId ? t.seller : t.buyer,
                comment: t.buyer.id === userId ? t.sellerComment : t.buyerComment,
                rating: t.buyer.id === userId ? t.sellerRating : t.buyerRating
            };
        })};
    }

    async addRating(ratingDto: AddRatingDto, authUser: User): Promise<void> {
        const product = await this.productRepository.findOne({id: ratingDto.product});
        console.log(ratingDto);
        if(!product) {
            throw new NotFoundException('Product not found');
        } else if(product.status !== 3) {
            throw new ForbiddenException('You can only rate sold products');
        }

        let transaction = await this.transactionRepository.findOne({product: ratingDto.product})
        if (!transaction) {
           transaction = new Transaction(product);
        }
        if(transaction.seller.id === authUser.id) {
            transaction.sellerRating = ratingDto.rating;
            transaction.sellerComment = ratingDto.comment;
        } else if (transaction.buyer.id === authUser.id) {
            transaction.buyerRating = ratingDto.rating;
            transaction.buyerComment = ratingDto.comment;
        } else {
            throw new ForbiddenException('Your user is not involved in the transaction');
        }
        await this.transactionRepository.getEntityManager().persistAndFlush(transaction);
    }
}
