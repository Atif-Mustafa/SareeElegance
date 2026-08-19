import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['server/tests/**/*.test.ts', 'shared/tests/**/*.test.ts', 'client/src/**/*.test.ts', 'client/tests/**/*.test.ts'],
    alias: {
      '@server': path.resolve(__dirname, 'server/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname, 'client/src'),
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_pass@localhost:5432/test_db',
    },
  },
});
