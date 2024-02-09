<script setup lang="ts">
import { useRootStore } from "../stores/root";
import Fieldset from 'primevue/fieldset';
const store = useRootStore();

</script>
<template>
  <div>
    <div class="flex justify-content-center align-items-center">
      <Button label="Back"  class="p-button-rounded p-button-text" @click="store.router.push({name: 'home'})" />
    </div>
    <div class="flex justify-content-center align-items-center">
      <Message severity="info" :closable="false">
        Debug options only available in development mode.
      </Message>
    </div>
      <div class="card">
        <Fieldset legend="Uploads">
          <p>List of local files that are uploading to the server.</p>
        </Fieldset>
      </div>
  </div>
</template>