export enum Category {
  ALL = 'All',
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  DESSERT = 'Dessert',
  HEALTHY = 'Healthy',
  DRINK = 'Drink'
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