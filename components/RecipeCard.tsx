import React from 'react';
import { Clock } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-morandi-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-32 w-full overflow-hidden bg-gray-200">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-xs font-medium text-morandi-text flex items-center gap-1 shadow-sm">
          <Clock size={12} />
          {recipe.prepTime}
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <div className="mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-morandi-primary bg-morandi-primary/10 px-1.5 py-0.5 rounded">
            {recipe.category}
          </span>
        </div>
        <h3 className="font-semibold text-morandi-text text-sm leading-tight mb-1 line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-morandi-subtext text-xs line-clamp-2 mt-auto">
          {recipe.description}
        </p>
      </div>
    </div>
  );
};