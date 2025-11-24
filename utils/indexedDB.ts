/**
 * IndexedDB 存储工具
 * 用于存储配方数据，支持更大的存储空间（适合移动设备）
 */

import { Recipe } from '../types';

const DB_NAME = 'morandi-recipe-db';
const DB_VERSION = 1;
const STORE_NAME = 'recipes';

let dbInstance: IDBDatabase | null = null;

/**
 * 打开 IndexedDB 数据库
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // 如果已经打开，直接返回
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB 打开失败:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // 如果对象存储不存在，创建它
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * 序列化食谱（移除Vue响应式代理）
 */
function serializeRecipe(recipe: Recipe): Recipe {
  return JSON.parse(JSON.stringify(recipe)) as Recipe;
}

/**
 * 保存单个食谱到IndexedDB（新增或更新）
 */
export async function saveRecipeToDB(recipe: Recipe): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const serialized = serializeRecipe(recipe);
    
    return new Promise<void>((resolve, reject) => {
      const request = store.put(serialized); // put会自动判断是新增还是更新
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('保存单个配方到 IndexedDB 失败:', error);
    throw error;
  }
}

/**
 * 从IndexedDB删除单个食谱
 */
export async function deleteRecipeFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('从 IndexedDB 删除配方失败:', error);
    throw error;
  }
}
/**
 * 保存所有配方到 IndexedDB（全量替换，用于迁移等场景）
 */
export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // 先清空现有数据
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // 批量添加新数据
    const operations = recipes.map(recipe => {
      const serialized = serializeRecipe(recipe);
      return new Promise<void>((resolve, reject) => {
        const request = store.add(serialized);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(operations);
    console.log(`已保存 ${recipes.length} 个配方到 IndexedDB`);
  } catch (error) {
    console.error('保存配方到 IndexedDB 失败:', error);
    throw error;
  }
}

/**
 * 从 IndexedDB 加载所有配方
 */
export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise<Recipe[]>((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const recipes = request.result as Recipe[];
        console.log(`从 IndexedDB 加载了 ${recipes.length} 个配方`);
        resolve(recipes);
      };
      
      request.onerror = () => {
        console.error('从 IndexedDB 加载配方失败:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('加载配方失败:', error);
    return [];
  }
}

/**
 * 检查 IndexedDB 是否可用
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

/**
 * 从 localStorage 迁移数据到 IndexedDB
 */
export async function migrateFromLocalStorage(): Promise<Recipe[]> {
  try {
    if (typeof Storage === 'undefined' || !localStorage) {
      return [];
    }

    const saved = localStorage.getItem('morandi-recipes');
    if (!saved) {
      return [];
    }

    const recipes = JSON.parse(saved) as Recipe[];
    if (!Array.isArray(recipes) || recipes.length === 0) {
      return [];
    }

    // 迁移到 IndexedDB
    await saveRecipes(recipes);
    
    // 迁移成功后，可以选择保留或删除 localStorage 数据
    // 这里我们保留作为备份，但标记已迁移
    localStorage.setItem('morandi-recipes-migrated', 'true');
    
    console.log(`已从 localStorage 迁移 ${recipes.length} 个配方到 IndexedDB`);
    return recipes;
  } catch (error) {
    console.error('从 localStorage 迁移数据失败:', error);
    return [];
  }
}

/**
 * 检查是否已从 localStorage 迁移
 */
export function isMigratedFromLocalStorage(): boolean {
  if (typeof Storage === 'undefined' || !localStorage) {
    return false;
  }
  return localStorage.getItem('morandi-recipes-migrated') === 'true';
}

/**
 * 获取存储使用情况（估算）
 */
export async function getStorageUsage(): Promise<{ recipes: number; estimatedSizeMB: number }> {
  try {
    const recipes = await loadRecipes();
    const dataString = JSON.stringify(recipes);
    const sizeMB = dataString.length / 1024 / 1024;
    
    return {
      recipes: recipes.length,
      estimatedSizeMB: parseFloat(sizeMB.toFixed(2))
    };
  } catch (error) {
    console.error('获取存储使用情况失败:', error);
    return { recipes: 0, estimatedSizeMB: 0 };
  }
}

