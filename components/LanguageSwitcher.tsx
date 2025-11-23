/**
 * 语言切换组件
 */
import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getSupportedLocales, getLocaleName } from '../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const supportedLocales = getSupportedLocales();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-morandi-surface border border-morandi-border flex items-center justify-center text-morandi-primary shadow-sm hover:bg-gray-50 transition-colors"
        title={getLocaleName(locale)}
      >
        <Globe size={20} />
      </button>

      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 语言选择菜单 */}
          <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-morandi-border overflow-hidden min-w-[140px]">
            {supportedLocales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm transition-colors
                  ${locale === loc
                    ? 'bg-morandi-primary text-white'
                    : 'text-morandi-text hover:bg-gray-50'
                  }
                `}
              >
                {getLocaleName(loc)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

