// src/main/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: false, // nodeIntegration을 false로 설정
      contextIsolation: true, // contextIsolation을 true로 설정
      preload: path.join(__dirname, '../dist/main/preload.js'), // dist 디렉토리에서 preload.js 로드
      webSecurity: true,
    },
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

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
      const data = await fs.readFile(settingsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
      return null;
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
