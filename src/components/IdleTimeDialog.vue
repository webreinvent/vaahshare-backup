<template>
  <Dialog
      v-model:visible="store.show_idle_time_dialog"
      modal
      header="Warning"
      :style="{ width: '25rem' }"
      :closable="false"
      :draggable="false">
    <span class="p-text-secondary block mb-5">
      {{ store.getIdleTimeMessage() }}
    </span>
    <div class="flex justify-content-center">
      <Button label="OK" class="w-3" @click="store.onIdleTimeDialogClose" />
    </div>
  </Dialog>
</template>

<script setup>
import {useRootStore} from "../stores/root";

const store = useRootStore();
</script>