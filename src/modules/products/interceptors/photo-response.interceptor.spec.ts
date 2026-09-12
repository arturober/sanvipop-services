import { PhotoResponseInterceptor } from './photo-response.interceptor.js';

describe('PhotoResponseInterceptor', () => {
  it('should be defined', () => {
    expect(new PhotoResponseInterceptor({ get: () => '' } as any)).toBeDefined();
  });
});
