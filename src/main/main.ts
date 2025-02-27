// src/main/main.ts
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';

// (추가) DB/RFC 테스트용 서비스 (기존대로)
import { testOracleConnection } from './oracleService';
import { testSapRfcConnection } from './rfcService';

type ErrnoException = NodeJS.ErrnoException;

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';
  const preloadPath = isDev
    ? path.join(__dirname, '../main/preload.js')
    : path.join(__dirname, '../dist/main/preload.js');

  const win = new BrowserWindow({
    width: 1400,
    height: 1100,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: true,
    },
  });

  // 개발모드/프로덕션모드에 따른 로드 경로
  if (isDev) {
    win.loadURL('http://localhost:5174');
  } else {
    win.loadURL(path.join(__dirname, '../renderer/index.html'));
  }

  // --------------------------------
  // 1) 환경 설정 저장/불러오기 (기존)
  // --------------------------------
  const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

  // 설정 파일 직접 실행하기 핸들러 추가
  ipcMain.handle('open-settings-file', async () => {
    try {
      // 파일이 존재하는지 확인
      await fs.access(settingsFilePath);
      // 파일 열기
      await shell.openPath(settingsFilePath);
      return { success: true };
    } catch (error) {
      console.error('설정 파일 열기 실패:', error);
      return { success: false, message: (error as Error).message };
    }
  });

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
        const err = readError as ErrnoException;
        if (err.code === 'ENOENT') {
          // 파일이 없으면 초기값
          const initial = {
            rfcList: [],
            dbConnections: [],
            selectedRfc: '',
            selectedDbId: '',
          };
          await fs.writeFile(
            settingsFilePath,
            JSON.stringify(initial, null, 2)
          );
          return initial;
        }
        throw err;
      }

      if (!data.trim()) {
        // 파일이 비어있으면 초기값
        const initial = {
          rfcList: [],
          dbConnections: [],
          selectedRfc: '',
          selectedDbId: '',
        };
        await fs.writeFile(settingsFilePath, JSON.stringify(initial, null, 2));
        return initial;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
      return {
        rfcList: [],
        dbConnections: [],
        selectedRfc: '',
        selectedDbId: '',
      };
    }
  });

  // --------------------------------
  // 2) SQL 설정 저장/불러오기
  // --------------------------------
  const sqlSettingsFilePath = path.join(
    app.getPath('userData'),
    'sqlSettings.json'
  );

  ipcMain.handle('load-sql-settings', async () => {
    try {
      let data = '';
      try {
        data = await fs.readFile(sqlSettingsFilePath, 'utf8');
      } catch (readError) {
        const err = readError as ErrnoException;
        if (err.code === 'ENOENT') {
          // 파일 없으면 초기값
          const initialSqlData = {
            sqlList: [],
            selectedSqlId: '',
          };
          await fs.writeFile(
            sqlSettingsFilePath,
            JSON.stringify(initialSqlData, null, 2)
          );
          return initialSqlData;
        }
        throw err;
      }
      if (!data.trim()) {
        // 파일 비어있으면 초기값
        const initialSqlData = {
          sqlList: [],
          selectedSqlId: '',
        };
        await fs.writeFile(
          sqlSettingsFilePath,
          JSON.stringify(initialSqlData, null, 2)
        );
        return initialSqlData;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('SQL 설정 불러오기 실패:', error);
      return {
        sqlList: [],
        selectedSqlId: '',
      };
    }
  });

  ipcMain.handle('save-sql-settings', async (event, sqlSettings) => {
    try {
      await fs.writeFile(
        sqlSettingsFilePath,
        JSON.stringify(sqlSettings, null, 2)
      );
    } catch (error) {
      console.error('SQL 설정 저장 실패:', error);
      throw error;
    }
  });

  // --------------------------------
  // 3) DB 테스트 & RFC 테스트 (기존)
  // --------------------------------
  ipcMain.handle('test-db-connection', async (event, dbConfig) => {
    try {
      await testOracleConnection(dbConfig);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message || String(error) };
    }
  });

  ipcMain.handle('test-rfc-connection', async (event, rfcConfig) => {
    try {
      await testSapRfcConnection(rfcConfig);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message || String(error) };
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
