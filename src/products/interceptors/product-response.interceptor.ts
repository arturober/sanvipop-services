import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Product } from 'src/entities/Product';
import { map } from 'rxjs/operators';
import { ProductPhoto } from 'src/entities/ProductPhoto';

@Injectable()
export class ProductResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const baseUrl = req.protocol + '://' + req.headers.host + '/';
    return next.handle().pipe(
      map((p: Product) => {
        (p.mainPhoto as any) = p.mainPhoto && baseUrl + p.mainPhoto;
        p.owner.photo = baseUrl + p.owner.photo;
        (p as any).mine = p.owner.id === req.user.id; 
        if(p.photos) {
          (p.photos as any) = (p.photos as any as ProductPhoto[]).map(photo => {
            photo.url = baseUrl + photo.url;
            return photo;
          });
        }
        return {product: p};
      })
    );
  }
}
