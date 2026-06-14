import { apiRequest } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const register = (email: string, password: string, name: string) => {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password, name },
    auth: false,
  });
};

export const login = (email: string, password: string) => {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
};

export const getMe = () => {
  return apiRequest<{ user: User }>('/auth/me');
};

export const updateMe = (name: string) => {
  return apiRequest<{ user: User }>('/auth/me', {
    method: 'PATCH',
    body: { name },
  });
};
