import axios, { AxiosError } from 'axios';
import { ApiError } from './ApiError';
import type {
  ApiClient,
  ApiClientConfig,
  ErrorInterceptor,
  InterceptedRequest,
  InterceptedResponse,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
} from './createApiClient.types';

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    if (error.response) {
      const { status, data } = error.response;
      return new ApiError(error.message, status, `HTTP_${status}`, data);
    }
    return new ApiError(error.message || 'Network error', 0, 'NETWORK_ERROR');
  }

  const message = error instanceof Error ? error.message : String(error);
  return new ApiError(message, 0, 'NETWORK_ERROR');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeHeaders(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== 'object') {
    return {};
  }

  const source =
    'toJSON' in headers && typeof (headers as Record<string, unknown>).toJSON === 'function'
      ? (headers as { toJSON(): Record<string, unknown> }).toJSON()
      : headers;

  if (!source || typeof source !== 'object') {
    return {};
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      normalized[key] = value.map((item) => String(item)).join(', ');
    } else if (value != null) {
      normalized[key] = String(value);
    }
  }
  return normalized;
}

function toInterceptedResponse(axiosRes: {
  status: number;
  headers: unknown;
  data: unknown;
}): InterceptedResponse {
  return {
    status: axiosRes.status,
    headers: normalizeHeaders(axiosRes.headers),
    data: axiosRes.data,
  };
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
  });

  const maxRetries = config.retry ?? 0;
  const baseDelay = config.retryDelay ?? 500;

  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];
  const errorInterceptors: ErrorInterceptor[] = [];

  if (config.getToken) {
    const getToken = config.getToken;
    requestInterceptors.push((req) => {
      const token = getToken();
      if (token) {
        req.headers['Authorization'] = `Bearer ${token}`;
      }
      return req;
    });
  }

  instance.interceptors.request.use((axiosConfig) => {
    let intercepted: InterceptedRequest = {
      url: axiosConfig.url ?? '',
      method: (axiosConfig.method ?? 'get').toLowerCase(),
      headers: normalizeHeaders(axiosConfig.headers),
      params: axiosConfig.params as Record<string, unknown> | undefined,
      data: axiosConfig.data as unknown,
    };

    for (const interceptor of requestInterceptors) {
      intercepted = interceptor(intercepted);
    }

    axiosConfig.url = intercepted.url;
    axiosConfig.method = intercepted.method;
    axiosConfig.headers.set(intercepted.headers);
    axiosConfig.params = intercepted.params;
    axiosConfig.data = intercepted.data;

    return axiosConfig;
  });

  instance.interceptors.response.use(
    (axiosResponse) => {
      let intercepted = toInterceptedResponse(axiosResponse);

      for (const interceptor of responseInterceptors) {
        intercepted = interceptor(intercepted);
      }

      axiosResponse.status = intercepted.status;
      axiosResponse.headers = intercepted.headers as typeof axiosResponse.headers;
      axiosResponse.data = intercepted.data;
      return axiosResponse;
    },
    (error: unknown) => {
      const apiError = toApiError(error);
      for (const interceptor of errorInterceptors) {
        interceptor(apiError);
      }
      return Promise.reject(apiError);
    },
  );

  async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        const apiError = error instanceof ApiError ? error : toApiError(error);

        if (attempt < maxRetries && RETRYABLE_STATUSES.has(apiError.status)) {
          await delay(baseDelay * 2 ** attempt);
          continue;
        }

        throw apiError;
      }
    }
  }

  return {
    async get<T>(url: string, requestConfig?: RequestConfig): Promise<T> {
      return withRetry(async () => {
        const response = await instance.get<T>(url, {
          headers: requestConfig?.headers,
          params: requestConfig?.params,
          signal: requestConfig?.signal,
        });
        return response.data;
      });
    },

    async post<T>(url: string, data?: unknown, requestConfig?: RequestConfig): Promise<T> {
      return withRetry(async () => {
        const response = await instance.post<T>(url, data, {
          headers: requestConfig?.headers,
          params: requestConfig?.params,
          signal: requestConfig?.signal,
        });
        return response.data;
      });
    },

    async put<T>(url: string, data?: unknown, requestConfig?: RequestConfig): Promise<T> {
      return withRetry(async () => {
        const response = await instance.put<T>(url, data, {
          headers: requestConfig?.headers,
          params: requestConfig?.params,
          signal: requestConfig?.signal,
        });
        return response.data;
      });
    },

    async patch<T>(url: string, data?: unknown, requestConfig?: RequestConfig): Promise<T> {
      return withRetry(async () => {
        const response = await instance.patch<T>(url, data, {
          headers: requestConfig?.headers,
          params: requestConfig?.params,
          signal: requestConfig?.signal,
        });
        return response.data;
      });
    },

    async delete<T>(url: string, requestConfig?: RequestConfig): Promise<T> {
      return withRetry(async () => {
        const response = await instance.delete<T>(url, {
          headers: requestConfig?.headers,
          params: requestConfig?.params,
          signal: requestConfig?.signal,
        });
        return response.data;
      });
    },

    addRequestInterceptor(interceptor: RequestInterceptor): void {
      requestInterceptors.push(interceptor);
    },

    addResponseInterceptor(interceptor: ResponseInterceptor): void {
      responseInterceptors.push(interceptor);
    },

    addErrorInterceptor(interceptor: ErrorInterceptor): void {
      errorInterceptors.push(interceptor);
    },
  };
}
