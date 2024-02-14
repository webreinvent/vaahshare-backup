<script setup lang="ts">
import { onMounted } from "vue";
import { useRootStore } from "../stores/root";
import Fieldset from 'primevue/fieldset';
const store = useRootStore();

onMounted(() => {
  store.getVideos();
});

</script>
<template>
  <div>
    <div class="flex justify-content-center align-items-center gap-3">
      <Button label="Back"  class="p-button-rounded" outlined  @click="store.navigate('home')" />
      <Button
          :label="store.online ? 'Online' : 'Offline'"
          :class="store.online ? 'p-button-success' : 'p-button-danger'"
          class="p-button-rounded"
          outlined
      />
    </div>
    <div class="flex justify-content-center align-items-center">
      <Message severity="info" :closable="false">
        Debug options only available in development mode.
      </Message>
    </div>
      <div class="card">
        <Fieldset legend="Uploads">
          <DataTable :value="store.videos">
            <Column field="name" header="Name"></Column>
            <Column field="size" header="Size">
              <template #body="slotProps">
                {{ store.bytesToMB(slotProps.data.size) }} MB
              </template>
            </Column>
            <Column field="createdAt" header="Created At">
              <template #body="slotProps">
                {{ new Date(slotProps.data.createdAt).toDateString() }}
              </template>
            </Column>
            <Column header="Status">

            </Column>

          </DataTable>
        </Fieldset>
      </div>
  </div>
</template>