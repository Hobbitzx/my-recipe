<template>
  <div class="w-full max-w-md mx-auto bg-morandi-bg min-h-screen shadow-2xl overflow-hidden relative">
    <Header 
      :title="isEdit ? t('recipeForm.editRecipe') : t('recipeForm.newRecipe')" 
      :on-back="handleBack"
    >
      <template #rightAction>
        <div class="flex items-center gap-2">
          <button
            @click="handleBack"
            class="px-4 py-2 rounded-lg font-semibold text-morandi-text bg-morandi-bg hover:bg-gray-200 transition-colors text-sm"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="handleSaveClick"
            class="px-4 py-2 rounded-lg font-semibold text-white bg-morandi-primary hover:opacity-90 transition-opacity shadow-md shadow-morandi-primary/30 text-sm"
          >
            {{ t('recipeForm.saveRecipe') }}
          </button>
        </div>
      </template>
    </Header>
    <div class="pt-14">
      <RecipeForm
        ref="recipeFormRef"
        :initial-recipe="initialRecipe"
        @save="handleSave"
        @cancel="handleBack"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
const recipeFormRef = ref<InstanceType<typeof RecipeForm> | null>(null);

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
    const recipeId = await saveRecipe(recipeData);
    
    if (recipeId) {
      if (isEdit.value) {
        router.back();
      } else {
        router.replace(`/recipe/${recipeId}`);
      }
    } else {
      console.error('No id returned from saveRecipe');
    }
  } catch (error) {
    console.error('Error saving recipe:', error);
  }
};

const handleBack = () => {
  router.go(-1);
};

const handleSaveClick = () => {
  // 调用RecipeForm组件暴露的submit方法
  if (recipeFormRef.value && 'submit' in recipeFormRef.value) {
    recipeFormRef.value.submit();
  }
};
</script>

