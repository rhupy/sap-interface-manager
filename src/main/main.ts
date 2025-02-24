import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import 'dotenv/config'; // .env 로딩
import { testOracleConnection } from './oracleService';
import type { OracleDbConfig } from './oracleService';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1800,
    height: 1200,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // 필요 시 ipcRenderer를 사용하기 위해 preload나 contextBridge 설정
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// -------------------------------------
// IPC 핸들러 등록 (Oracle DB 테스트용)
// -------------------------------------
ipcMain.handle(
  'test-oracle-connection',
  async (event, dbConfig: OracleDbConfig) => {
    try {
      await testOracleConnection(dbConfig);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
);
