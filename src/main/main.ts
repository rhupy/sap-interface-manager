// src/main/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises'; // ErrnoException 제거

// (추가) DB/RFC 테스트용 서비스 임포트 (원하는 위치/이름으로 작성 가능)
import { testOracleConnection } from './oracleService';
import { testSapRfcConnection } from './rfcService';

// NodeJS.ErrnoException 타입 정의 (임포트 없이 직접 사용)
type ErrnoException = NodeJS.ErrnoException;

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';
  const preloadPath = isDev
    ? path.join(__dirname, '../main/preload.js') // 개발 모드: src/main/preload.js
    : path.join(__dirname, '../dist/main/preload.js'); // 프로덕션 모드: dist/main/preload.js

  const win = new BrowserWindow({
    width: 1400,
    height: 1100,
    webPreferences: {
      nodeIntegration: false, // nodeIntegration을 false로 설정
      contextIsolation: true, // contextIsolation을 true로 설정
      preload: preloadPath, // 동적 경로 사용
      webSecurity: true,
    },
  });

  // 개발 모드라면 http://localhost:5174 로, 프로덕션 모드라면 dist/renderer/index.html 로 로드
  win.loadURL(
    isDev
      ? 'http://localhost:5174'
      : path.join(__dirname, '../renderer/index.html')
  );

  // -------------------------------
  // 1) 설정 저장/불러오기 처리
  // -------------------------------
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

  // -------------------------------
  // 2) DB 테스트 & RFC 테스트 IPC 핸들러 추가
  // -------------------------------

  // (A) DB 테스트
  //  - Renderer 쪽에서 ipcRenderer.invoke('test-db-connection', dbConfig) 호출 시 실행
  ipcMain.handle('test-db-connection', async (event, dbConfig) => {
    try {
      // oracleService.ts 안의 testOracleConnection 을 호출
      await testOracleConnection(dbConfig);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message || String(error) };
    }
  });

  // (B) RFC 테스트
  //  - Renderer 쪽에서 ipcRenderer.invoke('test-rfc-connection', rfcConfig) 호출 시 실행
  ipcMain.handle('test-rfc-connection', async (event, rfcConfig) => {
    try {
      // rfcService.ts 안의 testSapRfcConnection 을 호출
      await testSapRfcConnection(rfcConfig);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message || String(error) };
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
