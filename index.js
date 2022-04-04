// const { app, BrowserWindow } = require('electron');
import { app, BrowserWindow } from 'electron';
// const path = require('path');
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 660,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true
        }
    });
    win.loadFile('app/index.html');
};

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});