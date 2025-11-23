<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="w-10 h-10 rounded-full bg-morandi-surface border border-morandi-border flex items-center justify-center text-morandi-primary shadow-sm hover:bg-gray-50 transition-colors"
      :title="getLocaleName(locale)"
    >
      <Globe :size="20" />
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    />
    
    <div
      v-if="isOpen"
      class="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-morandi-border overflow-hidden min-w-[140px]"
    >
      <button
        v-for="loc in supportedLocales"
        :key="loc"
        @click="handleLocaleChange(loc)"
        :class="[
          'w-full px-4 py-2 text-left text-sm transition-colors',
          locale === loc
            ? 'bg-morandi-primary text-white'
            : 'text-morandi-text hover:bg-gray-50'
        ]"
      >
        {{ getLocaleName(loc) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Globe } from 'lucide-vue-next';
import { useLanguage, getSupportedLocales, getLocaleName } from '../composables/useLanguage';
import type { Locale } from '../i18n';

const { locale, setLocale } = useLanguage();
const isOpen = ref(false);
const supportedLocales = getSupportedLocales();

const handleLocaleChange = (loc: Locale) => {
  setLocale(loc);
  isOpen.value = false;
};
</script>

