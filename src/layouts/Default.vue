<script setup lang="ts">
import TopMenu from '../components/TopMenu.vue';
import Footer from '../components/Footer.vue';

console.log(
  '[App.vue]',
  `Hello world from Electron ${process.versions.electron}!`
);

const isDark = useDark();
const toggleDark = useToggle(isDark);

const { t, availableLocales, locale } = useI18n();

function toggleLocales() {
  // change to some real logic
  const locales = availableLocales;
  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length];
}
</script>

<template>
  <div
    id="app"
    class="max-w-5xl mx-auto px-4 py-5 dark:bg-slate-800 dark:text-gray-200 min-h-screen"
  >

    <TopMenu/>

    <div id="main-content">
      <router-view class="my-5" />
    </div>

    <Footer/>

  </div>
</template>
