/**
 * 语言组合式函数（Vue 3）
 */
import { ref, computed, watch } from 'vue';
import { Locale, t as translate, getSupportedLocales, getLocaleName } from '../i18n';

const STORAGE_KEY = 'morandi-recipe-locale';

// 全局语言状态
const getInitialLocale = (): Locale => {
  if (typeof Storage !== 'undefined' && localStorage) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh-CN' || saved === 'en-US') {
      return saved as Locale;
    }
  }
  return 'zh-CN';
};

const locale = ref<Locale>(getInitialLocale());

// 保存语言设置到 localStorage
watch(locale, (newLocale) => {
  if (typeof Storage !== 'undefined' && localStorage) {
    localStorage.setItem(STORAGE_KEY, newLocale);
  }
});

// 使用语言组合式函数
export function useLanguage() {
  const setLocale = (newLocale: Locale): void => {
    locale.value = newLocale;
  };

  const t = (key: string) => translate(key, locale.value);
  const tf = (key: string, params: Record<string, string>) => {
    let text = translate(key, locale.value);
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, value);
    });
    return text;
  };

  return {
    locale: computed(() => locale.value),
    setLocale,
    t,
    tf,
  };
}

export { getSupportedLocales, getLocaleName };

