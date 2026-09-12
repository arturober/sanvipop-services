import { ProductResponseInterceptor } from './product-response.interceptor.js';

describe('ProductResponseInterceptor', () => {
  it('should be defined', () => {
    expect(new ProductResponseInterceptor({ get: () => '' } as any)).toBeDefined();
  });
});
