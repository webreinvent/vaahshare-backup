import {powerMonitor} from "electron";

const { app, BrowserWindow, desktopCapturer, ipcMain, Menu, dialog }  = require('electron');
import { getVideoFolder } from "./helper.js"
import os from 'os'
import path from 'node:path'
const fs = require('fs');
let idleThreshold = 5; // in seconds
let idleInterval = null;


export const createVideosFolder = () => {
    if (!fs.existsSync(getVideoFolder)) {
        fs.mkdirSync(getVideoFolder, { recursive: true });
    }
}

export const getVideos = () => {
    const videos =  fs.readdirSync(getVideoFolder);
    const videosWithSize = videos.map(video => {
        const stats = fs.statSync(path.join(getVideoFolder, video));
        const size = stats.size;
        const createdAt = stats.birthtime;
        return { name: video, size, createdAt };
    });
    return videosWithSize;
}

export const getSources = () => {
   return desktopCapturer.getSources({ types: ['window', 'screen'] });
}

export const getMachineInfo = () => {
    const operatingSystem = os.type();
    const username = os.userInfo().username;
    const hostname = getHostInfo(os.hostname());
    const platform = os.platform();
    const macAddress = os.networkInterfaces().Ethernet[0].mac;
    const user_host = `${username}@${hostname}`;
    //@TODO : Sometimes hostname and username are not available, need to find a way to get them.
    const machineInfo = {
        operatingSystem,
        username,
        hostname,
        macAddress,
        platform,
        user_host
    }
    return machineInfo;
}

const getHostInfo = (host) => {
    if (process.env.host) {
        return process.env.host;
    }
    return host;
}

export const getAppInfo = () => {
    const packageJson = require('../package.json');
    const appVersion = packageJson.version;
    const name = packageJson.name;
    return { appVersion, name };
}

export const deleteAllVideos = () => {
    const videos = getVideos();
    videos.forEach(video => {
        fs.unlinkSync(path.join(getVideoFolder, video.name));
    });
}

export const startIdleTimer = (win) =>  {
    idleInterval = setInterval(() => {
        let idleTime = powerMonitor.getSystemIdleTime();
        if (idleTime > idleThreshold) {
            // Stop the timer and show a dialog box
            clearInterval(idleInterval);
            win?.webContents.send('toggle-idle-time-dialog', {
                show: true
            });
        }
    }, 1000);
}