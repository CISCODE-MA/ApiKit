import { describe, it, expect } from 'vitest';
import { ApiError } from './ApiError';

describe('ApiError', () => {
  it('should extend Error', () => {
    const error = new ApiError('something went wrong', 500, 'HTTP_500');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it('should set name to ApiError', () => {
    const error = new ApiError('fail', 404, 'HTTP_404');

    expect(error.name).toBe('ApiError');
  });

  it('should expose readonly status, code, and message', () => {
    const error = new ApiError('Not Found', 404, 'HTTP_404');

    expect(error.message).toBe('Not Found');
    expect(error.status).toBe(404);
    expect(error.code).toBe('HTTP_404');
  });

  it('should expose optional details when provided', () => {
    const details = { field: 'email', reason: 'invalid' };
    const error = new ApiError('Validation failed', 422, 'HTTP_422', details);

    expect(error.details).toEqual(details);
  });

  it('should have undefined details when not provided', () => {
    const error = new ApiError('Server Error', 500, 'HTTP_500');

    expect(error.details).toBeUndefined();
  });

  it('should represent network errors with status 0', () => {
    const error = new ApiError('Network error', 0, 'NETWORK_ERROR');

    expect(error.status).toBe(0);
    expect(error.code).toBe('NETWORK_ERROR');
  });
});
