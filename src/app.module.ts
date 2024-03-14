import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CommonsModule } from './commons/commons.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import mikroOrmConfig from './mikro-orm.config';
import { AuthModule } from './auth/auth.module';
import { ID_GOOGLE } from './google-id';
import { TransactionsModule } from './transactions/transactions.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    ProductsModule,
    CommonsModule,
    CategoriesModule,
    UsersModule,
    AuthModule.forRoot({googleId: configuration().google_id,}),
    TransactionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
