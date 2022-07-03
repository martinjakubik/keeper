const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 660,
        icon: path.join(__dirname, 'app/icon/AppIcon.icns'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: !app.isPackaged
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

ipcMain.on('showOpenDialog', async (oEvent) => {
    const oSelectedDirectory = await dialog.showOpenDialog({properties: ['openDirectory', 'showHiddenFiles']});
    if (oSelectedDirectory.canceled) {
        oEvent.reply('choose-keeper-directory-response', { canceled: true });
    } else {
        const aSelectedDirectories =  oSelectedDirectory.filePaths;
        const sSelectedDirectory = (aSelectedDirectories && aSelectedDirectories.length > 0) ? aSelectedDirectories[0] : null;
        oEvent.reply('choose-keeper-directory-response', { selectedDirectory: sSelectedDirectory });
    }
});
