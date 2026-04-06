import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from './createApiClient';
import type { ApiClient } from './createApiClient.types';

vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
      __mockInstance: mockInstance,
    },
  };
});

import axios from 'axios';

function getMockInstance() {
  return (axios as unknown as { __mockInstance: Record<string, ReturnType<typeof vi.fn>> })
    .__mockInstance;
}

describe('createApiClient', () => {
  let client: ApiClient;
  let mockInstance: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInstance = getMockInstance();
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
      mockInstance.get.mockResolvedValue({ data });

      const result = await client.get<{ id: number; name: string }>('/users/1');

      expect(mockInstance.get).toHaveBeenCalledWith('/users/1', {
        headers: undefined,
        params: undefined,
        signal: undefined,
      });
      expect(result).toEqual(data);
    });

    it('should forward request config options', async () => {
      mockInstance.get.mockResolvedValue({ data: [] });
      const controller = new AbortController();

      await client.get('/users', {
        headers: { 'X-Custom': 'value' },
        params: { page: 1 },
        signal: controller.signal,
      });

      expect(mockInstance.get).toHaveBeenCalledWith('/users', {
        headers: { 'X-Custom': 'value' },
        params: { page: 1 },
        signal: controller.signal,
      });
    });
  });

  describe('post', () => {
    it('should call instance.post with data and return response.data', async () => {
      const responseData = { id: 2, name: 'Created' };
      mockInstance.post.mockResolvedValue({ data: responseData });

      const result = await client.post<{ id: number; name: string }>('/users', {
        name: 'Created',
      });

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/users',
        { name: 'Created' },
        { headers: undefined, params: undefined, signal: undefined },
      );
      expect(result).toEqual(responseData);
    });

    it('should forward request config options', async () => {
      mockInstance.post.mockResolvedValue({ data: {} });

      await client.post('/users', { name: 'Test' }, { headers: { 'X-Token': 'abc' } });

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/users',
        { name: 'Test' },
        { headers: { 'X-Token': 'abc' }, params: undefined, signal: undefined },
      );
    });
  });

  describe('put', () => {
    it('should call instance.put with data and return response.data', async () => {
      const responseData = { id: 1, name: 'Updated' };
      mockInstance.put.mockResolvedValue({ data: responseData });

      const result = await client.put<{ id: number; name: string }>('/users/1', {
        name: 'Updated',
      });

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/users/1',
        { name: 'Updated' },
        { headers: undefined, params: undefined, signal: undefined },
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('patch', () => {
    it('should call instance.patch with data and return response.data', async () => {
      const responseData = { id: 1, name: 'Patched' };
      mockInstance.patch.mockResolvedValue({ data: responseData });

      const result = await client.patch<{ id: number; name: string }>('/users/1', {
        name: 'Patched',
      });

      expect(mockInstance.patch).toHaveBeenCalledWith(
        '/users/1',
        { name: 'Patched' },
        { headers: undefined, params: undefined, signal: undefined },
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('delete', () => {
    it('should call instance.delete and return response.data', async () => {
      mockInstance.delete.mockResolvedValue({ data: { success: true } });

      const result = await client.delete<{ success: boolean }>('/users/1');

      expect(mockInstance.delete).toHaveBeenCalledWith('/users/1', {
        headers: undefined,
        params: undefined,
        signal: undefined,
      });
      expect(result).toEqual({ success: true });
    });

    it('should forward request config options', async () => {
      mockInstance.delete.mockResolvedValue({ data: {} });

      await client.delete('/users/1', { params: { hard: true } });

      expect(mockInstance.delete).toHaveBeenCalledWith('/users/1', {
        headers: undefined,
        params: { hard: true },
        signal: undefined,
      });
    });
  });

  describe('error propagation', () => {
    it('should propagate errors from the underlying HTTP call', async () => {
      const error = new Error('Network Error');
      mockInstance.get.mockRejectedValue(error);

      await expect(client.get('/fail')).rejects.toThrow('Network Error');
    });
  });
});
