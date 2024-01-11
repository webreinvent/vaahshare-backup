<script setup>
import {ipcRenderer} from 'electron';
import {ref, onMounted} from 'vue';

// Define your variables
// const selectMenu = ref(null);
const streaming = ref(false);


let videoElement = ref(null);
const selectedScreen = ref(null);
const screens = ref([]);



//
//
// const startStreaming = async () => {
//   try {
//     if (selectedScreen.value) {
//       console.log(selectedScreen.value);
//
//       const result = await ipcRenderer.invoke('startStreaming', selectedScreen.value);
//       console.log(result);
//
//       videoElement.value.srcObject = result;
//       streaming.value = true; // Update streaming state
//     } else {
//       // Handle the case where no screen is selected
//       console.error('No screen selected');
//     }
//   } catch (error) {
//     // Handle errors appropriately
//     console.error('Error during streaming:', error);
//   }
// };


const startStreamingFunction = async () => {
  try {
    // Start streaming and get the stream ID
    const selectedScreen = '1'; // Replace with the selected screen ID
    const stream = await window.electron.ipcRenderer.invoke('startStreaming', selectedScreen);

    // Do something with the stream, e.g., assign it to a video element
    videoElement.srcObject = stream;

    console.log('Stream started:', stream);
  } catch (error) {
    console.error('Error starting streaming:', error);
  }
};



// const test = async () =>{
//   const data = await window.message?.sendmsg('cccc')
// console.log(data)
// }



onMounted(
  async () => {
    console.log("ll");
    screens.value = await ipcRenderer.invoke('getSources');

    // await startStreamingFunction();
    // videoElement.value = await ipcRenderer.invoke('startStreaming', 1)
  });



</script>

<template>
  <div class="text-center">
    <div>
            <video ref="videoElement"></video>
            <button @click="startStreamingFunction" :disabled="streaming">Start Streaming</button>
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
