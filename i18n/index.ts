/**
 * 国际化配置和工具
 */
import { zhCN } from './locales/zh-CN';
import { enUS } from './locales/en-US';

export type Locale = 'zh-CN' | 'en-US';
export type TranslationKey = keyof typeof zhCN;

const translations = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

/**
 * 获取翻译文本
 */
export function t(key: string, locale: Locale = 'zh-CN'): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果找不到翻译，尝试从默认语言获取
      value = translations['zh-CN'];
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key; // 如果都找不到，返回 key
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * 格式化翻译文本（支持占位符）
 */
export function tf(key: string, params: Record<string, string>, locale: Locale = 'zh-CN'): string {
  let text = t(key, locale);
  Object.entries(params).forEach(([param, value]) => {
    text = text.replace(`{${param}}`, value);
  });
  return text;
}

/**
 * 获取所有支持的语言
 */
export function getSupportedLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

/**
 * 获取语言显示名称
 */
export function getLocaleName(locale: Locale): string {
  const names: Record<Locale, string> = {
    'zh-CN': '简体中文',
    'en-US': 'English',
  };
  return names[locale] || locale;
}

