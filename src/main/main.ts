import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises'; // Node.js 파일 시스템 (Promise 기반)
import 'dotenv/config';
import { testOracleConnection } from './oracleService';
import { OracleDbConfig } from '../renderer/types/index';
import { Settings } from '../renderer/types/index';

const SETTINGS_FILE = path.join(app.getPath('userData'), 'setting.json');

async function loadSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data) as Settings;
  } catch (error) {
    return {
      rfcList: [],
      dbConnections: [],
      selectedRfc: '',
      selectedDbId: '',
    };
  }
}

async function saveSettings(settings: Settings): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1800,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
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

// 기존 Oracle DB 테스트 IPC
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

// 설정 저장 IPC
ipcMain.handle('save-settings', async (event, settings: Settings) => {
  await saveSettings(settings);
  return { success: true };
});

// 설정 로드 IPC
ipcMain.handle('load-settings', async () => {
  return await loadSettings();
});
