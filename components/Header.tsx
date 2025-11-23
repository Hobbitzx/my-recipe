import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  return (
    <div className="sticky top-0 z-20 bg-morandi-bg/95 backdrop-blur-sm px-4 h-14 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-morandi-primary/10 text-morandi-text transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-semibold text-morandi-text tracking-wide truncate max-w-[200px] sm:max-w-md">
          {title}
        </h1>
      </div>
      <div>
        {rightAction}
      </div>
    </div>
  );
};