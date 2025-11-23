import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import RecipeDetail from '../views/RecipeDetail.vue';
import RecipeForm from '../views/RecipeForm.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: RecipeDetail,
    props: true,
  },
  {
    path: '/recipe/new',
    name: 'RecipeCreate',
    component: RecipeForm,
    props: { isEdit: false },
  },
  {
    path: '/recipe/:id/edit',
    name: 'RecipeEdit',
    component: RecipeForm,
    props: (route) => ({ isEdit: true, recipeId: route.params.id }),
  },
];

const router = createRouter({
  history: createWebHistory('./'),
  routes,
});

export default router;

