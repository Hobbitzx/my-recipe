import React, { useState, useEffect } from 'react';
import { Clock, Edit2, Trash2, CheckCircle2, ChefHat, ArrowLeft } from 'lucide-react';
import { Recipe } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { isStandalone } from '../utils/pwa';

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onEdit, onDelete, onBack }) => {
  const { t, tf } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    setIsPWA(isStandalone());
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(recipe.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-morandi-surface flex flex-col relative" style={isPWA ? { height: '100vh', minHeight: '100vh' } : { minHeight: '100vh' }}>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
           <div 
             className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl transform transition-all" 
             onClick={e => e.stopPropagation()}
           >
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('recipeDetail.deleteConfirm')}</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {tf('recipeDetail.deleteMessage', { title: recipe.title })}
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
                  >
                    {t('common.delete')}
                  </button>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Custom Sticky Header for Image */}
      <div className="relative h-80 w-full shrink-0">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        {/* Darker gradient for better button visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30">
          <button 
            onClick={onBack}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(recipe)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <Edit2 size={20} />
            </button>
            <button 
              onClick={handleDeleteClick}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-red-100 hover:bg-red-500 hover:text-white transition-colors group"
              title={t('recipeDetail.deleteRecipe')}
            >
              <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="-mt-10 relative z-10 bg-morandi-surface rounded-t-[2rem] px-6 pt-8 pb-24 flex-grow shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-block px-3 py-1 bg-morandi-secondary/20 text-morandi-text text-xs font-bold uppercase tracking-widest rounded-full mb-3">
            {recipe.category}
          </div>
          <h1 className="text-3xl font-serif font-bold text-morandi-text mb-2">{recipe.title}</h1>
          <div className="flex items-center text-morandi-subtext text-sm font-medium gap-2">
            <Clock size={16} />
            <span>{recipe.prepTime}</span>
          </div>
        </div>

        <div className="prose prose-sm prose-stone max-w-none mb-8 text-center text-morandi-text/80">
          <p>{recipe.description}</p>
        </div>

        {/* Ingredients Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-morandi-primary/10 p-2 rounded-lg text-morandi-primary">
              <ChefHat size={20} />
            </div>
            <h2 className="text-xl font-semibold text-morandi-text">{t('recipeDetail.ingredients')}</h2>
            <span className="text-xs text-morandi-subtext bg-morandi-bg px-2 py-1 rounded-full ml-auto">
              {recipe.ingredients.length} {t('recipeDetail.items')}
            </span>
          </div>
          
          <div className="bg-morandi-bg rounded-2xl p-5 space-y-3">
            {recipe.ingredients.map((ing) => (
              <div key={ing.id} className="flex items-start gap-3">
                <div className="mt-1 w-4 h-4 rounded-full border-2 border-morandi-border shrink-0" />
                <span className="text-morandi-text font-medium">{ing.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-morandi-secondary/20 p-2 rounded-lg text-morandi-text">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-xl font-semibold text-morandi-text">{t('recipeDetail.directions')}</h2>
          </div>
          
          <div className="space-y-6 pl-2">
            {recipe.steps.map((step, index) => (
              <div key={step.id} className="relative pl-8 pb-2 border-l-2 border-morandi-border last:border-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-morandi-secondary border-2 border-white shadow-sm" />
                <h3 className="text-xs font-bold text-morandi-primary uppercase mb-1 tracking-wide">{t('recipeDetail.step')} {index + 1}</h3>
                <p className="text-morandi-text leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};