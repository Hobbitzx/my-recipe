/**
 * 食谱状态管理组合式函数
 */
import { ref } from 'vue';
import { Recipe } from '../types';
import {
  loadRecipes,
  saveRecipeToDB,
  deleteRecipeFromDB,
  isIndexedDBAvailable,
  migrateFromLocalStorage,
  isMigratedFromLocalStorage
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

/**
 * 保存到存储（IndexedDB 或 localStorage）
 */
async function saveToStorage(recipe: Recipe): Promise<void> {
  try {
    if (isIndexedDBAvailable()) {
      await saveRecipeToDB(recipe);
    } else if (typeof Storage !== 'undefined' && localStorage) {
      // localStorage 降级： 需要全量保存
      const allRecipes = recipes.value;
      const dataToSave = JSON.stringify(allRecipes);
      const sizeMB = dataToSave.length / 1024 / 1024;

      if (sizeMB > 4) {
        console.warn(`Recipe data is too large (${sizeMB.toFixed(2)} MB) to save to localStorage. Max size: 4 MB`);
        console.warn('建议：使用支持 IndexedDB 的浏览器');
      }

      localStorage.setItem('morandi-recipes', dataToSave);
    }
  } catch (error: any) {
    console.error('Failed to save recipes:', error);

    if (error?.name === 'QuotaExceededError' || error?.code === 22) {
      console.error('存储空间不足！建议：删除一些配方或使用较小的图片');
    }

    // 降级到localStorage
    if (typeof Storage !== 'undefined' && localStorage) {
      try {
        localStorage.setItem('morandi-recipes', JSON.stringify(recipes.value));
        console.log('已回退到 localStorage 存储');
      } catch (fallbackError) {
        console.error('回退到 localStorage 存储失败:', fallbackError);
      }
    }
  }
}

/**
 * 从存储中删除
 */
async function deleteFromStorage(id: string): Promise<void> {
  try {
    if (isIndexedDBAvailable()) {
      await deleteRecipeFromDB(id);
    } else if (typeof Storage !== 'undefined' && localStorage) {
      // localStorage降级：需要全量保存
      const allRecipes = recipes.value;
      localStorage.setItem('morandi-recipes', JSON.stringify(allRecipes));
    }
  } catch (error) {
    console.error('删除配方失败：', error);
    // 降级到localStorage
    if (typeof Storage !== 'undefined' && localStorage) {
      try {
        localStorage.setItem('morandi-recipes', JSON.stringify(recipes.value));
      } catch (fallbackError) {
        console.error('回退到 localStorage 存储失败:', fallbackError);
      }
    }
  }
}

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

  const saveRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => {
    let recipe: Recipe;
    let oldRecipe: Recipe | undefined;
    let oldIndex: number = -1;
    let isNewRecipe = false

    // 保存旧状态，用于回滚
    if (recipeData.id) {
      // 更新现有食谱
      const index = recipes.value.findIndex(r => r.id === recipeData.id);
      if (index === -1) {
        throw new Error('找不到要更新的食谱');
      }
      oldIndex = index
      oldRecipe = { ...recipes.value[index] }; // 深拷贝旧数据

      recipe = {
        ...recipes.value[index],
        ...recipeData,
        id: recipes.value[index].id,
        createdAt: recipes.value[index].createdAt,
      } as Recipe;
      // 先更新内存（乐观更新）
      recipes.value[index] = recipe;
    } else {
      // 创建新食谱
      isNewRecipe = true;
      recipe = {
        ...recipeData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };
      // 先更新内存（乐观更新）
      recipes.value = [recipe, ...recipes.value];
    }

    try {
      // 保存到数据库
      await saveToStorage(recipe);
      return recipe.id;
    } catch (error) {
      // 数据库保存失败，回滚内存状态
      if (isNewRecipe) {
        // 回滚：移除新添加的食谱
        recipes.value = recipes.value.filter(r => r.id !== recipe.id);
      } else if (oldRecipe && oldIndex !== -1) {
        // 回滚：恢复旧数据
        recipes.value[oldIndex] = oldRecipe;
      }
      // 重新抛出错误，让调用者知道保存失败
      throw error;
    }
  };

  const deleteRecipe = async (id: string) => {
    const index = recipes.value.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('找不到要删除的食谱');
    }

    // 保存被删除的食谱，用于回滚
    const deletedRecipe = { ...recipes.value[index] };

    // 先从内存中删除（乐观更新）
    recipes.value = recipes.value.filter(r => r.id !== id);

    try {
      // 从数据库中删除
      await deleteFromStorage(id);
    }catch (error) {
      // 数据库删除失败，回滚内存状态
      // 恢复被删除的食谱到原位置
      recipes.value.splice(index, 0, deletedRecipe);
      // 重新抛出错误，让调用者知道删除失败
      throw error;
    }
  };

  return { recipes, isLoading, getRecipeById, saveRecipe, deleteRecipe };
}
