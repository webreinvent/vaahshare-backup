<script setup lang="ts">
import {onMounted} from "vue";
import {useRootStore} from "../stores/root";
import {io} from "socket.io-client";
const store = useRootStore();

onMounted(() => {
  store.onLoad();

  const socket = io('http://localhost:3000');

  socket.on("connect", () => {
    console.log('connected')
  });

  socket.on("new-client-connected", (data) => {
    console.log(data)
  });


  socket.on("client-disconnected", (data) => {
    console.log(data)
  });


  setTimeout(() => {
    socket.emit("message", "Hello From the Client");
  }, 3000);

})
</script>

<template>
  <div class="window">
    <Card>
      <template #content>
            <div class="flex justify-content-center mb-3">
              <video class="preview w-6 shadow-6"></video>
            </div>
             <div class="flex flex-column align-items-center">
               <label for="screenDropdown">Select Screen:</label>
               <Dropdown v-model="store.selected_source_id" :options="store.sources" optionLabel="name" placeholder="Select a Screen" class="w-full md:w-14rem" @change="store.onSourceChanged" option-value="id" />
               <div class="button-container mt-3 flex gap-3">
                 <Button class="button">Start/Stop Stream</Button>
                 <Button class="button" @click="store.takeScreenshot">Take Screenshot</Button>
               </div>
             </div>
      </template>
    </Card>
  </div>
</template>

