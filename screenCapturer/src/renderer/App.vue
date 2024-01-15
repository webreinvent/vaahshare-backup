<script setup lang="ts">
import {onMounted, ref} from 'vue';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import * as console from "console";


const socket = io('ws://localhost:3001')


socket.on("connect", () => {
  console.log(socket.id);
});

const selectedSource = ref('');
const video = ref<HTMLVideoElement | null>(null);
const videoSources = ref<any[]>([]);
const isStreaming = ref(false);
const buffer = ref<any[]>([]);
const peer = new SimplePeer({initiator: location.hash === '#init'});


peer.on('signal', (data) => {
  socket.emit('signal', data);
});


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

    // Display the stream on the video element
    if (video.value) {
      video.value.srcObject = streams;
      video.value.play();
    } else {
      console.error('Video element is not available yet.');
      return;
    }

    const mediaRecorder = new MediaRecorder(streams);


    // let bufertoDataUrl() =>{
    //   let blob = new Blob(buffer, {
    //     type: 'video/webm'
    //   })
    // }
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        // Emit the recorded data (Blob or ArrayBuffer) via Socket.IO
        const dataUrl = await blobToDataUrl(event.data);
        socket.emit('stream', dataUrl)
      }
    };

    // Start recording after the stream is ready
    mediaRecorder.start(3000);

    isStreaming.value = true; // Update stream state
  } catch (error) {
    console.error('Error starting stream:', error);
  }
};

const blobToDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
