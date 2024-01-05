<script setup lang="ts">


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
  <div class="mb-6 flex items-center justify-between">
    <button @click="toggleDark()">
        <span class="ml-2">
          {{ isDark ? `🌙 ${t('common.dark')}` : `💡 ${t('common.light')}` }}
          {{ t('common.theme') }}
        </span>
    </button>

    <button @click="toggleLocales">
      <span>{{ t('common.language') }}: </span>
      <span class="text-green-600">{{ locale }}</span>
    </button>
  </div>
</template>
