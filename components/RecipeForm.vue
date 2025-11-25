<template>
  <div class="pb-24 bg-morandi-bg min-h-full">
    <!-- Image Upload Section -->
    <div 
      class="relative w-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer group aspect-4-3"
      @click="!isCompressing && fileInputRef?.click()"
    >
      <div v-if="isCompressing" class="flex flex-col items-center text-morandi-primary">
        <Loader2 :size="48" class="mb-2 opacity-50 animate-spin" />
        <span class="text-sm font-medium opacity-70">{{ t('recipeForm.compressing') }}</span>
      </div>
      <img v-else-if="image" :src="image" alt="Preview" class="w-full h-full object-cover" />
      <div v-else class="flex flex-col items-center text-morandi-primary">
        <Camera :size="48" class="mb-2 opacity-50" />
        <span class="text-sm font-medium opacity-70">{{ t('recipeForm.addCoverPhoto') }}</span>
      </div>
      <div v-if="!isCompressing" class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      <input 
        ref="fileInputRef"
        type="file" 
        accept="image/*" 
        class="hidden" 
        @change="handleImageUpload"
        :disabled="isCompressing"
      />
    </div>

    <div class="px-6 -mt-6 relative z-10">
      <div class="bg-morandi-surface rounded-t-3xl shadow-lg p-6 space-y-6">
        
        <!-- Basic Info -->
        <div class="space-y-4">
          <input
            type="text"
            :placeholder="t('recipeForm.recipeTitle')"
            v-model="title"
            class="w-full text-2xl font-serif font-bold text-morandi-text placeholder-gray-300 border-b border-transparent focus:border-morandi-primary focus:outline-none bg-transparent transition-all"
          />
          
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-xs font-bold text-morandi-subtext uppercase mb-1 tracking-wider">{{ t('recipeForm.category') }}</label>
              <select 
                v-model="category"
                class="w-full p-2 rounded-lg bg-morandi-bg text-morandi-text text-sm border-none focus:ring-1 focus:ring-morandi-primary outline-none"
              >
                <option v-for="c in categories" :key="c" :value="c">{{ getCategoryName(c) }}</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-morandi-subtext uppercase mb-1 tracking-wider">{{ t('recipeForm.time') }}</label>
              <div class="relative flex items-center">
                <Clock :size="16" class="absolute left-2.5 top-2.5 text-morandi-accent z-10" />
                <input 
                  type="text" 
                  v-model="prepTime"
                  :placeholder="t('recipeForm.timePlaceholder')"
                  class="w-full p-2 pl-9 pr-12 rounded-lg bg-morandi-bg text-morandi-text text-sm border-none focus:ring-1 focus:ring-morandi-primary outline-none"
                />
                <span class="absolute right-3 text-morandi-subtext text-sm pointer-events-none">{{ t('recipeForm.timeUnit') }}</span>
              </div>
            </div>
          </div>

          <textarea
            :placeholder="t('recipeForm.descriptionPlaceholder')"
            v-model="description"
            @input="autoResizeTextarea($event.target as HTMLTextAreaElement)"
            rows="3"
            class="w-full p-3 rounded-lg bg-morandi-bg text-morandi-text text-sm resize-none focus:ring-1 focus:ring-morandi-primary outline-none resize-none overflow-hidden"
          />
        </div>

        <!-- Ingredients -->
        <div>
          <h3 class="text-lg font-semibold text-morandi-text mb-3">{{ t('recipeForm.ingredients') }}</h3>
          <div class="space-y-2">
            <div v-for="ing in ingredients" :key="ing.id" class="flex gap-2 items-center animate-fade-in">
              <div class="w-1.5 h-1.5 rounded-full bg-morandi-secondary flex-shrink-0" />
              <input
                :ref="el => setIngredientInputRef(el, ing.id)"
                type="text"
                :value="ing.text"
                @input="handleIngredientChange(ing.id, ($event.target as HTMLInputElement).value)"
                :placeholder="t('recipeForm.ingredientPlaceholder')"
                class="flex-grow p-2 bg-transparent border-b border-morandi-border focus:border-morandi-primary focus:outline-none text-sm text-morandi-text"
              />
              <button @click="removeIngredient(ing.id)" class="text-gray-300 hover:text-red-400">
                <X :size="18" />
              </button>
            </div>
          </div>
          <button 
            @click="handleAddIngredient"
            class="mt-3 text-sm font-medium text-morandi-primary hover:text-morandi-text flex items-center gap-1"
          >
            <Plus :size="16" /> {{ t('recipeForm.addIngredient') }}
          </button>
        </div>

        <!-- Steps -->
        <div>
          <h3 class="text-lg font-semibold text-morandi-text mb-3">{{ t('recipeForm.instructions') }}</h3>
          <div class="space-y-4">
            <div v-for="(step, index) in steps" :key="step.id" class="flex gap-3 animate-fade-in">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-morandi-secondary/50 text-morandi-text text-xs font-bold flex items-center justify-center mt-1">
                {{ index + 1 }}
              </div>
              <textarea
                :ref="el => setStepInputRef(el, step.id)"
                :value="step.text"
                @input="handleStepChange(step.id, $event.target as HTMLTextAreaElement)"
                :placeholder="t('recipeForm.stepPlaceholder')"
                rows="2"
                class="flex-grow p-2 bg-morandi-bg/50 rounded-lg text-sm text-morandi-text focus:bg-white focus:ring-1 focus:ring-morandi-primary outline-none transition-colors resize-none overflow-hidden"
              />
              <button @click="removeStep(step.id)" class="text-gray-300 hover:text-red-400 self-start mt-2">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
          <button 
            @click="handleAddStep"
            class="mt-3 text-sm font-medium text-morandi-primary hover:text-morandi-text flex items-center gap-1"
          >
            <Plus :size="16" /> {{ t('recipeForm.addStep') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { Camera, Plus, X, Clock, Trash2, Loader2 } from 'lucide-vue-next';
import { Recipe, Category, Ingredient, Step } from '../types';
import { compressImage, needsCompression, getImageSizeKB } from '../utils/imageCompress';
import { useLanguage } from '../composables/useLanguage';
import { getCategoryName } from '../composables/useCategory';

interface Props {
  initialRecipe?: Recipe | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  save: [recipe: Omit<Recipe, 'id' | 'createdAt'> & { id?: string; createdAt?: number }];
  cancel: [];
}>();

const { t } = useLanguage();
const fileInputRef = ref<HTMLInputElement | null>(null);
const ingredientInputRefs = ref<Record<string, HTMLInputElement | null>>({});
const stepInputRefs = ref<Record<string, HTMLTextAreaElement | null>>({});

// 缺省图片路径 - 使用 public 文件夹，路径固定不会被 hash
const defaultImage = `${import.meta.env.BASE_URL}default-recipe-image.jpg`

const title = ref(props.initialRecipe?.title || '');
const description = ref(props.initialRecipe?.description || '');
const category = ref<Category>(props.initialRecipe?.category || Category.QUICK_BREAKFAST);
const image = ref(props.initialRecipe?.image || '');
const prepTime = ref(props.initialRecipe?.prepTime || '');
const isCompressing = ref(false);

const ingredients = ref<Ingredient[]>(
  props.initialRecipe?.ingredients || [{ id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '' }]
);

const steps = ref<Step[]>(
  props.initialRecipe?.steps || [{ id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '' }]
);

const categories = computed(() => Object.values(Category).filter(c => c !== 'All'));

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert(t('errors.imageCompressFailed'));
    return;
  }

  if (needsCompression(file, 800)) {
    isCompressing.value = true;
    try {
      const originalSizeKB = getImageSizeKB(file);
      console.log(`原始图片大小: ${originalSizeKB.toFixed(2)} KB，开始高质量压缩...`);
      
      const compressedImage = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.95,
        maxSizeKB: 800,
        preserveFormat: true,
        lossless: false
      });
      
      const compressedSizeKB = (compressedImage.length * 3) / 4 / 1024;
      const compressionRatio = ((1 - compressedSizeKB / originalSizeKB) * 100).toFixed(1);
      console.log(`压缩后大小: ${compressedSizeKB.toFixed(2)} KB (压缩率: ${compressionRatio}%)`);
      
      image.value = compressedImage;
    } catch (error) {
      console.error('图片压缩失败:', error);
      alert(t('errors.imageCompressFailed'));
      const reader = new FileReader();
      reader.onloadend = () => {
        image.value = reader.result as string;
      };
      reader.readAsDataURL(file);
    } finally {
      isCompressing.value = false;
    }
  } else {
    const reader = new FileReader();
    reader.onloadend = () => {
      image.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const setIngredientInputRef = (el: HTMLInputElement | null, id: string) => {
  if (el) {
    ingredientInputRefs.value[id] = el;
  } else {
    delete ingredientInputRefs.value[id];
  }
};

const setStepInputRef = (el: HTMLTextAreaElement | null, id: string) => {
  if (el) {
    stepInputRefs.value[id] = el;
  } else {
    delete stepInputRefs.value[id];
  }
};

const handleAddIngredient = async () => {
  const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; 
  ingredients.value.push({ id: newId, text: '' });
  // 等待DOM更新后聚焦到新添加的输入框
  await nextTick();
  const newInput = ingredientInputRefs.value[newId];
  if (newInput) {
    newInput.focus();
  }
};

const handleIngredientChange = (id: string, text: string) => {
  const index = ingredients.value.findIndex(i => i.id === id);
  if (index !== -1) {
    ingredients.value[index].text = text;
  }
};

const removeIngredient = (id: string) => {
  if (ingredients.value.length > 1) {
    ingredients.value = ingredients.value.filter(i => i.id !== id);
  }
};

const handleAddStep = async () => {
  const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  steps.value.push({ id: newId, text: '' });
  // 等到DOM更新后聚焦到新添加的输入框
  await nextTick();
  const newInput = stepInputRefs.value[newId];
  if (newInput) {
    newInput.focus();
  }
};

const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

const handleStepChange = (id: string, textarea: HTMLTextAreaElement) => {
  const index = steps.value.findIndex(s => s.id === id);
  if (index !== -1) {
    steps.value[index].text = textarea.value;
  }
  if (textarea) {
    autoResizeTextarea(textarea);
  }
};

const removeStep = (id: string) => {
  if (steps.value.length > 1) {
    steps.value = steps.value.filter(s => s.id !== id);
  }
};

const handleSubmit = (e?: Event) => {
  if (e) {
  e.preventDefault();
  }
  
  if (!title.value.trim()) {
    const titleInput = document.querySelector(`input[placeholder="${t('recipeForm.recipeTitle')}"]`) as HTMLInputElement;
    if (titleInput) {
      titleInput.focus();
      titleInput.style.borderBottomColor = '#ef4444';
      setTimeout(() => {
        titleInput.style.borderBottomColor = '';
      }, 2000);
    }
    return;
  }
  
  const filteredIngredients = ingredients.value.filter(i => i.text.trim() !== '');
  const filteredSteps = steps.value.filter(s => s.text.trim() !== '');
  
  if (filteredIngredients.length === 0) {
    const firstIngredientInput = document.querySelector(`input[placeholder="${t('recipeForm.ingredientPlaceholder')}"]`) as HTMLInputElement;
    if (firstIngredientInput) {
      firstIngredientInput.focus();
    }
    return;
  }
  
  if (filteredSteps.length === 0) {
    const firstStepTextarea = document.querySelector(`textarea[placeholder="${t('recipeForm.stepPlaceholder')}"]`) as HTMLTextAreaElement;
    if (firstStepTextarea) {
      firstStepTextarea.focus();
    }
    return;
  }
  
  emit('save', {
    ...(props.initialRecipe ? { id: props.initialRecipe.id, createdAt: props.initialRecipe.createdAt } : {}),
    title: title.value,
    description: description.value,
    category: category.value,
    image: image.value || defaultImage,
    prepTime: prepTime.value || '10',
    ingredients: filteredIngredients,
    steps: filteredSteps
  });
};

defineExpose({
  submit: handleSubmit
})

// 初始化所有有内容的textarea高度
onMounted(() => {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    if (textarea.value.trim() !== '') {
      autoResizeTextarea(textarea as HTMLTextAreaElement);
    }
  });
});
</script>

