const { app, BrowserWindow, desktopCapturer, ipcMain, Menu, dialog }  = require('electron');
import os from 'os'
import path from 'node:path'
const fs = require('fs');




export const getSources = () => {
   return desktopCapturer.getSources({ types: ['window', 'screen'] });
}

export const getMachineInfo = () => {
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
    return machineInfo;
}

export const getAppInfo = () => {
    const packageJson = require('../package.json');
    const appVersion = packageJson.version;
    return { appVersion };
}

export const saveSettings = (data) => {
    const { socket_url, company_id } = data;
    const envFile = path.join(__dirname, '../.env');
    fs.readFile(envFile, 'utf8', (err, data) => {
        if (err) {
            console.log('error reading env file', err);
            return;
        }
        const updated_data = data
            .replace(/VITE_SOCKET_URL=.*/g, `VITE_SOCKET_URL=${socket_url}`)
            .replace(/VITE_COMPANY_ID=.*/g, `VITE_COMPANY_ID=${company_id}`);

        fs.writeFile(envFile, updated_data, 'utf8', (err) => {
            if (err) {
                console.log('error writing to env file', err);
                return;
            }
        });
    });
}