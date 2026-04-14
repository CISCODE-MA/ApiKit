import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiClient } from './createApiClient';
import { ApiError } from './ApiError';
import type { ApiClient } from './createApiClient.types';

type InterceptorFn = (...args: unknown[]) => unknown;

interface MockInterceptors {
  request: { use: ReturnType<typeof vi.fn>; handlers: InterceptorFn[] };
  response: {
    use: ReturnType<typeof vi.fn>;
    handlers: { fulfilled: InterceptorFn; rejected?: InterceptorFn }[];
  };
}

function createMockInstance() {
  const interceptors: MockInterceptors = {
    request: {
      handlers: [],
      use: vi.fn((fn: InterceptorFn) => {
        interceptors.request.handlers.push(fn);
      }),
    },
    response: {
      handlers: [],
      use: vi.fn((fulfilled: InterceptorFn, rejected?: InterceptorFn) => {
        interceptors.response.handlers.push({ fulfilled, rejected });
      }),
    },
  };

  async function runRequest(
    method: string,
    url: string,
    dataOrConfig?: unknown,
    maybeConfig?: unknown,
  ) {
    let axiosConfig: Record<string, unknown> = {
      url,
      method,
      headers: {
        set: vi.fn((h: Record<string, string>) => {
          axiosConfig.headers = { ...h, set: (axiosConfig.headers as Record<string, unknown>).set };
        }),
      },
      params: undefined,
      data: undefined,
    };

    if (method === 'get' || method === 'delete') {
      const rc = dataOrConfig as Record<string, unknown> | undefined;
      if (rc?.headers)
        (axiosConfig.headers as Record<string, unknown>) = {
          ...(rc.headers as Record<string, string>),
          set: (axiosConfig.headers as Record<string, unknown>).set,
        };
      axiosConfig.params = rc?.params;
      axiosConfig.data = undefined;
    } else {
      axiosConfig.data = dataOrConfig;
      const rc = maybeConfig as Record<string, unknown> | undefined;
      if (rc?.headers)
        (axiosConfig.headers as Record<string, unknown>) = {
          ...(rc.headers as Record<string, string>),
          set: (axiosConfig.headers as Record<string, unknown>).set,
        };
      axiosConfig.params = rc?.params;
    }

    for (const handler of interceptors.request.handlers) {
      axiosConfig = handler(axiosConfig) as Record<string, unknown>;
    }

    const responseData = mockResponses[`${method}:${url}`];
    if (responseData instanceof Error) {
      let rejection: unknown = responseData;
      for (const h of interceptors.response.handlers) {
        if (h.rejected) {
          try {
            await h.rejected(responseData);
          } catch (e: unknown) {
            rejection = e;
          }
        }
      }
      throw rejection;
    }

    let response = { status: 200, headers: {}, data: responseData };
    for (const h of interceptors.response.handlers) {
      response = h.fulfilled(response) as typeof response;
    }

    return response;
  }

  const mockResponses: Record<string, unknown> = {};

  function setResponse(method: string, url: string, data: unknown) {
    mockResponses[`${method}:${url}`] = data;
  }

  const instance = {
    interceptors,
    get: vi.fn((url: string, config?: unknown) => runRequest('get', url, config)),
    post: vi.fn((url: string, data?: unknown, config?: unknown) =>
      runRequest('post', url, data, config),
    ),
    put: vi.fn((url: string, data?: unknown, config?: unknown) =>
      runRequest('put', url, data, config),
    ),
    patch: vi.fn((url: string, data?: unknown, config?: unknown) =>
      runRequest('patch', url, data, config),
    ),
    delete: vi.fn((url: string, config?: unknown) => runRequest('delete', url, config)),
  };

  return { instance, setResponse, interceptors };
}

let mockState: ReturnType<typeof createMockInstance>;

vi.mock('axios', () => {
  class AxiosErrorMock extends Error {
    isAxiosError = true;
    response?: { status: number; data: unknown };

    constructor(
      message: string,
      _code?: string,
      _config?: unknown,
      _request?: unknown,
      response?: { status: number; data: unknown },
    ) {
      super(message);
      this.name = 'AxiosError';
      this.response = response;
    }
  }

  return {
    default: {
      create: vi.fn(() => {
        mockState = createMockInstance();
        return mockState.instance;
      }),
    },
    AxiosError: AxiosErrorMock,
  };
});

import axios, { AxiosError } from 'axios';

function createAxiosError(message: string, response?: { status: number; data: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new AxiosError(message, undefined, undefined, undefined, response as any);
}

describe('createApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createApiClient({ baseURL: 'https://api.example.com' });
  });

  // ─── AC1: Config ──────────────────────────────────────────────────

  it('should create an axios instance with the provided config', () => {
    createApiClient({
      baseURL: 'https://test.api.com',
      timeout: 5000,
      headers: { Authorization: 'Bearer token' },
    });

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://test.api.com',
      timeout: 5000,
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('should create an axios instance with only baseURL when optional fields are omitted', () => {
    createApiClient({ baseURL: 'https://minimal.api.com' });

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://minimal.api.com',
      timeout: undefined,
      headers: undefined,
    });
  });

  // ─── AC1: All 5 HTTP methods tested with mock responses ──────────

  describe('get', () => {
    it('should call instance.get and return response.data', async () => {
      const data = { id: 1, name: 'Test' };
      mockState.setResponse('get', '/users/1', data);

      const result = await client.get<{ id: number; name: string }>('/users/1');

      expect(mockState.instance.get).toHaveBeenCalled();
      expect(result).toEqual(data);
    });

    it('should forward request config options', async () => {
      mockState.setResponse('get', '/users', []);
      const controller = new AbortController();

      await client.get('/users', {
        headers: { 'X-Custom': 'value' },
        params: { page: 1 },
        signal: controller.signal,
      });

      expect(mockState.instance.get).toHaveBeenCalledWith('/users', {
        headers: { 'X-Custom': 'value' },
        params: { page: 1 },
        signal: controller.signal,
      });
    });
  });

  describe('post', () => {
    it('should call instance.post with data and return response.data', async () => {
      const responseData = { id: 2, name: 'Created' };
      mockState.setResponse('post', '/users', responseData);

      const result = await client.post<{ id: number; name: string }>('/users', {
        name: 'Created',
      });

      expect(mockState.instance.post).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });

    it('should forward request config options on post', async () => {
      mockState.setResponse('post', '/users', {});

      await client.post('/users', { name: 'Test' }, { headers: { 'X-Token': 'abc' } });

      expect(mockState.instance.post).toHaveBeenCalledWith(
        '/users',
        { name: 'Test' },
        { headers: { 'X-Token': 'abc' }, params: undefined, signal: undefined },
      );
    });
  });

  describe('put', () => {
    it('should call instance.put with data and return response.data', async () => {
      const responseData = { id: 1, name: 'Updated' };
      mockState.setResponse('put', '/users/1', responseData);

      const result = await client.put<{ id: number; name: string }>('/users/1', {
        name: 'Updated',
      });

      expect(mockState.instance.put).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });

  describe('patch', () => {
    it('should call instance.patch with data and return response.data', async () => {
      const responseData = { id: 1, name: 'Patched' };
      mockState.setResponse('patch', '/users/1', responseData);

      const result = await client.patch<{ id: number; name: string }>('/users/1', {
        name: 'Patched',
      });

      expect(mockState.instance.patch).toHaveBeenCalled();
      expect(result).toEqual(responseData);
    });
  });

  describe('delete', () => {
    it('should call instance.delete and return response.data', async () => {
      mockState.setResponse('delete', '/users/1', { success: true });

      const result = await client.delete<{ success: boolean }>('/users/1');

      expect(mockState.instance.delete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should forward request config options on delete', async () => {
      mockState.setResponse('delete', '/users/1', {});

      const controller = new AbortController();
      await client.delete('/users/1', { params: { hard: true }, signal: controller.signal });

      expect(mockState.instance.delete).toHaveBeenCalledWith('/users/1', {
        headers: undefined,
        params: { hard: true },
        signal: controller.signal,
      });
    });
  });

  // ─── AC4 + AC5: ApiError shape and network error mapping ─────────

  describe('error mapping to ApiError', () => {
    it('should map HTTP errors to ApiError with status, code, message, and details', async () => {
      const axiosError = createAxiosError('Not Found', {
        status: 404,
        data: { detail: 'Resource missing' },
      });
      mockState.setResponse('get', '/missing', axiosError);

      try {
        await client.get('/missing');
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.name).toBe('ApiError');
        expect(apiError.message).toBe('Not Found');
        expect(apiError.status).toBe(404);
        expect(apiError.code).toBe('HTTP_404');
        expect(apiError.details).toEqual({ detail: 'Resource missing' });
      }
    });

    it('should map network errors to status 0 and code NETWORK_ERROR', async () => {
      const axiosError = createAxiosError('Network Error');
      mockState.setResponse('get', '/down', axiosError);

      try {
        await client.get('/down');
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(0);
        expect(apiError.code).toBe('NETWORK_ERROR');
      }
    });

    it('should map generic non-Axios errors to ApiError with NETWORK_ERROR', async () => {
      mockState.setResponse('get', '/fail', new Error('Unknown'));

      try {
        await client.get('/fail');
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.status).toBe(0);
        expect(apiError.code).toBe('NETWORK_ERROR');
        expect(apiError.message).toBe('Unknown');
      }
    });

    it('should map errors on post requests to ApiError', async () => {
      const axiosError = createAxiosError('Unprocessable', {
        status: 422,
        data: { errors: ['name required'] },
      });
      mockState.setResponse('post', '/users', axiosError);

      try {
        await client.post('/users', { name: '' });
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(422);
        expect((error as ApiError).details).toEqual({ errors: ['name required'] });
      }
    });
  });

  // ─── AC3: Multiple interceptors execution order ───────────────────

  describe('addRequestInterceptor', () => {
    it('should execute request interceptors in registration order', async () => {
      const order: number[] = [];
      mockState.setResponse('get', '/test', { ok: true });

      client.addRequestInterceptor((req) => {
        order.push(1);
        req.headers['X-First'] = 'first';
        return req;
      });

      client.addRequestInterceptor((req) => {
        order.push(2);
        req.headers['X-Second'] = 'second';
        return req;
      });

      client.addRequestInterceptor((req) => {
        order.push(3);
        return req;
      });

      await client.get('/test');
      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('addResponseInterceptor', () => {
    it('should execute response interceptors in registration order', async () => {
      const order: number[] = [];
      mockState.setResponse('get', '/test', { value: 1 });

      client.addResponseInterceptor((res) => {
        order.push(1);
        return res;
      });

      client.addResponseInterceptor((res) => {
        order.push(2);
        return res;
      });

      client.addResponseInterceptor((res) => {
        order.push(3);
        return res;
      });

      await client.get('/test');
      expect(order).toEqual([1, 2, 3]);
    });

    it('should allow response interceptors to transform data', async () => {
      mockState.setResponse('get', '/test', { value: 1 });

      client.addResponseInterceptor((res) => {
        return { ...res, data: { ...(res.data as Record<string, unknown>), extra: true } };
      });

      const result = await client.get<{ value: number; extra: boolean }>('/test');
      expect(result).toEqual({ value: 1, extra: true });
    });
  });

  describe('addErrorInterceptor', () => {
    it('should execute error interceptors in registration order', async () => {
      const order: number[] = [];
      const axiosError = createAxiosError('fail', { status: 500, data: null });
      mockState.setResponse('get', '/fail', axiosError);

      client.addErrorInterceptor(() => {
        order.push(1);
      });

      client.addErrorInterceptor(() => {
        order.push(2);
      });

      client.addErrorInterceptor(() => {
        order.push(3);
      });

      await expect(client.get('/fail')).rejects.toThrow('fail');
      expect(order).toEqual([1, 2, 3]);
    });

    it('should still reject the promise after error interceptors run', async () => {
      const axiosError = createAxiosError('boom', { status: 400, data: null });
      mockState.setResponse('get', '/fail', axiosError);

      client.addErrorInterceptor(() => {
        /* logged */
      });

      await expect(client.get('/fail')).rejects.toThrow('boom');
    });

    it('should receive ApiError instances in error interceptors', async () => {
      const axiosError = createAxiosError('Server Error', { status: 500, data: null });
      mockState.setResponse('get', '/err', axiosError);

      let receivedError: Error | undefined;
      client.addErrorInterceptor((err) => {
        receivedError = err;
      });

      await expect(client.get('/err')).rejects.toThrow();
      expect(receivedError).toBeInstanceOf(ApiError);
    });
  });

  // ─── AC2: Token injector ──────────────────────────────────────────

  describe('getToken auth interceptor', () => {
    it('should inject Authorization header when getToken returns a value', async () => {
      const capturedHeaders: Record<string, string>[] = [];
      const tokenClient = createApiClient({
        baseURL: 'https://api.example.com',
        getToken: () => 'my-token-123',
      });
      tokenClient.addRequestInterceptor((req) => {
        capturedHeaders.push({ ...req.headers });
        return req;
      });
      mockState.setResponse('get', '/secure', { data: 'secret' });

      await tokenClient.get('/secure');

      expect(capturedHeaders[0]).toBeDefined();
      expect(capturedHeaders[0]['Authorization']).toBe('Bearer my-token-123');
    });

    it('should skip Authorization header when getToken returns null', async () => {
      const tokenClient = createApiClient({
        baseURL: 'https://api.example.com',
        getToken: () => null,
      });
      mockState.setResponse('get', '/public', { data: 'public' });

      await tokenClient.get('/public');

      expect(mockState.instance.get).toHaveBeenCalled();
    });

    it('should register token interceptor first before consumer interceptors', async () => {
      const order: string[] = [];
      const tokenClient = createApiClient({
        baseURL: 'https://api.example.com',
        getToken: () => {
          order.push('token');
          return 'tok';
        },
      });
      mockState.setResponse('get', '/test', {});

      tokenClient.addRequestInterceptor((req) => {
        order.push('custom');
        return req;
      });

      await tokenClient.get('/test');
      expect(order).toEqual(['token', 'custom']);
    });

    it('should call getToken on every request', async () => {
      let callCount = 0;
      const tokenClient = createApiClient({
        baseURL: 'https://api.example.com',
        getToken: () => {
          callCount++;
          return 'tok';
        },
      });
      mockState.setResponse('get', '/a', {});
      mockState.setResponse('get', '/b', {});

      await tokenClient.get('/a');
      await tokenClient.get('/b');

      expect(callCount).toBe(2);
    });
  });

  // ─── AC6 + AC7 + AC8: Retry with exponential backoff ─────────────

  describe('retry with exponential backoff', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should retry retryable status codes up to configured retry count', async () => {
      let callCount = 0;
      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 2,
        retryDelay: 0,
      });

      const originalGet = mockState.instance.get;
      mockState.instance.get = vi.fn((url: string, config?: unknown) => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(createAxiosError('Server Error', { status: 503, data: null }));
        }
        return originalGet(url, config);
      });
      mockState.setResponse('get', '/flaky', { ok: true });

      const result = await retryClient.get('/flaky');
      expect(result).toEqual({ ok: true });
      expect(callCount).toBe(3);
    });

    it('should apply exponential backoff: retryDelay * 2^attempt', async () => {
      const delays: number[] = [];
      const originalSetTimeout = globalThis.setTimeout;
      vi.stubGlobal('setTimeout', (fn: () => void, ms?: number) => {
        if (ms !== undefined && ms > 0) delays.push(ms);
        return originalSetTimeout(fn, 0);
      });

      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 3,
        retryDelay: 500,
      });

      let callCount = 0;
      mockState.instance.get = vi.fn(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.reject(
            createAxiosError('Service Unavailable', { status: 503, data: null }),
          );
        }
        return Promise.resolve({ status: 200, headers: {}, data: { ok: true } });
      });

      const result = await retryClient.get('/backoff');
      expect(result).toEqual({ ok: true });
      expect(delays).toEqual([500, 1000, 2000]);
    });

    it('should verify second delay is approximately 2x the first', async () => {
      const delays: number[] = [];
      const originalSetTimeout = globalThis.setTimeout;
      vi.stubGlobal('setTimeout', (fn: () => void, ms?: number) => {
        if (ms !== undefined && ms > 0) delays.push(ms);
        return originalSetTimeout(fn, 0);
      });

      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 2,
        retryDelay: 100,
      });

      let callCount = 0;
      mockState.instance.get = vi.fn(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(createAxiosError('Error', { status: 500, data: null }));
        }
        return Promise.resolve({ status: 200, headers: {}, data: {} });
      });

      await retryClient.get('/timing');
      expect(delays[1]).toBe(delays[0] * 2);
    });

    it('should not retry on 400', async () => {
      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 3,
        retryDelay: 0,
      });

      let callCount = 0;
      mockState.instance.get = vi.fn(() => {
        callCount++;
        return Promise.reject(createAxiosError('Bad Request', { status: 400, data: null }));
      });

      await expect(retryClient.get('/bad')).rejects.toThrow();
      expect(callCount).toBe(1);
    });

    it('should not retry on 401', async () => {
      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 3,
        retryDelay: 0,
      });

      let callCount = 0;
      mockState.instance.get = vi.fn(() => {
        callCount++;
        return Promise.reject(createAxiosError('Unauthorized', { status: 401, data: null }));
      });

      await expect(retryClient.get('/unauth')).rejects.toThrow();
      expect(callCount).toBe(1);
    });

    it('should not retry on 403', async () => {
      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 3,
        retryDelay: 0,
      });

      let callCount = 0;
      mockState.instance.get = vi.fn(() => {
        callCount++;
        return Promise.reject(createAxiosError('Forbidden', { status: 403, data: null }));
      });

      await expect(retryClient.get('/forbidden')).rejects.toThrow();
      expect(callCount).toBe(1);
    });

    it('should not retry on 404', async () => {
      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 3,
        retryDelay: 0,
      });

      let callCount = 0;
      mockState.instance.get = vi.fn(() => {
        callCount++;
        return Promise.reject(createAxiosError('Not Found', { status: 404, data: null }));
      });

      await expect(retryClient.get('/notfound')).rejects.toThrow();
      expect(callCount).toBe(1);
    });

    it('should retry on each retryable status: 408, 429, 500, 502, 503, 504', async () => {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];

      for (const status of retryableStatuses) {
        const retryClient = createApiClient({
          baseURL: 'https://api.example.com',
          retry: 1,
          retryDelay: 0,
        });

        let callCount = 0;
        mockState.instance.get = vi.fn(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(createAxiosError(`Error ${status}`, { status, data: null }));
          }
          return Promise.resolve({ status: 200, headers: {}, data: { ok: true } });
        });

        const result = await retryClient.get('/retryable');
        expect(result).toEqual({ ok: true });
        expect(callCount).toBe(2);
      }
    });

    it('should fail after exhausting all retries', async () => {
      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 2,
        retryDelay: 0,
      });

      mockState.instance.get = vi.fn(() =>
        Promise.reject(createAxiosError('Server Error', { status: 500, data: null })),
      );

      try {
        await retryClient.get('/always-fail');
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
      }
      expect(mockState.instance.get).toHaveBeenCalledTimes(3);
    });

    it('should not retry when retry is 0 (default)', async () => {
      mockState.instance.get = vi.fn(() =>
        Promise.reject(createAxiosError('Server Error', { status: 500, data: null })),
      );

      try {
        await client.get('/no-retry');
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
      }
      expect(mockState.instance.get).toHaveBeenCalledTimes(1);
    });

    it('should use default retryDelay of 500ms when not specified', async () => {
      const delays: number[] = [];
      const originalSetTimeout = globalThis.setTimeout;
      vi.stubGlobal('setTimeout', (fn: () => void, ms?: number) => {
        if (ms !== undefined && ms > 0) delays.push(ms);
        return originalSetTimeout(fn, 0);
      });

      const retryClient = createApiClient({
        baseURL: 'https://api.example.com',
        retry: 1,
      });

      let callCount = 0;
      mockState.instance.get = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(createAxiosError('Error', { status: 500, data: null }));
        }
        return Promise.resolve({ status: 200, headers: {}, data: {} });
      });

      await retryClient.get('/default-delay');
      expect(delays[0]).toBe(500);
    });
  });
});
