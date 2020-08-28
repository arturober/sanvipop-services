import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Product } from 'src/entities/Product';
import { Transaction } from 'src/entities/Transaction';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities/User';

@Module({
  imports: [MikroOrmModule.forFeature([Product, User, Transaction])],
  providers: [TransactionsService],
  controllers: [TransactionsController]
})
export class TransactionsModule {}
