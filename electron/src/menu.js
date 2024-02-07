const { app, BrowserWindow, desktopCapturer, ipcMain, Menu, dialog }  = require('electron');

export const getMenuTemplate = (win, app, appInfo) => {
    return [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Settings',
                    click: () => {
                        console.log('Settings clicked');
                        win?.webContents.send('navigate', 'settings');
                    }
                },
                {
                    label: 'Exit',
                    click: () => {
                        app.quit();
                    }
                },
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        //show dialog bix with app version
                        dialog.showMessageBox(win, {
                            type: 'info',
                            title: 'About',
                            message: `App Version: ${appInfo.appVersion}`,
                            buttons: ['OK']
                        });
                    }
                },
                {
                    label: 'Check for updates',
                    click: () => {
                        console.log('Check for updates clicked');
                    }
                }
            ]
        }
    ]
};