import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'], // run chrome mocks before tests
    css: false, // speeds up tests
    transformMode: {
      web: [/\.[jt]sx?$/]
    }
  },
});