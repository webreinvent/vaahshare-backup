<script setup lang="ts">
import {useRootStore} from "../stores/root";
const store = useRootStore();
</script>

<template>
    <Card>
      <template #content>
        <form @submit.prevent="store.saveSettings">
          <div class="flex flex-column align-items-center gap-2">
            <label for="socketUrl">Socket URL:</label>
            <InputText
                v-model="store.socket_url"
                class="w-full md:w-14rem"
                required
            />
          </div>
          <div class="flex flex-column align-items-center mt-3 gap-2">
            <label for="socketUrl">Company ID:</label>
            <InputText
                class="w-full md:w-14rem"
                v-model="store.company_id"
            />
          </div>
          <Button class="button mt-3" type="submit">Save</Button>
        </form>
      </template>
    </Card>
</template>

