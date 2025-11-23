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
    props: (route: { params: { id: any; }; }) => ({ isEdit: true, recipeId: route.params.id }),
  },
];

// 使用环境变量中的 BASE_URL，对于 GitHub Pages 应该是 '/my-recipe/'
const baseUrl = import.meta.env.BASE_URL || '/';

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes,
});

// 添加路由导航守卫用于调试
router.beforeEach((to: any, from: any, next: any) => {
  console.log('Route change:', { 
    from: from.path, 
    to: to.path, 
    fullPath: to.fullPath,
    base: import.meta.env.BASE_URL,
    baseUrl: baseUrl
  });
  next();
});

// 监听路由变化
router.afterEach((to: any, from: any) => {
  console.log('Route changed successfully:', { from: from.path, to: to.path });
});

export default router;

