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

  // 개발 모드와 빌드 모드 구분
  const isDev = !app.isPackaged;
  console.log('Is development mode?', isDev);

  const indexPath = isDev
    ? path.join(__dirname, '../../public/index.html') // src/main -> public
    : path.join(__dirname, '../public/index.html'); // dist/main -> public

  console.log('Loading index.html from:', indexPath);

  win
    .loadFile(indexPath)
    .then(() => console.log('Window loaded successfully'))
    .catch((err) => console.error('Failed to load window:', err));
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
