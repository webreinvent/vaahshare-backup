const { app, BrowserWindow, desktopCapturer, ipcMain, Menu, dialog }  = require('electron');
// @ts-ignore
import path from 'path';
import { createWindow } from './src/window';
import { getMenuTemplate } from './src/menu';
import { getSources, getMachineInfo, getAppInfo, createVideosFolder, getVideos, deleteAllVideos } from './src/index';
import { MediaApi } from './src/api/media.js';
import { VideoUploader } from './src/videoUploader.js';
const settings = require('electron-settings');

// @ts-ignore
let win: BrowserWindow | null
const baseURL = import.meta.env.VITE_API_URL;
const mediaApi = new MediaApi(baseURL);
let videoUpload;

app.commandLine.appendSwitch ("disable-http-cache"); //disable cache, maybe remove this later

createVideosFolder();
// deleteAllVideos(); // just for testing


// Set default settings
settings.has('settings.socket_url').then((keyExists : any) => {
    if (!keyExists) {
        settings.set('settings.socket_url', 'http://localhost:3000');
    }
})

ipcMain.handle('get-settings', async (_ : any, key : any) => {
    return settings.get(key);
});

ipcMain.handle('get-videos', async () => {
    return getVideos();
});

ipcMain.handle('get-machine-info', async () => {
    return getMachineInfo();
});

ipcMain.on('update-window-title', (_ : any, title : any) => {
    const updated_title = `${getAppInfo().name} - ${title}`
    win?.setTitle(updated_title);
});

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
    if(import.meta.env.VITE_APP_ENV !== 'development') {
        // Single instance lock
        if (!app.requestSingleInstanceLock()) {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Warning',
                message: 'App is already running.',
                buttons: ['OK']
            });
            app.quit()
        }
    }

  win = createWindow()
  videoUpload = new VideoUploader(win, mediaApi);
  win?.webContents.on('did-finish-load', async () => {
      //get sources
      const sources = await getSources();
      win?.webContents.send('sources', sources);

      //get machine info
      const machineInfo = getMachineInfo();
      win?.webContents.send('machine-info', machineInfo);

      //read from package.json
      const appInfo = getAppInfo();
      win?.webContents.send('app-info', appInfo);

      //Setting the menu
      Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuTemplate(win, app, appInfo)))
  });

    //When the app is closed
    win?.on('close', (e : any) => {
        e.preventDefault();
        dialog.showMessageBox(win, {
            type: 'question',
            title: 'Confirm',
            message: 'Are you sure you want to quit?',
            buttons: ['Yes', 'No'],
        }).then(async (response : any) => {
            if (response.response === 0) {
                win?.webContents.send('app-closed');
                await settings.unset(`settings.selected_source_id`);
                app.exit();
            }
        });
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

ipcMain.on('is_socket_url_set', () => {
  //show dialog box with message that socket url is not set please set it.
    //get env variable
    // dialog.showMessageBox(win, {
    //     type: 'warning',
    //     title: 'Warning',
    //     message: 'Socket URL is not set, please set it in the settings page.',
    //     buttons: ['OK']
    // });
});

ipcMain.on('save-settings', async (_ : any, data : any) => {
    for (const key of Object.keys(data)) {
        await settings.set(`settings.${key}`, data[key]);
    }

    if (Object.keys(data).includes('socket_url')) {
        dialog.showMessageBox(win, {
            type: 'info',
            title: 'Info',
            message: 'Settings saved successfully. App will restart now.',
            buttons: ['OK']
        }).then(() => {
            //Restart only works in production
            app.relaunch();
            app.exit();
        });
    }
    // win?.webContents.send('navigate', 'home'); //Redirect to home page is not working
});

ipcMain.on('delete-settings', async (_ : any, key : any) => {
    await settings.unset(`settings.${key}`);
});

// @TODO: Need to refactor this
ipcMain.on('check-local-sessions', async (_ : any, data : any) => {
    console.log('Cheking local sessions');
    videoUpload.checkLocalSessions(data);
});



