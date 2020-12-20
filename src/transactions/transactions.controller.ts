import { Controller, Get, UseGuards, Param, ParseIntPipe, Put, Post, Body, ValidationPipe, HttpCode, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/entities/User';
import { AddRatingDto } from './dto/add-rating.dto';
import { TransactionsService } from './transactions.service';
import { RatingResponses } from './interfaces/rating-response';

@Controller('ratings')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get('user/me')
    async getMyRatings(@AuthUser() authUser: User): Promise<RatingResponses> {
        return await this.transactionsService.getUserRatings(authUser.id);
    }

    @Get('user/:idUser')
    async getUserRatings(@Param('idUser', ParseIntPipe) idUser: number): Promise<RatingResponses> {
        return this.transactionsService.getUserRatings(idUser);
    }

    @Post()
    @HttpCode(204)
    async createTransaction(
        @AuthUser() authUser: User,
        @Body(new ValidationPipe({ transform: true, whitelist: true})) ratingDto: AddRatingDto,
    ): Promise<void> {
        try{
            await this.transactionsService.addRating(ratingDto, authUser);
        } catch(e) {
            if(e.code === 'ER_DUP_ENTRY') {
                throw new ForbiddenException('You can\'t rate a product transaction more than once');
            } else {
                throw e;
            }
        }
    }
}
