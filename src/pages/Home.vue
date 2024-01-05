<script setup>
import { ipcRenderer } from 'electron';
import { ref, onMounted } from 'vue';

// Define your variables
// const selectMenu = ref(null);
const streaming = ref(false);
let stream;


const selectedScreen = ref(null);
const screens = ref([]);

// Fetch screens when the component is mounted
onMounted(async () => {
  screens.value = await ipcRenderer.invoke('getScreens');
});

// Define your functions
// const getVideoSources = async () => {
//   try {
//     // Use ipcRenderer.invoke to get video sources from the main process
//     const sources = await ipcRenderer.invoke('getSources');
//     console.log('Video Sources:', sources);
//
//     // Update the select menu options
//     selectMenu.value.innerHTML = '';
//     sources.forEach(source => {
//       const option = document.createElement('option');
//       option.value = source.id;
//       option.text = source.name;
//       selectMenu.value.appendChild(option);
//     });
//   } catch (error) {
//     console.error('Error getting video sources:', error);
//   }
// };
//
// const startStreaming = async () => {
//   try {
//     // Get the selected screenId from the select menu
//     const screenId = selectMenu.value.value;
//
//     // Use ipcRenderer.invoke to start streaming with the selected screenId
//     stream = await ipcRenderer.invoke('startStreaming', screenId);
//     console.log('Streaming started:', stream);
//
//     // Set streaming flag to true
//     streaming.value = true;
//   } catch (error) {
//     console.error('Error starting streaming:', error);
//   }
// };
//
// const stopStreaming = () => {
//   // Use ipcRenderer.send to inform the main process to stop streaming
//   ipcRenderer.send('stopStreaming');
//   // Additional logic if needed after sending the stopStreaming event
//
//   // Set streaming flag to false
//   streaming.value = false;
// };

// Lifecycle hook to get video sources when the component is mounted
onMounted(() => {
  getVideoSources();
});
</script>

<template>
  <div class="text-center">
    <div>
      <video ref="videoElement"></video>
<!--      <button @click="startStreaming" :disabled="streaming">Start Streaming</button>-->
<!--      <button @click="stopStreaming" :disabled="!streaming">Stop Streaming</button>-->
<!--      <button @click="getVideoSources">Get Video Sources</button>-->

<!--      &lt;!&ndash; Select menu for video sources &ndash;&gt;-->
<!--      <select ref="selectMenu"></select>-->

      <div>
        <label for="screenSelect">Select Screen:</label>
        <select id="screenSelect" v-model="selectedScreen">
          <option v-for="screen in screens" :key="screen.id" :value="screen.id">
            {{ screen.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
