<template>
  <div>
    <video ref="videoPlayer" controls :key="videoKey" autoplay></video>
  </div>
</template>

<script>
import io from 'socket.io-client/dist/socket.io.js';

export default {
  data() {
    return {
      socket: null,
      videoKey: 0,
      receivedChunks: [],
    };
  },

  mounted() {
    this.socket = io('http://localhost:3001');
    this.socket.on('connect', () => {
      this.initSocketEvents();
    });
  },

  methods: {
    initSocketEvents() {
      this.socket.on('stream', (dataUrl) => {
        const receivedBlob = this.dataUrlToBlob(dataUrl);
        console.log(receivedBlob)
        this.receivedChunks.push(receivedBlob);
        this.playOrUpdateVideo();
      });
    },

    dataUrlToBlob(dataUrl) {
      const byteString = atob(dataUrl.split(',')[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }

      const type = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      return new Blob([intArray], {type});
    },

    playOrUpdateVideo() {
      if (this.$refs.videoPlayer) {
        const currentSource = this.$refs.videoPlayer.src;
        const currentBlob = this.dataUrlToBlob(currentSource);
        const newBlob = new Blob([...currentBlob, ...this.receivedChunks], {type: 'video/x-matroska'});

        const url = URL.createObjectURL(newBlob);
        this.$refs.videoPlayer.src = url;

        this.receivedChunks = [];
        this.videoKey += 1; // Increment the key to force a re-render of the video element
      }
    },
  },

  updated() {
    // Any additional logic if needed after an update
  },
};
</script>

<style scoped>
/* Add your component-specific styles here */

.video {
  border: 1px solid black;
}
</style>
