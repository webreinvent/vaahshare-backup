<script setup>
import {ref} from "vue";

const items = ref([
  {
    label: 'Streaming App',
    icon: 'pi pi-user'
  },
]);
</script>

<template>
  <div id="main-content">
    <div>
      <Menubar :model="items" />
    </div>
      <router-view />
  </div>
</template>
