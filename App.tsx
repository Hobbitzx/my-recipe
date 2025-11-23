
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, ChefHat, Download } from 'lucide-react';
import { Recipe, Category, ViewState } from './types';
import { INITIAL_RECIPES } from './constants';
import { RecipeCard } from './components/RecipeCard';
import { RecipeForm } from './components/RecipeForm';
import { RecipeDetail } from './components/RecipeDetail';
import { CategoryFilter } from './components/CategoryFilter';
import { Header } from './components/Header';

const App: React.FC = () => {
  // Initialize from LocalStorage or fall back to constants
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('morandi-recipes');
      return saved ? JSON.parse(saved) : INITIAL_RECIPES;
    } catch (e) {
      return INITIAL_RECIPES;
    }
  });

  const [view, setView] = useState<ViewState>('HOME');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Save to LocalStorage whenever recipes change
  useEffect(() => {
    localStorage.setItem('morandi-recipes', JSON.stringify(recipes));
  }, [recipes]);

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
    if (recipeData.id) {
      // Update existing
      setRecipes(prev => prev.map(r => r.id === recipeData.id ? { ...r, ...recipeData } as Recipe : r));
    } else {
      // Create new
      const newRecipe: Recipe = {
        ...recipeData,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      setRecipes(prev => [newRecipe, ...prev]);
    }
    setView('HOME');
    setSelectedRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setView('HOME');
    setSelectedRecipe(null);
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
      <div className="max-w-md mx-auto bg-morandi-bg min-h-screen shadow-2xl overflow-hidden relative">
        <Header 
          title={view === 'CREATE' ? 'New Recipe' : 'Edit Recipe'} 
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
      <div className="max-w-md mx-auto bg-morandi-surface min-h-screen shadow-2xl overflow-hidden relative">
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
    <div className="max-w-md mx-auto bg-morandi-bg min-h-screen shadow-2xl overflow-hidden relative flex flex-col">
      
      {/* Top Bar */}
      <div className="bg-morandi-bg pt-4 px-4 pb-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-morandi-text">My Recipes</h1>
            <p className="text-xs text-morandi-subtext">What are we cooking today?</p>
          </div>
          <div className="flex gap-2">
            {installPrompt && (
              <button 
                onClick={handleInstall}
                className="w-10 h-10 rounded-full bg-morandi-primary text-white flex items-center justify-center shadow-sm hover:bg-opacity-90 transition-all"
                title="Install App"
              >
                <Download size={20} />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-morandi-surface border border-morandi-border flex items-center justify-center text-morandi-primary shadow-sm">
              <ChefHat size={20} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search recipes..."
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
            <p>No recipes found.</p>
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

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setSelectedRecipe(null);
          setView('CREATE');
        }}
        className="absolute bottom-6 right-6 w-14 h-14 bg-morandi-primary text-white rounded-full shadow-lg shadow-morandi-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default App;
