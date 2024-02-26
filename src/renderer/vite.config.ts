import { defineConfig } from 'vite';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import path from 'path';

export default defineConfig({
  build: {
    target: 'node20',
    rollupOptions: {
      external: ['util', 'buffer', 'stream', 'net', 'url', 'fs', 'path', 'os', 'child_process'],
      output: {
        globals: {
          stream: 'stream',
          buffer: 'buffer',
          util: 'util',
          net: 'net',
          url: 'url',
          path: 'path',
          os: 'os',
          child_process: 'child_process',
        },
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      // TODO not need this (vite)
      simplebar: path.resolve(__dirname, '../../node_modules/simplebar-react/'),
      common: path.resolve(__dirname, '../common/'),
      renderer: path.resolve(__dirname, '../renderer/'),
      main: path.resolve(__dirname, '../main/'),
    },
  },
  plugins: [ViteYaml()],
});
