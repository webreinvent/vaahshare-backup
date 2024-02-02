<script setup lang="ts">
import {onMounted} from "vue";
import {useRootStore} from "../stores/root";
const store = useRootStore();
</script>

<template>
    <Card>
      <template #content>
        <form @submit="store.saveSocketUrl">
          <div class="flex flex-column align-items-center">
            <label for="socketUrl">Socket URL:</label>
            <InputText
                v-model="store.socket_url"
                class="w-full md:w-14rem"
                required
                pattern="https?://.+"
            />
          </div>
          <div class="flex flex-column align-items-center">
            <label for="socketUrl">Company ID:</label>
            <InputText
                class="w-full md:w-14rem"
            />
          </div>
          <Button class="button mt-3" type="submit">Save</Button>
        </form>
      </template>
    </Card>
</template>

