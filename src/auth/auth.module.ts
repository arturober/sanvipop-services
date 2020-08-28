import { Module, DynamicModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { IsUserAlreadyExistConstraint } from './validators/user-exists.validator';
import { CommonsModule } from '../commons/commons.module';
import { JWT_KEY, JWT_EXPIRATION, GOOGLE_ID, AuthConfig } from './interfaces/providers';
import { User } from 'src/entities/User';
import { UsersModule } from 'src/users/users.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({})
export class AuthModule {
  static forRoot(config: AuthConfig): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        MikroOrmModule.forFeature([User]), 
        UsersModule, 
        CommonsModule
      ],
      controllers: [AuthController],
      providers: [
        IsUserAlreadyExistConstraint,
        AuthService,
        JwtStrategy,
        {
          provide: JWT_KEY,
          useValue: 'YTRnNk05TC4sLeG4iSorYXNkZg==',
        },
        {
          provide: JWT_EXPIRATION,
          useValue: 3600 * 24 * 365, // A year
        },
        {
          provide: GOOGLE_ID,
          useValue: config.googleId,
        },
      ]
    };
  }
}
