import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['app/__tests__/**/*.test.ts', 'app/__tests__/**/*.test.tsx'],
    exclude: ['node_modules', 'services'],
    testTimeout: 10_000,
  },
});
