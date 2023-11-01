<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="text-center">

    <h1>About</h1>

    <p class="text-center mt-6 flex items-center justify-center">
      <router-link
        to="/home"
        class="block mx-4 px-2 py-1 border-b-2 border-green-300 hover:border-green-500 transition"
      >
        {{ t('homepage.goToHome') }}
      </router-link>

    </p>
  </div>
</template>
