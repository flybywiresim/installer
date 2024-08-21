import { defineConfig } from 'electron-vite';
import path from 'path';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import renderer from 'vite-plugin-electron-renderer';

const baseOptions = {
  resolve: {
    alias: {
      // TODO not need this (vite)
      simplebar: path.resolve(__dirname, './node_modules/simplebar-react/'),
      common: path.resolve(__dirname, './src/common/'),
      renderer: path.resolve(__dirname, './src/renderer/'),
      main: path.resolve(__dirname, './src/main/'),
    },
  },
};

export default defineConfig({
  main: {
    ...baseOptions,
  },
  renderer: {
    ...baseOptions,
    plugins: [ViteYaml(), renderer()],
  },
});
