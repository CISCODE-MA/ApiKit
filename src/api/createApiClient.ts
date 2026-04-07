import axios from 'axios';
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

function toInterceptedResponse(axiosRes: {
  status: number;
  headers: unknown;
  data: unknown;
}): InterceptedResponse {
  const raw = axiosRes.headers as Record<string, string> | undefined;
  return {
    status: axiosRes.status,
    headers: raw ?? {},
    data: axiosRes.data,
  };
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
  });

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
      headers: (axiosConfig.headers as unknown as Record<string, string>) ?? {},
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

      axiosResponse.data = intercepted.data;
      return axiosResponse;
    },
    (error: unknown) => {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      for (const interceptor of errorInterceptors) {
        interceptor(normalizedError);
      }
      return Promise.reject(normalizedError);
    },
  );

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
