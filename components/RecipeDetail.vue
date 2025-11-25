<template>
  <div class="bg-morandi-surface flex flex-col relative">
    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="showDeleteConfirm = false"
    >
      <div 
        class="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl transform transition-all" 
        @click.stop
      >
        <div class="flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Trash2 :size="24" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ t('recipeDetail.deleteConfirm') }}</h3>
          <p class="text-sm text-gray-500 mb-6">
            {{ tf('recipeDetail.deleteMessage', { title: recipe.title }) }}
          </p>
          <div class="flex gap-3 w-full">
            <button 
              @click="showDeleteConfirm = false"
              class="flex-1 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button 
              @click="confirmDelete"
              class="flex-1 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Sticky Header for Image -->
    <div class="relative w-full shrink-0 aspect-4-3">
      <img 
        :src="recipe.image" 
        :alt="recipe.title" 
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
      
      <div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30">
        <button 
          @click="$emit('back')"
          class="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft :size="24" />
        </button>
        
        <div class="flex gap-2">
          <button 
            @click="$emit('edit', recipe)"
            class="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <Edit2 :size="20" />
          </button>
          <button 
            @click="handleDeleteClick"
            class="p-2 bg-white/20 backdrop-blur-md rounded-full text-red-100 hover:bg-red-500 hover:text-white transition-colors group"
            :title="t('recipeDetail.deleteRecipe')"
          >
            <Trash2 :size="20" class="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>

    <div class="-mt-10 relative z-10 bg-morandi-surface rounded-t-[2rem] px-6 pt-8 pb-24 flex-grow shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
      <div class="flex flex-col items-center text-center mb-8">
        <div class="inline-block px-3 py-1 bg-morandi-secondary/20 text-morandi-text text-xs font-bold uppercase tracking-widest rounded-full mb-3">
          {{ getCategoryName(recipe.category) }}
        </div>
        <h1 class="text-3xl font-serif font-bold text-morandi-text mb-2">{{ recipe.title }}</h1>
        <div class="flex items-center text-morandi-subtext text-sm font-medium gap-2">
          <Clock :size="16" />
          <span>{{ recipe.prepTime }} {{ t('recipeForm.timeUnit') }}</span>
        </div>
      </div>

      <div class="prose prose-sm prose-stone max-w-none mb-8 text-center text-morandi-text/80">
        <p class="break-words">
          <AutoLink :text="recipe.description" />
        </p>
      </div>

      <!-- Ingredients Section -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="bg-morandi-primary/10 p-2 rounded-lg text-morandi-primary">
            <ChefHat :size="20" />
          </div>
          <h2 class="text-xl font-semibold text-morandi-text">{{ t('recipeDetail.ingredients') }}</h2>
          <span class="text-xs text-morandi-subtext bg-morandi-bg px-2 py-1 rounded-full ml-auto">
            {{ recipe.ingredients.length }} {{ t('recipeDetail.items') }}
          </span>
        </div>
        
        <div class="bg-morandi-bg rounded-2xl p-5 space-y-3">
          <div v-for="ing in recipe.ingredients" :key="ing.id" class="flex items-start gap-3">
            <div class="mt-1 w-4 h-4 rounded-full border-2 border-morandi-border shrink-0" />
            <span class="text-morandi-text font-medium break-words min-w-0 flex-1">{{ ing.text }}</span>
          </div>
        </div>
      </div>

      <!-- Steps Section -->
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="bg-morandi-secondary/20 p-2 rounded-lg text-morandi-text">
            <CheckCircle2 :size="20" />
          </div>
          <h2 class="text-xl font-semibold text-morandi-text">{{ t('recipeDetail.directions') }}</h2>
        </div>
        
        <div class="space-y-6 pl-2">
          <div v-for="(step, index) in recipe.steps" :key="step.id" class="relative pl-8 pb-2 border-l-2 border-morandi-border last:border-0">
            <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-morandi-secondary border-2 border-white shadow-sm" />
            <h3 class="text-xs font-bold text-morandi-primary uppercase mb-1 tracking-wide">{{ t('recipeDetail.step') }} {{ index + 1 }}</h3>
            <p class="text-morandi-text leading-relaxed break-words">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Clock, Edit2, Trash2, CheckCircle2, ChefHat, ArrowLeft } from 'lucide-vue-next';
import { Recipe } from '../types';
import { useLanguage } from '../composables/useLanguage';
import { getCategoryName } from '../composables/useCategory';
import AutoLink from './AutoLink.vue'

interface Props {
  recipe: Recipe;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  edit: [recipe: Recipe];
  delete: [id: string];
  back: [];
}>();

const { t, tf } = useLanguage();
const showDeleteConfirm = ref(false);

const handleDeleteClick = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  showDeleteConfirm.value = true;
};

const confirmDelete = () => {
  emit('delete', props.recipe.id);
  showDeleteConfirm.value = false;
};
</script>

