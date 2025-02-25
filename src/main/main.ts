// src/main/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises'; // ErrnoException 제거

// NodeJS.ErrnoException 타입 정의 (임포트 없이 직접 사용)
type ErrnoException = NodeJS.ErrnoException;

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';
  const preloadPath = isDev
    ? path.join(__dirname, '../main/preload.js') // 개발 모드: src/main/preload.js
    : path.join(__dirname, '../dist/main/preload.js'); // 프로덕션 모드: dist/main/preload.js

  const win = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: false, // nodeIntegration을 false로 설정
      contextIsolation: true, // contextIsolation을 true로 설정
      preload: preloadPath, // 동적 경로 사용
      webSecurity: true,
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:5174'
      : path.join(__dirname, '../renderer/index.html')
  );

  // 설정 저장/불러오기 처리
  const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error('설정 저장 실패:', error);
      throw error;
    }
  });

  ipcMain.handle('load-settings', async () => {
    try {
      let data = '';
      try {
        data = await fs.readFile(settingsFilePath, 'utf8');
      } catch (readError) {
        // readError를 NodeJS.ErrnoException으로 단언
        const error = readError as ErrnoException;
        if (error.code === 'ENOENT') {
          // 파일이 존재하지 않을 경우 초기값으로 생성
          const initialData = {
            rfcList: [],
            dbConnections: [],
            selectedRfc: '',
            selectedDbId: '',
          };
          await fs.writeFile(
            settingsFilePath,
            JSON.stringify(initialData, null, 2)
          );
          return initialData;
        }
        throw error;
      }

      if (!data.trim()) {
        // 파일이 비어 있을 경우 초기값 반환
        const initialData = {
          rfcList: [],
          dbConnections: [],
          selectedRfc: '',
          selectedDbId: '',
        };
        await fs.writeFile(
          settingsFilePath,
          JSON.stringify(initialData, null, 2)
        );
        return initialData;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
      return {
        rfcList: [],
        dbConnections: [],
        selectedRfc: '',
        selectedDbId: '',
      }; // 초기값 반환
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
