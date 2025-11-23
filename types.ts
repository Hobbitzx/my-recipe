export enum Category {
  ALL = 'All',
  QUICK_BREAKFAST = 'QuickBreakfast',      // 快手早餐
  COLD_DISHES = 'ColdDishes',              // 冷盘凉菜
  MEAT_MAIN = 'MeatMain',                  // 肉类主菜
  RICE_NOODLES = 'RiceNoodles',            // 米面主食
  SOUP = 'Soup',                           // 暖胃煲汤
  VEGETABLE_STIR = 'VegetableStir',        // 素菜小炒
  DESSERT = 'Dessert',                     // 甜品点心
  DRINKS = 'Drinks'                        // 调酒饮料
}

export interface Ingredient {
  id: string;
  text: string;
}

export interface Step {
  id: string;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: Category;
  image: string;
  ingredients: Ingredient[];
  steps: Step[];
  prepTime: string; // e.g. "30 min"
  createdAt: number;
}

export type ViewState = 'HOME' | 'EDIT' | 'CREATE' | 'DETAIL';