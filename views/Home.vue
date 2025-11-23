<template>
  <div class="w-full max-w-md mx-auto bg-morandi-bg min-h-screen shadow-2xl overflow-hidden relative flex flex-col">
    <!-- Top Bar -->
    <div class="bg-morandi-bg pt-4 px-4 pb-2">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-serif font-bold text-morandi-text">{{ t('home.title') }}</h1>
          <p class="text-xs text-morandi-subtext">{{ t('home.subtitle') }}</p>
        </div>
        <div class="flex gap-2">
          <button 
            v-if="installPrompt"
            @click="handleInstall"
            class="w-10 h-10 rounded-full bg-morandi-primary text-white flex items-center justify-center shadow-sm hover:bg-opacity-90 transition-all"
            :title="t('home.installApp')"
          >
            <Download :size="20" />
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative mb-2">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
        <input
          type="text"
          :placeholder="t('home.searchPlaceholder')"
          v-model="searchQuery"
          class="w-full bg-white pl-10 pr-4 py-3 rounded-xl shadow-sm text-sm text-morandi-text focus:ring-2 focus:ring-morandi-primary/20 outline-none transition-all placeholder-gray-300"
        />
      </div>
    </div>

    <!-- Filter -->
    <CategoryFilter :selected-category="selectedCategory" @select="selectedCategory = $event" />

    <!-- Recipe Grid -->
    <div class="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
      <div v-if="filteredRecipes.length === 0" class="flex flex-col items-center justify-center h-64 text-morandi-subtext opacity-60">
        <ChefHat :size="48" class="mb-2" />
        <p>{{ t('home.noRecipes') }}</p>
      </div>
      <div v-else class="grid grid-cols-2 gap-4 w-full">
        <RecipeCard 
          v-for="recipe in filteredRecipes"
          :key="recipe.id" 
          :recipe="recipe" 
          @click="handleRecipeClick" 
        />
      </div>
    </div>

    <!-- Floating Action Button -->
    <button
      @click="() => router.push('/recipe/new')"
      class="fixed bottom-6 right-6 w-14 h-14 bg-morandi-primary text-white rounded-full shadow-lg shadow-morandi-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
      style="bottom: 1.5rem; right: 1.5rem"
    >
      <Plus :size="28" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus, ChefHat, Download } from 'lucide-vue-next';
import { Recipe, Category } from '../types';
import RecipeCard from '../components/RecipeCard.vue';
import CategoryFilter from '../components/CategoryFilter.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { useLanguage } from '../composables/useLanguage';
import { useRecipes } from '../composables/useRecipes';

const router = useRouter();
const { t } = useLanguage();
const { recipes } = useRecipes();

const searchQuery = ref('');
const selectedCategory = ref<Category | 'All'>('All');
const installPrompt = ref<any>(null);

// PWA 安装提示
onMounted(() => {
  const handler = (e: any) => {
    e.preventDefault();
    installPrompt.value = e;
  };
  window.addEventListener('beforeinstallprompt', handler);

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handler);
  });
});

const handleInstall = () => {
  if (installPrompt.value) {
    installPrompt.value.prompt();
    installPrompt.value.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        installPrompt.value = null;
      }
    });
  }
};

const handleRecipeClick = (recipe: Recipe) => {
  const path = `/recipe/${recipe.id}`;
  console.log('Navigating to:', path);
  router.push(path).catch((err: any) => {
    console.error('Navigation error:', err);
  });
};

// 过滤食谱
const filteredRecipes = computed(() => {
  return recipes.value.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === 'All' || recipe.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});
</script>

