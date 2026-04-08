export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  getToken?: () => string | null;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface InterceptedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
}

export interface InterceptedResponse {
  status: number;
  headers: Record<string, string>;
  data: unknown;
}

export type RequestInterceptor = (request: InterceptedRequest) => InterceptedRequest;
export type ResponseInterceptor = (response: InterceptedResponse) => InterceptedResponse;
export type ErrorInterceptor = (error: Error) => void;

export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
  addErrorInterceptor(interceptor: ErrorInterceptor): void;
}
