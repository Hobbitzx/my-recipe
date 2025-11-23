import React from 'react';
import { Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoryFilterProps {
  selectedCategory: Category | 'All';
  onSelect: (category: Category | 'All') => void;
}

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

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelect }) => {
  const { t } = useLanguage();
  const categories = [
    'All',
    ...Object.values(Category).filter(c => c !== 'All')
  ];

  return (
    <div className="flex overflow-x-auto no-scrollbar py-2 px-4 gap-2 sticky top-0 bg-morandi-bg z-10">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat as Category | 'All')}
          className={`
            whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300
            ${selectedCategory === cat 
              ? 'bg-morandi-primary text-white shadow-md' 
              : 'bg-morandi-surface text-morandi-text border border-morandi-border shadow-sm hover:bg-gray-50'}
          `}
        >
          {t(categoryMap[cat] || cat)}
        </button>
      ))}
    </div>
  );
};