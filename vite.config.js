import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  base: './',
  server: { host: 'localhost', port: 8000, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 1600 }
});