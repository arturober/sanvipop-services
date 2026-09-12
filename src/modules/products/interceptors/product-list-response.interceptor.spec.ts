import { ProductListResponseInterceptor } from './product-list-response.interceptor.js';

describe('ProductListResponseInterceptor', () => {
  it('should be defined', () => {
    expect(new ProductListResponseInterceptor({ get: () => '' } as any)).toBeDefined();
  });
});
