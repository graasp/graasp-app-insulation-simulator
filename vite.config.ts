/// <reference types="./src/env"/>
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import istanbul from 'vite-plugin-istanbul';
import { UserConfigExport, defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }): UserConfigExport => {
  process.env = {
    VITE_VERSION: 'default',
    VITE_BUILD_TIMESTAMP: new Date().toISOString(),
    ...process.env,
    ...loadEnv(mode, process.cwd()),
  };

  return defineConfig({
    base: '',
    server: {
      port: parseInt(process.env.VITE_PORT, 10) || 4001,
      open: mode !== 'test', // open only when mode is different from test
      watch: {
        ignored: ['**/coverage/**'],
      },
    },
    preview: {
      port: parseInt(process.env.VITE_PORT || '3333', 10),
      strictPort: true,
    },
    build: {
      outDir: 'build',
    },
    plugins: [
      mode === 'test'
        ? undefined
        : checker({
            typescript: true,
            eslint: {
              lintCommand: 'eslint "src/**/*.{ts,tsx}"',
              useFlatConfig: true,
            },
            overlay: {
              initialIsOpen: false,
            },
          }),
      react(),
      istanbul({
        include: 'src/*',
        exclude: [
          'node_modules',
          'test/',
          '.nyc_output',
          'coverage',
          '**/*.test.ts',
        ],
        extension: ['.js', '.ts', '.tsx'],
        requireEnv: false,
        forceBuildInstrument: mode === 'test',
        checkProd: true,
      }),
    ],
    test: {
      include: ['**/*.test.ts'],
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@models': resolve(__dirname, 'public/models'),
      },
    },
  });
};
