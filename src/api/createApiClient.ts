import axios from 'axios';
import type { ApiClient, ApiClientConfig, RequestConfig } from './createApiClient.types';

export function createApiClient(config: ApiClientConfig): ApiClient {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
  });

  return {
    async get<T>(url: string, requestConfig?: RequestConfig): Promise<T> {
      const response = await instance.get<T>(url, {
        headers: requestConfig?.headers,
        params: requestConfig?.params,
        signal: requestConfig?.signal,
      });
      return response.data;
    },

    async post<T>(url: string, data?: unknown, requestConfig?: RequestConfig): Promise<T> {
      const response = await instance.post<T>(url, data, {
        headers: requestConfig?.headers,
        params: requestConfig?.params,
        signal: requestConfig?.signal,
      });
      return response.data;
    },

    async put<T>(url: string, data?: unknown, requestConfig?: RequestConfig): Promise<T> {
      const response = await instance.put<T>(url, data, {
        headers: requestConfig?.headers,
        params: requestConfig?.params,
        signal: requestConfig?.signal,
      });
      return response.data;
    },

    async patch<T>(url: string, data?: unknown, requestConfig?: RequestConfig): Promise<T> {
      const response = await instance.patch<T>(url, data, {
        headers: requestConfig?.headers,
        params: requestConfig?.params,
        signal: requestConfig?.signal,
      });
      return response.data;
    },

    async delete<T>(url: string, requestConfig?: RequestConfig): Promise<T> {
      const response = await instance.delete<T>(url, {
        headers: requestConfig?.headers,
        params: requestConfig?.params,
        signal: requestConfig?.signal,
      });
      return response.data;
    },
  };
}
