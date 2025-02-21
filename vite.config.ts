import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // React 코드가 위치한 폴더를 'root'로 지정
  // 예: src/renderer
  root: path.join(__dirname, 'src', 'renderer'),

  // 빌드 시 결과물이 생성될 폴더 설정
  build: {
    outDir: path.join(__dirname, 'dist', 'renderer'),
    emptyOutDir: true, // 빌드 시 dist/renderer 폴더 비울지 여부
  },

  plugins: [react()],

  // 개발 서버 설정 (Electron 개발 시에는 보통 localhost 포트로 접근)
  server: {
    port: 5173, // Vite 기본 포트. 원하는 값으로 변경 가능
  },
});
