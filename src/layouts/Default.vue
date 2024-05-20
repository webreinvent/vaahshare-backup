<script setup>
import {ref} from "vue";
import {onMounted} from "vue";
import {useRootStore} from "../stores/root";
import {useRouter} from "vue-router";
import IdleTimeDialog from "../components/IdleTimeDialog.vue";
const store = useRootStore();
const router = useRouter();
//
onMounted(() => {
  // On load
  store.onLoad(router);

  // Get Local Videos
  store.getVideos();
})

const items = ref([
  {
    label: 'Streaming App',
    icon: 'pi pi-user'
  },
]);
</script>

<template>
  <div id="main-content">
<!--      <Menubar :model="items" />-->
      <div class="text-center">
        <h1>VaahShare</h1>
      </div>
      <router-view />

      <IdleTimeDialog />
  </div>
</template>
