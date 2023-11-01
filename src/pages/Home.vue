<script setup>
import {useRootStore} from '../stores/root'

const { t } = useI18n();

const root = useRootStore();

</script>

<template>
  <div class="text-center">

    <h1>Home Page</h1>


    {{root.count}}

    <button @click="root.test()">Increase Count</button>



    <p class="text-center mt-6 flex items-center justify-center">

      <router-link
        to="/about"
        class="block mx-4 px-2 py-1 border-b-2 border-green-300 hover:border-green-500 transition"
      >
        {{ t('aboutPage.goToAbout') }}
      </router-link>
    </p>

  </div>
</template>
