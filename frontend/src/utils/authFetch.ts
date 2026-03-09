import type { AuthFetchOptions } from './types';

const API_URL = import.meta.env.VITE_API_URL;

export const authFetch = async ({ endpoint, method, body }: AuthFetchOptions): Promise<Response> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return res;
}
