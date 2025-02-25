// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer', // 렌더러 소스 디렉토리
  build: {
    outDir: 'dist/renderer', // 빌드 출력 디렉토리
    emptyOutDir: true,
  },
  base: './', // 상대 경로로 빌드
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
    },
  },
  // 브라우저 자동 열기 비활성화
  // vite.config.ts
  // vite.config.ts
  server: {
    open: false,
    port: 5174,
    hmr: {
      host: 'localhost',
      port: 5174,
      clientPort: 5174,
      path: '/vite-hmr', // HMR 웹소켓 경로 (기본값)
    },
  },
  publicDir: 'public',
});
