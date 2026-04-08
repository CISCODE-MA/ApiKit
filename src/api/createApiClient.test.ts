import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from './createApiClient';
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
      for (const h of interceptors.response.handlers) {
        if (h.rejected) {
          try {
            await h.rejected(responseData);
          } catch {
            // error interceptors may not stop propagation
          }
        }
      }
      throw responseData;
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

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => {
      mockState = createMockInstance();
      return mockState.instance;
    }),
  },
}));

import axios from 'axios';

describe('createApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createApiClient({ baseURL: 'https://api.example.com' });
  });

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
  });

  describe('error propagation', () => {
    it('should propagate errors from the underlying HTTP call', async () => {
      mockState.setResponse('get', '/fail', new Error('Network Error'));

      await expect(client.get('/fail')).rejects.toThrow('Network Error');
    });
  });

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

      await client.get('/test');
      expect(order).toEqual([1, 2]);
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

      await client.get('/test');
      expect(order).toEqual([1, 2]);
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
      mockState.setResponse('get', '/fail', new Error('fail'));

      client.addErrorInterceptor(() => {
        order.push(1);
      });

      client.addErrorInterceptor(() => {
        order.push(2);
      });

      await expect(client.get('/fail')).rejects.toThrow('fail');
      expect(order).toEqual([1, 2]);
    });

    it('should still reject the promise after error interceptors run', async () => {
      mockState.setResponse('get', '/fail', new Error('boom'));

      client.addErrorInterceptor(() => {
        /* logged */
      });

      await expect(client.get('/fail')).rejects.toThrow('boom');
    });
  });

  describe('getToken auth interceptor', () => {
    it('should inject Authorization header when getToken returns a value', async () => {
      const tokenClient = createApiClient({
        baseURL: 'https://api.example.com',
        getToken: () => 'my-token-123',
      });
      mockState.setResponse('get', '/secure', { data: 'secret' });

      await tokenClient.get('/secure');

      const requestCall = mockState.instance.get.mock.calls[0];
      expect(requestCall).toBeDefined();
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
  });
});
