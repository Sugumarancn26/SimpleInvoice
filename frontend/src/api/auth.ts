import { client } from './client.ts';

export const authApi = {
  login(email: string, password: string) {
    return client.post<{ token: string }>('/auth/login', { email, password });
  },
  me() {
    return client.get<{ id: string; email: string; fullname: string }>(
      '/auth/me',
    );
  },
};
