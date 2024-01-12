<template>
  <div>
    <video class="video" ref="receivedVideo" autoPlay></video>
  </div>
</template>

<script>
import io from 'socket.io-client/dist/socket.io.js';

export default {
  mounted() {
    this.socket = io('http://localhost:3001');
    this.initSocketEvents();
  },

  data() {
    return {
      receivedVideo: null,
      chunks: [],
    };
  },

  methods: {
    initSocketEvents() {
      this.socket.on('stream', (streamData) => {
        this.handleReceivedStream(streamData);
      });
    },

    handleReceivedStream(streamData) {
      console.log(streamData);

      // Create a Blob from the received data
      const blob = new Blob([streamData], {type: 'video/webm'});

      // Create a URL for the Blob
      const videoUrl = URL.createObjectURL(blob);
      console.log('blob', blob)

      // Set the video element source to the Blob URL
      this.$refs.receivedVideo.src = videoUrl;
    },
  },
};
</script>

<style scoped>
/* Add your component-specific styles here */

.video {
  border: 1px solid black;
}
</style>
