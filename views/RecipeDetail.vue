<template>
  <div class="w-full max-w-md mx-auto bg-morandi-surface min-h-screen shadow-2xl overflow-hidden relative">
    <div v-if="recipe">
      <RecipeDetailComponent 
        :recipe="recipe"
        @edit="handleEdit"
        @delete="handleDelete"
        @back="handleBack"
      />
    </div>
    <div v-else class="min-h-screen flex items-center justify-center">
      <p class="text-morandi-subtext">食谱不存在</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import RecipeDetailComponent from '../components/RecipeDetail.vue';
import { useRecipes } from '../composables/useRecipes';

const router = useRouter();
const route = useRoute();
const { getRecipeById, deleteRecipe } = useRecipes();

const recipe = computed(() => {
  const id = route.params.id as string;
  return getRecipeById(id);
});

const handleEdit = (recipe: any) => {
  router.push(`/recipe/${recipe.id}/edit`);
};

const handleDelete = async (id: string) => {
  try {
    await deleteRecipe(id);
    router.back();
  } catch (error) {
    console.error('删除食谱失败:', error);
  }
};

const handleBack = () => router.back();
</script>

