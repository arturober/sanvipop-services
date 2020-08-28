import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ProductPhoto } from 'src/entities/ProductPhoto';
import { map } from 'rxjs/operators';

@Injectable()
export class PhotoResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const baseUrl = req.protocol + '://' + req.headers.host + '/';
    return next.handle().pipe(
      map((p: ProductPhoto) => {
        p.url = baseUrl + p.url;
        return {photo: p};
      })
    );
  }
}
