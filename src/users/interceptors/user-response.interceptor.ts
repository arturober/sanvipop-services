import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/entities/User';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserResponseInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((u: User) => {
        return { user: this.transformImageUrl(req, u) };
      }),
    );
  }

  private transformImageUrl(req, user: User) {
    const baseUrl = `${req.protocol}://${
      req.headers.host
    }/${this.configService.get<string>('basePath')}`;
    user.photo = user.photo && baseUrl + user.photo;
    return user;
  }
}
