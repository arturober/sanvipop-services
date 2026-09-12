import { UserResponseInterceptor } from './user-response.interceptor.js';

describe('UserResponseInterceptor', () => {
  it('should be defined', () => {
    expect(new UserResponseInterceptor({ get: () => '' } as any)).toBeDefined();
  });
});

