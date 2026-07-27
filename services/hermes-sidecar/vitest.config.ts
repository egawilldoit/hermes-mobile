import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@hermes/contracts': path.resolve(__dirname, '../../packages/contracts/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/fixtures/**'],
    },
    testTimeout: 10_000,
    hookTimeout: 10_000,
    setupFiles: ['test/setup.ts'],
  },
});
