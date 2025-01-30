// src/utils/api-client.ts
import { useAuthStore } from '@/store/auth';

export const BASE_URL = 'http://localhost:8000';

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
  withAuth?: boolean; // Flag to determine if request needs auth
};

const getAuthHeader = (): HeadersInit => {
  const { token } = useAuthStore.getState();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiClient = {
  request: async <T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> => {
    let url = `${BASE_URL}${endpoint}`;

    if (options?.params) {
      const searchParams = new URLSearchParams(options.params);
      url += `?${searchParams}`;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options?.withAuth && getAuthHeader()),
      ...options?.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Something went wrong');
    }

    return response.json();
  },

  getBaseUrl: () => BASE_URL,

  // Helper methods
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, {
      ...options,
      method: 'GET',
    }),

  post: <T>(endpoint: string, data: unknown, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    }),
};
