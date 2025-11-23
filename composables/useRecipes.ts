/**
 * 食谱状态管理组合式函数
 */
import { ref, watch } from 'vue';
import { Recipe } from '../types';
import {
  loadRecipes,
  saveRecipes,
  isIndexedDBAvailable,
  migrateFromLocalStorage,
  isMigratedFromLocalStorage,
  getStorageUsage,
} from '../utils/indexedDB';

// 全局状态（单例）
const recipes = ref<Recipe[]>([]);
const isLoading = ref(true);
let isInitialized = false;

// 加载初始数据
const loadInitialRecipes = async () => {
    try {
      if (isIndexedDBAvailable()) {
        const dbRecipes = await loadRecipes();

        if (dbRecipes.length > 0) {
          recipes.value = dbRecipes;
          isLoading.value = false;
          return;
        }

        if (!isMigratedFromLocalStorage()) {
          const migratedRecipes = await migrateFromLocalStorage();
          if (migratedRecipes.length > 0) {
            recipes.value = migratedRecipes;
            isLoading.value = false;
            return;
          }
        }
      }

      if (typeof Storage !== 'undefined' && localStorage) {
        const saved = localStorage.getItem('morandi-recipes');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              recipes.value = parsed;
              isLoading.value = false;
              return;
            }
          } catch (e) {
            console.error('Failed to parse localStorage data:', e);
          }
        }
      }

      recipes.value = [];
      isLoading.value = false;
    } catch (error) {
      console.error('Failed to load recipes:', error);
      recipes.value = [];
      isLoading.value = false;
    }
};

// 保存数据到 IndexedDB
watch(recipes, async (newRecipes) => {
  if (isLoading.value) return;

  try {
    if (isIndexedDBAvailable()) {
      await saveRecipes(newRecipes);

      const usage = await getStorageUsage();
      if (usage.estimatedSizeMB > 1) {
        console.log(`已保存 ${usage.recipes} 个配方到 IndexedDB，大小: ${usage.estimatedSizeMB} MB`);
      }
    } else {
      if (typeof Storage !== 'undefined' && localStorage) {
        const dataToSave = JSON.stringify(newRecipes);
        const sizeMB = dataToSave.length / 1024 / 1024;

        if (sizeMB > 4) {
          console.warn(`Recipe data is too large (${sizeMB.toFixed(2)} MB) to save to localStorage. Max size: 4 MB`);
          console.warn('建议：使用支持 IndexedDB 的浏览器');
        }

        localStorage.setItem('morandi-recipes', dataToSave);
      }
    }
  } catch (error: any) {
    console.error('Failed to save recipes:', error);

    if (error?.name === 'QuotaExceededError' || error?.code === 22) {
      console.error('存储空间不足！建议：删除一些配方或使用较小的图片');
    }

    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        const dataToSave = JSON.stringify(newRecipes);
        localStorage.setItem('morandi-recipes', dataToSave);
        console.log('已回退到 localStorage 存储');
      }
    } catch (fallbackError) {
      console.error('回退到 localStorage 也失败:', fallbackError);
    }
  }
}, { deep: true });

// 使用食谱组合式函数
export function useRecipes() {
  // 初始化加载（只执行一次）
  if (!isInitialized) {
    isInitialized = true;
    loadInitialRecipes();
  }

  const getRecipeById = (id: string): Recipe | undefined => {
    return recipes.value.find(r => r.id === id);
  };

  const saveRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => {
    if (recipeData.id) {
      // Update existing
      recipes.value = recipes.value.map(r => {
        if (r.id === recipeData.id) {
          return {
            ...r,
            ...recipeData,
            id: r.id,
            createdAt: r.createdAt,
          } as Recipe;
        }
        return r;
      });
    } else {
      // Create new
      const newRecipe: Recipe = {
        ...recipeData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };
      recipes.value = [newRecipe, ...recipes.value];
    }
  };

  const deleteRecipe = (id: string) => {
    recipes.value = recipes.value.filter(r => r.id !== id);
  };

  return {
    recipes,
    isLoading,
    getRecipeById,
    saveRecipe,
    deleteRecipe,
  };
}

