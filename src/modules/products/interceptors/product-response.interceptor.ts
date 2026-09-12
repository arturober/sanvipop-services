import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { Product } from '../entities/product.entity.js';

@Injectable()
export class ProductResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((p: Product | Product[]) => ({
        product: this.transformImageUrl(req, Array.isArray(p) ? p[0] : p),
      })),
    );
  }

  private transformImageUrl(req: any, p: Product) {
    if (!p) return p;
    const basePath = this.configService.get<string>('basePath') || '';
    const prefix = basePath ? `${basePath}/` : '';
    const baseUrl = `${req.protocol}://${req.headers.host}/${prefix}`;

    if (p.mainPhoto) {
      const mainPhotoObj = p.mainPhoto as any;
      if (typeof mainPhotoObj === 'string' && !mainPhotoObj.startsWith('http')) {
        p.mainPhoto = (baseUrl + mainPhotoObj) as any;
      } else if (mainPhotoObj?.url && !mainPhotoObj.url.startsWith('http')) {
        mainPhotoObj.url = baseUrl + mainPhotoObj.url;
      }
    }

    if (p.owner && p.owner.photo && !p.owner.photo.startsWith('http')) {
      p.owner.photo = baseUrl + p.owner.photo;
    }

    (p as any).mine = req.user && p.owner ? p.owner.id === req.user.id : false;

    if (p.photos && (p.photos as any).getItems) {
      for (const photo of p.photos.getItems()) {
        if (photo.url && !photo.url.startsWith('http')) {
          photo.url = baseUrl + photo.url;
        }
      }
    }

    return p;
  }
}
