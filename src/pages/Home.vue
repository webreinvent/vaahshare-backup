<script setup>
import {ipcRenderer} from 'electron';
import {ref, onMounted} from 'vue';

// Define your variables
// const selectMenu = ref(null);
const streaming = ref(false);
let stream;

let videoElement;
const selectedScreen = ref(null);
const screens = ref([]);

// Fetch screens when the component is mounted
onMounted(async () => {
  console.log("ll");
  screens.value = await ipcRenderer.invoke('getSources');
});


const startStreaming = async () => {
  try {
    if (selectedScreen.value) {
      // Send selected screen ID to the main process
      console.log(selectedScreen.value);
      const result = await ipcRenderer.invoke('startStreaming', selectedScreen.value);
      console.log(result);
  console.log(videoElement)
      videoElement.srcObject = result;
    } else {
      // Handle the case where no screen is selected
      console.error('No screen selected');
    }
  } catch (error) {
    // Handle errors appropriately
    console.error('Error during streaming:', error);
  }
};

</script>

<template>
  <div class="text-center">
    <div>
            <video ref="videoElement"></video>
            <button @click="startStreaming" :disabled="streaming">Start Streaming</button>
            <button @click="stopStreaming" :disabled="!streaming">Stop Streaming</button>


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
