// src/main/main.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { testSapRfcConnection, testSapRfcFunction } from './rfcService';
import { testOracleConnection } from './oracleService';

// 설정 파일 경로
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// 메인 윈도우 참조 유지
let mainWindow: BrowserWindow | null = null;

// 메인 윈도우 생성 함수
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 개발 모드에서는 개발 서버 URL 로드, 프로덕션에서는 빌드된 파일 로드
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools(); // 개발 도구 자동 열기
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 윈도우가 닫힐 때 이벤트
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC 핸들러 등록 함수
function registerIpcHandlers() {
  console.log('IPC 핸들러 등록 시작');

  // 설정 저장 핸들러
  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );
      return { success: true };
    } catch (error) {
      console.error('설정 저장 오류:', error);
      return { success: false, error: String(error) };
    }
  });

  // 설정 로드 핸들러
  ipcMain.handle('load-settings', async (event) => {
    try {
      if (fs.existsSync(settingsPath)) {
        const data = await fs.promises.readFile(settingsPath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('설정 로드 오류:', error);
      return null;
    }
  });

  // 설정 파일 열기 핸들러
  ipcMain.handle('open-settings-file', async (event) => {
    try {
      if (!fs.existsSync(settingsPath)) {
        await fs.promises.writeFile(settingsPath, JSON.stringify({}, null, 2));
      }

      const opened = await dialog.showOpenDialog({
        defaultPath: settingsPath,
        properties: ['openFile'],
      });

      if (!opened.canceled && opened.filePaths.length > 0) {
        // 파일 열기 성공
        return { success: true };
      }

      return { success: false, message: '파일 열기가 취소되었습니다.' };
    } catch (error) {
      console.error('설정 파일 열기 오류:', error);
      return { success: false, message: String(error) };
    }
  });

  // DB 연결 테스트 핸들러
  ipcMain.handle('test-db-connection', async (event, dbConfig) => {
    try {
      await testOracleConnection(dbConfig);
      return { success: true };
    } catch (error: any) {
      console.error('DB 연결 테스트 오류:', error);
      return { success: false, message: error?.message || String(error) };
    }
  });

  // RFC 연결 테스트 핸들러
  ipcMain.handle('test-rfc-connection', async (event, rfcConfig) => {
    console.log('RFC 연결 테스트 요청:', rfcConfig);
    try {
      await testSapRfcConnection(rfcConfig);
      return { success: true };
    } catch (error: any) {
      console.error('RFC 연결 테스트 오류:', error);
      return { success: false, message: error?.message || String(error) };
    }
  });

  // RFC 함수 테스트 핸들러
  ipcMain.handle('test-rfc-function', async (event, params) => {
    console.log('RFC 함수 테스트 요청:', params);
    try {
      const result = await testSapRfcFunction(params);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('RFC 함수 테스트 오류:', error);
      return { success: false, message: error?.message || String(error) };
    }
  });

  console.log('IPC 핸들러 등록 완료');
}

// 앱이 준비되면 윈도우 생성 및 핸들러 등록
app.whenReady().then(() => {
  console.log('Electron 애플리케이션 시작');
  registerIpcHandlers();
  createWindow();

  // macOS에서 모든 창이 닫혔을 때 앱을 종료하지 않도록 함
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 창이 닫히면 앱 종료 (Windows/Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 앱 종료 전 정리 작업
app.on('before-quit', () => {
  // 필요한 정리 작업 수행
});
