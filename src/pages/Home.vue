<script setup lang="ts">
import {onMounted} from "vue";
import {useRootStore} from "../stores/root";
const store = useRootStore();
</script>

<template>
  <div class="window">
    <div v-if="!store.loading && store.is_socket_url_set">
      <Card >
        <template #content>
          <div class="flex justify-content-center mb-3">
            <video class="preview w-6 shadow-6"></video>
          </div>
          <div class="flex flex-column align-items-center">
            <label for="screenDropdown">Select Screen:</label>
            <Dropdown v-model="store.selected_source_id" :options="store.sources" optionLabel="name" placeholder="Select a Screen" class="w-full md:w-14rem" @change="store.onSourceChanged" option-value="id" />
            <div class="button-container mt-3 flex gap-3">
              <Button class="button" @click="store.toggleStream" >
                {{ store.is_streaming ? 'Stop Streaming' : 'Start Streaming' }}
              </Button>
              <Button class="button" @click="store.takeScreenshot">Take Screenshot</Button>
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div v-else>
      <div class="flex justify-content-center align-items-center">
        <Message severity="error">
         Socket URL is not set. Please set the socket URL in the settings.
        </Message>
      </div>
    </div>
  </div>
</template>

