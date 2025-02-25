// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer', // 렌더러 소스 디렉토리
  build: {
    outDir: '../../dist/renderer', // 빌드 출력 디렉토리
    emptyOutDir: true,
  },
  base: './', // 상대 경로로 빌드
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
    },
  },
  // 엔트리 포인트 명시 (필요 시)
  publicDir: 'public',
});
