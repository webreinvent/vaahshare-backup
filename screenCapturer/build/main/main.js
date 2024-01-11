"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
// import { startServer } from '../../server/server'
let mainWindow = null;
// startServer();
function createWindow() {
    const mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: (0, path_1.join)(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        }
    });
    if (process.env.NODE_ENV === 'development') {
        const rendererPort = process.argv[2];
        mainWindow.loadURL(`http://localhost:${rendererPort}`);
    }
    else {
        mainWindow.loadFile((0, path_1.join)(electron_1.app.getAppPath(), 'renderer', 'index.html'));
    }
}
electron_1.ipcMain.handle('startScreenCapture', (event) => __awaiter(void 0, void 0, void 0, function* () {
    const sourceId = 'window:10488362:0';
    console.log(sourceId);
    const constraints = {
        audio: true,
        video: true
    };
    try {
        // Create a media stream based on the constraints
        const stream = yield global.navigator.mediaDevices.getUserMedia(constraints);
        return stream; // Return the obtained media stream
    }
    catch (error) {
        console.error('Error starting screen capture:', error);
        throw error; // Throw the error to be caught by the caller
    }
}));
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: Object.assign(Object.assign({}, details.responseHeaders), { 'Content-Security-Policy': ['script-src \'self\''] })
        });
    });
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.ipcMain.on('message', (event, message) => {
    console.log(message);
});
electron_1.ipcMain.handle('getSources', (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inputSources = yield electron_1.desktopCapturer.getSources({ types: ['window', 'screen'] });
        const videoSources = inputSources.map(source => ({
            id: source.id,
            name: source.name,
        }));
        return videoSources;
    }
    catch (error) {
        console.error('Error fetching video sources:', error);
        return [];
    }
}));
