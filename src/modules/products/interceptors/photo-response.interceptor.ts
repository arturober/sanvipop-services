import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { ProductPhoto } from '../entities/product-photo.entity.js';

@Injectable()
export class PhotoResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((p: ProductPhoto) => ({ photo: this.transformImageUrl(req, p) })),
    );
  }

  private transformImageUrl(req: any, p: ProductPhoto) {
    if (!p) return p;
    const basePath = this.configService.get<string>('basePath') || '';
    const prefix = basePath ? `${basePath}/` : '';
    const baseUrl = `${req.protocol}://${req.headers.host}/${prefix}`;
    p.url = p.url && !p.url.startsWith('http') ? baseUrl + p.url : p.url;
    return p;
  }
}
