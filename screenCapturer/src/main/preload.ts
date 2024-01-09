import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message)
})


contextBridge.exposeInMainWorld('myAPIs', {
  getVideoSources:  () => {
    return  ipcRenderer.invoke('getSources');
  },
  startStream: async () => {
    return ipcRenderer.invoke('startScreenCapture')
  },
  stopRecording: async () => {
    // Implement and interact with the stop recording logic here
  },
});