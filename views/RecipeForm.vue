<template>
  <div class="w-full max-w-md mx-auto bg-morandi-bg min-h-screen shadow-2xl overflow-hidden relative">
    <Header 
      :title="isEdit ? t('recipeForm.editRecipe') : t('recipeForm.newRecipe')" 
      :on-back="handleBack"
    />
    <RecipeForm 
      :initial-recipe="initialRecipe"
      @save="handleSave"
      @cancel="handleBack"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Header from '../components/Header.vue';
import RecipeForm from '../components/RecipeForm.vue';
import { useLanguage } from '../composables/useLanguage';
import { useRecipes } from '../composables/useRecipes';
import type { Recipe } from '../types';

interface Props {
  isEdit?: boolean;
  recipeId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  recipeId: undefined,
});

const router = useRouter();
const route = useRoute();
const { t } = useLanguage();
const { getRecipeById, saveRecipe } = useRecipes();

const isEdit = computed(() => {
  return props.isEdit || route.name === 'RecipeEdit';
});

const recipeId = computed(() => {
  return props.recipeId || (route.params.id as string);
});

const initialRecipe = computed<Recipe | null>(() => {
  if (isEdit.value && recipeId.value) {
    return getRecipeById(recipeId.value) || null;
  }
  return null;
});

const handleSave = async (recipeData: Omit<Recipe, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => {
  try {
    await saveRecipe(recipeData);
    
    if (recipeData.id) {
      router.push(`/recipe/${recipeData.id}`);
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Error saving recipe:', error);
    router.push('/');
  }
};

const handleBack = () => {
  if (isEdit.value && recipeId.value) {
    router.push(`/recipe/${recipeId.value}`);
  } else {
    router.push('/');
  }
};
</script>

