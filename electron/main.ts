const { app, BrowserWindow, desktopCapturer, ipcMain, Menu, dialog }  = require('electron');
const fs = require('fs');

import path from 'node:path'
import os from 'os'
import { createWindow } from './src/window';
import { getMenuTemplate } from './src/menu';

// Variable to store app info
let appInfo = null;

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


// @ts-ignore
let win: BrowserWindow | null

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('ready', async () => {
  win = createWindow()
  win?.webContents.on('did-finish-load', () => {
      try {
      desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        win?.webContents.send('sources', sources);
      })
    } catch (error) {
      console.log('error getting sources', error);
    }

    const operatingSystem = os.type();
    const username = os.userInfo().username;
    const hostname = os.hostname();
    const platform = os.platform();
    const macAddress = os.networkInterfaces().Ethernet[0].mac;
    const user_host = `${username}@${hostname}`

    //@TODO : Sometimes hostname and username are not available, need to find a way to get them.
    const machineInfo = {
      operatingSystem,
        username,
        hostname,
        macAddress,
        platform,
        user_host
    }
    win?.webContents.send('machine-info', machineInfo);

    //read from package.json
    const packageJson = require('../package.json');
    const appVersion = packageJson.version;

    appInfo = {
        appVersion
    }

    win?.webContents.send('app-info', appInfo);

    //Setting the menu
    Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuTemplate(win, app, appInfo)))
  });

});

// @ts-ignore
ipcMain.on('take-screenshot', async (event, sourceId) => {
    const screenshotPath = path.join(app.getPath('desktop'), 'screenshot.png');
    const source = (await desktopCapturer.getSources({ types: ['window', 'screen'],
    thumbnailSize: { width: 1920, height: 1080}
      // @ts-ignore
    })).find(source => source.id === sourceId);
    if (source) {
      const image = source.thumbnail.toPNG();
      try {
        require('fs').writeFileSync(screenshotPath, image);
        win?.webContents.send('screenshot-saved', screenshotPath);
        console.log(`screenshot saved at ${screenshotPath}`);
      } catch (error) {
        console.log('error saving screenshot', error);
      }
    }
});

ipcMain.on('is_socket_url_set', (event, arg) => {
  //show dialog box with message that socket url is not set please set it.
    //get env variable
    dialog.showMessageBox(win, {
        type: 'warning',
        title: 'Warning',
        message: 'Socket URL is not set, please set it in the settings page.',
        buttons: ['OK']
    });
});

ipcMain.on('set-socket-url', (event, socket_url) => {
    //App getting restarted automatically after setting the socket url so first show a dialog box to inform user that app will restart after setting the socket url.
    //@TODO : not sure socket url need to save in env file or not, need to check.
    dialog.showMessageBox(win, {
        type: 'info',
        title: 'Info',
        message: 'App will restart after setting the socket url.',
        buttons: ['OK']
    }).then(() => {
        const envFile = path.join(__dirname, '../.env');
        fs.readFile(envFile, 'utf8', (err, data) => {
            if (err) {
                console.log('error reading env file', err);
                return;
            }
            const result = data.replace(/VITE_SOCKET_URL=.*/g, `VITE_SOCKET_URL=${socket_url}`);

            fs.writeFile(envFile, result, 'utf8', (err) => {
                if (err) {
                    console.log('error writing to env file', err);
                    return;
                }
            });
        });
    });
});
