import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  selectedCategory: Category | 'All';
  onSelect: (category: Category | 'All') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelect }) => {
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
          {cat}
        </button>
      ))}
    </div>
  );
};