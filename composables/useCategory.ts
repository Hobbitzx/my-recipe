import { Category } from '../types';
import { useLanguage } from './useLanguage';

/**
 * 分类映射到国际化键
 */
const categoryMap: Record<string, string> = {
  [Category.ALL]: 'categories.all',
  [Category.QUICK_BREAKFAST]: 'categories.quickBreakfast',
  [Category.COLD_DISHES]: 'categories.coldDishes',
  [Category.MEAT_MAIN]: 'categories.meatMain',
  [Category.RICE_NOODLES]: 'categories.riceNoodles',
  [Category.SOUP]: 'categories.soup',
  [Category.VEGETABLE_STIR]: 'categories.vegetableStir',
  [Category.DESSERT]: 'categories.dessert',
  [Category.DRINKS]: 'categories.drinks',
};

/**
 * 获取分类的国际化名称
 * @param catgory 分类枚举值
 * @returns 分类的国际化名称
 */
export function getCategoryName(category: Category | string) {
  const { t } = useLanguage();
  return t(categoryMap[category] || category);
}