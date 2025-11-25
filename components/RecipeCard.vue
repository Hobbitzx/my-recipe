<template>
  <div 
    @click="$emit('click', recipe)"
    class="bg-morandi-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer flex flex-col h-full"
  >
    <div class="relative h-32 w-full overflow-hidden bg-gray-200">
      <img 
        :src="recipe.image" 
        :alt="recipe.title" 
        class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
        loading="lazy"
      />
      <div class="absolute bottom-2 right-2 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-xs font-medium text-morandi-text flex items-center gap-1 shadow-sm">
        <Clock :size="12" />
        {{ recipe.prepTime }} {{ t('recipeForm.timeUnit') }}
      </div>
    </div>
    
    <div class="p-3 flex flex-col flex-grow">
      <div class="mb-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-morandi-primary bg-morandi-primary/10 px-1.5 py-0.5 rounded">
          {{ recipe.category }}
        </span>
      </div>
      <h3 class="font-semibold text-morandi-text text-sm leading-tight mb-1 line-clamp-2">
        {{ recipe.title }}
      </h3>
      <p class="text-morandi-subtext text-xs line-clamp-2 mt-auto">
        {{ recipe.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock } from 'lucide-vue-next';
import { Recipe } from '../types';
import { useLanguage } from '../composables/useLanguage';

interface Props {
  recipe: Recipe;
}

defineProps<Props>();
defineEmits<{
  click: [recipe: Recipe];
}>();

const { t } = useLanguage();
</script>

