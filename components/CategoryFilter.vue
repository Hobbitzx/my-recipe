<template>
  <div class="flex overflow-x-auto no-scrollbar py-2 px-4 gap-2 sticky top-0 bg-morandi-bg z-10">
    <button
      v-for="cat in categories"
      :key="cat"
      @click="$emit('select', cat)"
      :class="[
        'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
        selectedCategory === cat
          ? 'bg-morandi-primary text-white shadow-md'
          : 'bg-morandi-surface text-morandi-text border border-morandi-border shadow-sm hover:bg-gray-50'
      ]"
    >
      {{ getCategoryName(cat) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Category } from '../types';
import { useLanguage } from '../composables/useLanguage';

interface Props {
  selectedCategory: Category | 'All';
}

const props = defineProps<Props>();
defineEmits<{
  select: [category: Category | 'All'];
}>();

const { t } = useLanguage();

const categories = computed(() => [
  'All',
  ...Object.values(Category).filter(c => c !== Category.ALL)
]);

const categoryMap: Record<string, string> = {
  'All': 'categories.all',
  [Category.QUICK_BREAKFAST]: 'categories.quickBreakfast',
  [Category.COLD_DISHES]: 'categories.coldDishes',
  [Category.MEAT_MAIN]: 'categories.meatMain',
  [Category.RICE_NOODLES]: 'categories.riceNoodles',
  [Category.SOUP]: 'categories.soup',
  [Category.VEGETABLE_STIR]: 'categories.vegetableStir',
  [Category.DESSERT]: 'categories.dessert',
  [Category.DRINKS]: 'categories.drinks',
};

const getCategoryName = (cat: string) => {
  return t(categoryMap[cat] || cat);
};
</script>

