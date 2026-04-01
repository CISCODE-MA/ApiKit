import { useCallback } from 'react';
import { noop } from '../utils';

export function useNoop() {
  return useCallback(() => noop(), []);
}
