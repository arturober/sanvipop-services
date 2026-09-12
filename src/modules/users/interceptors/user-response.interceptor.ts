import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity.js';

@Injectable()
export class UserResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((u: User) => {
        return { user: this.transformImageUrl(req, u) };
      }),
    );
  }

  private transformImageUrl(req: any, user: User) {
    if (!user) return user;
    const basePath = this.configService.get<string>('basePath') || '';
    const prefix = basePath ? `${basePath}/` : '';
    const baseUrl = `${req.protocol}://${req.headers.host}/${prefix}`;
    user.photo = user.photo && !user.photo.startsWith('http') ? baseUrl + user.photo : user.photo;
    return user;
  }
}
