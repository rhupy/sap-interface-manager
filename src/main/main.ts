import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    // 개발 모드: Vite 개발 서버 로드
    win
      .loadURL('http://localhost:5173/')
      .then(() => console.log('Loaded Vite dev server'))
      .catch((err) => console.error('Failed to load Vite dev server:', err));
    win.webContents.openDevTools(); // 개발 모드에서 디버깅 용이성
  } else {
    // 빌드 모드: 정적 파일 로드
    const indexPath = path.join(__dirname, '../renderer/index.html');
    win
      .loadFile(indexPath)
      .then(() => console.log('Loaded production build'))
      .catch((err) => console.error('Failed to load production build:', err));
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
