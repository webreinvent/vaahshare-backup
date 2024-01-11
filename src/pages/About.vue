<script setup lang="ts">
import {onMounted} from "vue";
import {useRootStore} from "../stores/root";

const store = useRootStore();

</script>

<template>
  <div class="window">
    <p>This is an about page</p>
  </div>
</template>
