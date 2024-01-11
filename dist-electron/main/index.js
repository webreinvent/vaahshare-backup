"use strict";
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
process.env.DIST_ELECTRON = node_path.join(__dirname, "..");
process.env.DIST = node_path.join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? node_path.join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
if (node_os.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
const preload = node_path.join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = node_path.join(process.env.DIST, "index.html");
electron.ipcMain.handle("getSources", async () => {
  const inputSources = await getVideoSources();
  win.webContents.send("video-sources", inputSources);
  return inputSources;
});
async function createWindow() {
  win = new electron.BrowserWindow({
    title: "Main window",
    icon: node_path.join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  electron.ipcMain.handle("startStreaming", async (event, id) => {
    console.log("-->", id);
    const stream = await startStreaming(id);
    console.log("--> 2");
    const serializedStream = serializeStream(stream);
    event.sender.send("stream", serializedStream);
    return stream;
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.send("video-sources");
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:"))
      electron.shell.openExternal(url2);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin")
    electron.app.quit();
});
electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized())
      win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
electron.ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new electron.BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
async function getVideoSources() {
  try {
    const sources = await electron.desktopCapturer.getSources({ types: ["screen", "window"] });
    const screens = sources.map((source, index) => ({
      id: index + 1,
      // You can customize the ID as needed
      name: source.name
    }));
    console.log(screens);
    return screens;
  } catch (error) {
    console.error("Error getting video sources:", error);
    return [];
  }
}
async function startStreaming(screenId) {
  const IS_MACOS = await electron.ipcRenderer.invoke("getOperatingSystem") === "darwin";
  console.log("till now");
  const audio = !IS_MACOS ? {
    mandatory: {
      chromeMediaSource: "desktop"
    }
  } : false;
  const constraints = {
    audio,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: screenId
      }
    }
  };
  console.log("till now");
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  console.log(stream);
  return stream;
}
electron.ipcMain.on("vaah-capture-screenshot", async (event) => {
  console.log("ipc");
});
//# sourceMappingURL=index.js.map
