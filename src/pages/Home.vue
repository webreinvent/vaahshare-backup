<script setup lang="ts">
import {useRootStore} from "../stores/root";
const store = useRootStore();
// import {useRouter} from "vue-router";
// const router = useRouter();

</script>

<template>
  <div class="window">
    <div v-if="store.is_reconnecting">
      <div class="flex justify-content-center align-items-center">
        <Message severity="success" :closable="false">
          Internet is back. Reconnecting...
        </Message>
      </div>
    </div>

    <div v-if="!store.is_online && store.auto_record">
      <div class="flex justify-content-center align-items-center">
        <Message severity="error" :closable="false">
          You are offline. Local recording is enabled. which will be uploaded once you are online.
        </Message>
      </div>
    </div>

    <div v-if="store.loading">
      <div class="flex justify-content-center align-items-center">
        Loading...
      </div>
    </div>

    <div v-else-if="!store.is_socket_url_set">
      <div class="flex justify-content-center align-items-center">
        <Message severity="error">
          Socket URL is not set or invalid. Please set the socket URL in settings.
        </Message>
      </div>
    </div>
    
    <div v-else>
      <Card >
        <template #content>
          <div class="flex justify-content-center mb-3">
            <video class="preview w-6 shadow-6"></video>
          </div>
          <div class="flex flex-column align-items-center">
            <div class="button-container mt-3 flex gap-3">
              <Button :disabled="store.is_reconnecting" class="button" @click="store.toggleStream" v-if="store.online || store.is_streaming" >
                {{ store.is_streaming ? 'Stop Streaming' : 'Start Streaming' }}
              </Button>
              <Button :disabled="store.is_reconnecting" class="button" v-else @click="store.toggleRecording" >
                {{ store.is_recording ? 'Stop Recording' : 'Start Recording' }}
              </Button>
            </div>
          </div>
        </template>
      </Card>
    </div>

  </div>
</template>

