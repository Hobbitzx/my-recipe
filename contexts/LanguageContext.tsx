/**
 * 语言上下文
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, t as translate } from '../i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  tf: (key: string, params: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'morandi-recipe-locale';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // 从 localStorage 读取保存的语言设置
    if (typeof Storage !== 'undefined' && localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'zh-CN' || saved === 'en-US') {
        return saved as Locale;
      }
    }
    // 默认使用简体中文
    return 'zh-CN';
  });

  // 保存语言设置到 localStorage
  useEffect(() => {
    if (typeof Storage !== 'undefined' && localStorage) {
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string) => translate(key, locale);
  const tf = (key: string, params: Record<string, string>) => {
    let text = translate(key, locale);
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, value);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, tf }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

