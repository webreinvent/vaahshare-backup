<script setup>
import {
  app, BrowserWindow, ContextBridge, shell,
  ipcMain, screen, desktopCapturer, ipcRenderer, dialog
} from 'electron';
import {useRootStore} from '../stores/root'

const {t} = useI18n();

const root = useRootStore();
import { ref } from 'vue';
import { ipcRenderer } from 'electron';

const selectMenu = ref(null);

async function loadVideoSources() {
  const videoSources = await ipcRenderer.invoke('getSources');

}

async function startStream() {
  const screenId = selectMenu.value.options[selectMenu.value.selectedIndex].value;
  const stream = await ipcRenderer.invoke('startStreaming', screenId);

}

function stopStream() {
  ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });



    if (process.env.VITE_DEV_SERVER_URL) {
      childWindow.loadURL(`${url}#${arg}`);
    } else {
      childWindow.loadFile(indexHtml, { hash: arg });
    }
  });

  ipcRenderer.send('stopStreaming');
}

</script>

<template>
  <div class="text-center">

    <div>
      <video ref="videoElement"></video>
      <button @click="startStream" :disabled="streaming">Start Streaming</button>
      <button @click="stopStream" :disabled="!streaming">Stop Streaming</button>
      <button @click="loadVideoSources">Get Video Sources</button>
    </div>

  </div>
</template>
