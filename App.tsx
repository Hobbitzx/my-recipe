
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, ChefHat, Download } from 'lucide-react';
import { Recipe, Category, ViewState } from './types';
import { RecipeCard } from './components/RecipeCard';
import { RecipeForm } from './components/RecipeForm';
import { RecipeDetail } from './components/RecipeDetail';
import { CategoryFilter } from './components/CategoryFilter';
import { Header } from './components/Header';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useLanguage } from './contexts/LanguageContext';
import { 
  loadRecipes, 
  saveRecipes, 
  isIndexedDBAvailable, 
  migrateFromLocalStorage,
  isMigratedFromLocalStorage,
  getStorageUsage
} from './utils/indexedDB';
import { isStandalone } from './utils/pwa';

const App: React.FC = () => {
  const { t } = useLanguage();
  
  // 检测PWA模式
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    setIsPWA(isStandalone());
  }, []);
  
  // Initialize recipes state - will be loaded from IndexedDB or localStorage
  // 初始化为空数组，新用户首次进入时没有样例数据
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [view, setView] = useState<ViewState>('HOME');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Load recipes from IndexedDB on mount
  useEffect(() => {
    const loadInitialRecipes = async () => {
      try {
        if (isIndexedDBAvailable()) {
          // 尝试从 IndexedDB 加载
          const dbRecipes = await loadRecipes();
          
          if (dbRecipes.length > 0) {
            setRecipes(dbRecipes);
            setIsLoading(false);
            return;
          }
          
          // 如果 IndexedDB 为空，尝试从 localStorage 迁移
          if (!isMigratedFromLocalStorage()) {
            const migratedRecipes = await migrateFromLocalStorage();
            if (migratedRecipes.length > 0) {
              setRecipes(migratedRecipes);
              setIsLoading(false);
              return;
            }
          }
        }
        
        // 如果 IndexedDB 不可用，回退到 localStorage
        if (typeof Storage !== 'undefined' && localStorage) {
          const saved = localStorage.getItem('morandi-recipes');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setRecipes(parsed);
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.error('Failed to parse localStorage data:', e);
            }
          }
        }
        
        // 如果没有找到任何数据，使用空数组（新用户）
        setRecipes([]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load recipes:', error);
        // 加载失败时也使用空数组
        setRecipes([]);
        setIsLoading(false);
      }
    };

    loadInitialRecipes();
  }, []);

  // Save to IndexedDB whenever recipes change
  useEffect(() => {
    // 跳过初始加载时的保存
    if (isLoading) return;

    const saveRecipesData = async () => {
      try {
        if (isIndexedDBAvailable()) {
          await saveRecipes(recipes);
          
          // 显示存储使用情况（仅当数据较大时）
          const usage = await getStorageUsage();
          if (usage.estimatedSizeMB > 1) {
            console.log(`已保存 ${usage.recipes} 个配方到 IndexedDB，大小: ${usage.estimatedSizeMB} MB`);
          }
        } else {
          // 回退到 localStorage（如果 IndexedDB 不可用）
          if (typeof Storage !== 'undefined' && localStorage) {
            const dataToSave = JSON.stringify(recipes);
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
        
        // 如果是配额错误，提供更友好的提示
        if (error?.name === 'QuotaExceededError' || error?.code === 22) {
          console.error('存储空间不足！建议：删除一些配方或使用较小的图片');
        }
        
        // 尝试回退到 localStorage
        try {
          if (typeof Storage !== 'undefined' && localStorage) {
            const dataToSave = JSON.stringify(recipes);
            localStorage.setItem('morandi-recipes', dataToSave);
            console.log('已回退到 localStorage 存储');
          }
        } catch (fallbackError) {
          console.error('回退到 localStorage 也失败:', fallbackError);
        }
      }
    };

    saveRecipesData();
  }, [recipes, isLoading]);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    }
  };

  // -- Handlers --

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('DETAIL');
  };

  const handleSaveRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => {
    try {
      if (recipeData.id) {
        // Update existing
        setRecipes(prev => prev.map(r => {
          if (r.id === recipeData.id) {
            return {
              ...r,
              ...recipeData,
              id: r.id, // 确保ID不被覆盖
              createdAt: r.createdAt, // 保持原始创建时间
            } as Recipe;
          }
          return r;
        }));
      } else {
        // Create new
        const newRecipe: Recipe = {
          ...recipeData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };
        setRecipes(prev => [newRecipe, ...prev]);
      }
      setView('HOME');
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Error saving recipe:', error);
      // 即使保存失败，也返回主页，避免用户卡在表单页面
      setView('HOME');
      setSelectedRecipe(null);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    // 如果删除的是当前选中的recipe，需要清除状态
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(null);
    }
    setView('HOME');
  };

  const handleEditClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('EDIT');
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchQuery, selectedCategory]);

  // -- Render --

  if (view === 'CREATE' || view === 'EDIT') {
    return (
      <div className="max-w-md mx-auto bg-morandi-bg shadow-2xl overflow-hidden relative" style={isPWA ? { height: '100vh', minHeight: '100vh' } : { minHeight: '100vh' }}>
        <Header 
          title={view === 'CREATE' ? t('recipeForm.newRecipe') : t('recipeForm.editRecipe')} 
          onBack={() => setView(selectedRecipe ? 'DETAIL' : 'HOME')}
        />
        <RecipeForm 
          initialRecipe={view === 'EDIT' ? selectedRecipe : null}
          onSave={handleSaveRecipe}
          onCancel={() => setView(selectedRecipe ? 'DETAIL' : 'HOME')}
        />
      </div>
    );
  }

  if (view === 'DETAIL' && selectedRecipe) {
    return (
      <div className="max-w-md mx-auto bg-morandi-surface shadow-2xl overflow-hidden relative" style={isPWA ? { height: '100vh', minHeight: '100vh' } : { minHeight: '100vh' }}>
        <RecipeDetail 
          recipe={selectedRecipe}
          onEdit={handleEditClick}
          onDelete={handleDeleteRecipe}
          onBack={() => setView('HOME')}
        />
      </div>
    );
  }

  // HOME VIEW
  return (
    <div className="max-w-md mx-auto bg-morandi-bg shadow-2xl overflow-hidden relative flex flex-col" style={isPWA ? { height: '100vh', minHeight: '100vh' } : { minHeight: '100vh' }}>
      
      {/* Top Bar */}
      <div className="bg-morandi-bg pt-4 px-4 pb-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-morandi-text">{t('home.title')}</h1>
            <p className="text-xs text-morandi-subtext">{t('home.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            {installPrompt && (
              <button 
                onClick={handleInstall}
                className="w-10 h-10 rounded-full bg-morandi-primary text-white flex items-center justify-center shadow-sm hover:bg-opacity-90 transition-all"
                title={t('home.installApp')}
              >
                <Download size={20} />
              </button>
            )}
            <LanguageSwitcher />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('home.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-3 rounded-xl shadow-sm text-sm text-morandi-text focus:ring-2 focus:ring-morandi-primary/20 outline-none transition-all placeholder-gray-300"
          />
        </div>
      </div>

      {/* Filter */}
      <CategoryFilter selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

      {/* Recipe Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
        {filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-morandi-subtext opacity-60">
            <ChefHat size={48} className="mb-2" />
            <p>{t('home.noRecipes')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onClick={handleRecipeClick} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button - Fixed to viewport */}
      <button
        onClick={() => {
          setSelectedRecipe(null);
          setView('CREATE');
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-morandi-primary text-white rounded-full shadow-lg shadow-morandi-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
        style={{
          // 确保在移动设备上也有足够的边距
          bottom: '1.5rem',
          right: '1.5rem'
        }}
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default App;
