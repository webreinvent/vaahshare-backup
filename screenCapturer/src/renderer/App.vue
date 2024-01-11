<script setup lang="ts">
import {onMounted, ref} from 'vue';
import io from 'socket.io-client';
import ss from 'socket.io-stream';


const socket = io('ws://localhost:3001')


socket.on("connect", () => {
  console.log(socket.id);
});


const selectedSource = ref('');
const video = ref<HTMLVideoElement | null>(null);
const videoSources = ref<any[]>([]);
const isStreaming = ref(false);
const getVideoSources = async () => {
  try {
    const inputSources = await window.myAPIs.getVideoSources();
    videoSources.value = inputSources;
  } catch (error) {
    console.error('Error fetching video sources:', error);
  }
};


const startStream = async () => {
  try {
    const mediaConstraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: selectedSource.value,

        }
      }
    };

    const streams = await navigator.mediaDevices.getUserMedia(mediaConstraints);

    socket.on('stream',function(streams){
      socket.broadcast.emit('stream',streams);
    });
    if (video.value) {
      video.value.srcObject = streams;
      video.value.play();
    } else {
      console.error('Video element is not available yet.');
    }
    isStreaming.value = true; // Update stream state
  } catch (error) {
    console.error('Error starting stream:', error);


  }
};


const stopStream = () => {
  if (video.value && video.value.srcObject) {
    const tracks = (video.value.srcObject as MediaStream).getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    video.value.srcObject = null;
  }
  isStreaming.value = false;
};

onMounted(getVideoSources);
</script>

<template>
  <div class="container">
    <h1>Video Stream</h1>
    <select v-model="selectedSource" class="select">
      <option v-for="source in videoSources" :key="source.id" :value="source.id">{{ source.name }}</option>
    </select>
    <div class="video-container">

      <video ref="video" autoplay></video>
    </div>
    <div class="button-container">
      <button @click="startStream" :disabled="isStreaming" class="start-button">Start Stream</button>
      <button @click="stopStream" :disabled="!isStreaming" class="stop-button">Stop Stream</button>
    </div>
  </div>
</template>


<style>
.container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  font-size: 2em;
  margin-bottom: 20px;
}

.select {
  display: flex;
  justify-content: center;
  padding: 1rem;
  margin-bottom: 1rem;
}

.video-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

video {
  width: 70vw;
  max-width: 100vw;
  border: 1px solid #ccc;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.start-button,
.stop-button {
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
}

.start-button:disabled,
.stop-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
