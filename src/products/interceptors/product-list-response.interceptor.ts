import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from 'src/entities/Product';

@Injectable()
export class ProductListResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const baseUrl = req.protocol + '://' + req.headers.host + '/';
    return next.handle().pipe(
      map((products: Product[]) => {
        return {
          products: products.map(p => {
            (p.mainPhoto as any) = p.mainPhoto && baseUrl + p.mainPhoto;
            p.owner.photo = baseUrl + p.owner.photo;
            (p as any).mine = p.owner.id === req.user.id; 
            return p;
          })
        }
      })
    );
  }
}
