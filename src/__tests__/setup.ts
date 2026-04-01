// Vitest setup: extend expect with jest-dom matchers
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure DOM is cleaned between tests to avoid duplicate nodes
afterEach(() => {
  cleanup();
});
