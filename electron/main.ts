import {ClientsApi} from "./src/api/clients";
const screenshot = require('screenshot-desktop');
const { app, BrowserWindow, desktopCapturer, ipcMain, Menu, dialog }  = require('electron');
// @ts-ignore
import path from 'path';
import { createWindow } from './src/window';
import { getMenuTemplate } from './src/menu';
import {
    getSources,
    getMachineInfo,
    getAppInfo,
    createVideosFolder,
    getVideos,
    startIdleTimer
} from './src/index';
import { MediaApi } from './src/api/media.js';
import { VideoUploader } from './src/videoUploader.js';
import {AlertsApi} from "./src/api/alerts";
import VideoUploaderModel from "./src/models/VideoUploaderModel";
const settings = require('electron-settings');

// @ts-ignore
let win: BrowserWindow | null
const env = import.meta.env.VITE_APP_ENV || 'production';
const baseURL = env === 'development' ? import.meta.env.VITE_DEV_API_URL : import.meta.env.VITE_PROD_API_URL;
const mediaApi = new MediaApi(baseURL);
const clientsApi = new ClientsApi(baseURL);
const alertsApi = new AlertsApi(baseURL);
let videoUpload : VideoUploaderModel;
let interval : NodeJS.Timeout;

app.commandLine.appendSwitch ("disable-http-cache"); //disable cache, maybe remove this later

createVideosFolder();
// deleteAllVideos(); // just for testing


// Set default settings
settings.has('settings.socket_url').then((keyExists : any) => {
    if (!keyExists) {
        settings.set('settings.socket_url', 'http://localhost:3000');
    }
})

//Invokable functions
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

ipcMain.handle('get-sources', async () => {
    return getSources();
});

ipcMain.handle('take-screen-shot', async () => {
     return screenshot();
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
      //getAssets
      const assets = await clientsApi.getAssets();
      win?.webContents.send('assets', assets.data);

      //get machine info
      const machineInfo = getMachineInfo();
      win?.webContents.send('machine-info', machineInfo);

      //read from package.json
      const appInfo = getAppInfo();
      win?.webContents.send('app-info', appInfo);

      //Setting the menu
      Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuTemplate(win, app, appInfo)))

      //Start idle timer
      startIdleTimer(win);
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
            win?.webContents.send('app-closed');
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

ipcMain.on('check-local-sessions', async (_ : any, data : any) => {
    console.log('Checking local sessions');
    try {
        await videoUpload.checkLocalSessions(data);
    } catch (error) {
        console.error('Something went wrong');
    }
});

ipcMain.on('toggle-idle-time-dialog', (_ : any, data : any) => {
    if (data.show) {
        clearInterval(interval);
    } else {
        startIdleTimer(win);
    }
});

ipcMain.on('save-alert-user-idle', async (_ : any, data : any) => {
    try {
        await alertsApi.createItem({
            type: 'idle',
            socket_id: data.socket_id,
        });
    } catch (error) {
        console.error('Error:', error);
    }
});






