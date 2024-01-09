import {app, BrowserWindow, ipcMain, session, desktopCapturer} from 'electron';
import {join} from 'path';

// import { startServer } from '../../server/server'

let mainWindow = null;  
// startServer();
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }
}


ipcMain.handle('startScreenCapture', async (event) => {

  const sourceId ='window:10488362:0';
  console.log(sourceId)

  const constraints = {
    audio: true,
    video: true
  };
  try {
    // Create a media stream based on the constraints
    const stream = await global.navigator.mediaDevices.getUserMedia(constraints);
 
    return stream; // Return the obtained media stream
  } catch (error) {
    console.error('Error starting screen capture:', error);
    throw error; // Throw the error to be caught by the caller
  }
});

app.whenReady().then(() => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
  console.log(message);
})

ipcMain.handle('getSources', async (event) => {
  try {
    const inputSources = await desktopCapturer.getSources({ types: ['window', 'screen'] });

    const videoSources = inputSources.map(source => ({
      id: source.id,
      name: source.name,
    }));

    return videoSources;
  } catch (error) {
    console.error('Error fetching video sources:', error);
    return [];
  }
});

