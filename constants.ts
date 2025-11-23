import { Recipe, Category } from './types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Avocado Toast',
    description: 'A simple yet delicious start to the day with creamy avocado and sourdough.',
    category: Category.BREAKFAST,
    image: 'https://picsum.photos/800/600?random=1',
    prepTime: '10 min',
    createdAt: Date.now(),
    ingredients: [
      { id: '1', text: '2 slices Sourdough bread' },
      { id: '2', text: '1 Ripe Avocado' },
      { id: '3', text: 'Salt & Pepper' },
      { id: '4', text: 'Red pepper flakes' }
    ],
    steps: [
      { id: '1', text: 'Toast the bread until golden brown.' },
      { id: '2', text: 'Mash the avocado in a bowl with salt and pepper.' },
      { id: '3', text: 'Spread avocado mixture on toast.' },
      { id: '4', text: 'Sprinkle with red pepper flakes.' }
    ]
  },
  {
    id: '2',
    title: 'Earl Grey Macarons',
    description: 'Delicate french cookies with a tea-infused ganache filling.',
    category: Category.DESSERT,
    image: 'https://picsum.photos/800/600?random=2',
    prepTime: '1 hr 30 min',
    createdAt: Date.now() - 10000,
    ingredients: [
      { id: '1', text: 'Almond flour' },
      { id: '2', text: 'Powdered sugar' },
      { id: '3', text: 'Egg whites' },
      { id: '4', text: 'Loose leaf Earl Grey tea' }
    ],
    steps: [
      { id: '1', text: 'Sift almond flour and powdered sugar.' },
      { id: '2', text: 'Whip egg whites to stiff peaks.' },
      { id: '3', text: 'Fold dry ingredients into meringue.' },
      { id: '4', text: 'Pipe onto baking sheet and bake at 300°F.' }
    ]
  },
  {
    id: '3',
    title: 'Quinoa Salad Bowl',
    description: 'Nutritious lunch bowl packed with veggies and lemon dressing.',
    category: Category.LUNCH,
    image: 'https://picsum.photos/800/600?random=3',
    prepTime: '25 min',
    createdAt: Date.now() - 20000,
    ingredients: [
      { id: '1', text: '1 cup Quinoa' },
      { id: '2', text: 'Cherry tomatoes' },
      { id: '3', text: 'Cucumber' },
      { id: '4', text: 'Lemon Vinaigrette' }
    ],
    steps: [
      { id: '1', text: 'Cook quinoa according to package instructions.' },
      { id: '2', text: 'Chop vegetables into small cubes.' },
      { id: '3', text: 'Toss everything together with dressing.' }
    ]
  },
  {
    id: '4',
    title: 'Matcha Latte',
    description: 'Calming green tea latte to boost focus and energy.',
    category: Category.DRINK,
    image: 'https://picsum.photos/800/600?random=4',
    prepTime: '5 min',
    createdAt: Date.now() - 30000,
    ingredients: [
      { id: '1', text: '1 tsp Matcha powder' },
      { id: '2', text: '1 cup Oat milk' },
      { id: '3', text: 'Honey to taste' }
    ],
    steps: [
      { id: '1', text: 'Whisk matcha with a little hot water.' },
      { id: '2', text: 'Froth the oat milk.' },
      { id: '3', text: 'Pour milk over matcha and sweeten.' }
    ]
  }
];