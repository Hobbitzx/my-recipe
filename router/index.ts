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

// 根据路由名称获取对应的滚动容器
function getScrollContainer(routeName: string | undefined): HTMLElement | null {
  if (!routeName) return null;
  
  const containerMap: Record<string, string> = {
    'Home': 'home-scroll-container',
    'RecipeDetail': 'detail-scroll-container',
    'RecipeCreate': 'form-scroll-container',
    'RecipeEdit': 'form-scroll-container',
  };
  const containerId = containerMap[routeName];
  return containerId ? document.getElementById(containerId) as HTMLElement | null : null;
}

// 保存滚动位置到 sessionStorage
function saveScrollPosition(routeName: string | undefined) {
  if (!routeName) return;
  const container = getScrollContainer(routeName);
  if (!container) return;
  const scrollTop = container.scrollTop;
  sessionStorage.setItem(`scroll-${routeName}`, scrollTop.toString());
}
// 从 sessionStorage 恢复滚动位置
function restoreScrollPosition(routeName: string | undefined): number | null {
  if (!routeName) return null;
  const saved = sessionStorage.getItem(`scroll-${routeName}`);
  return saved ? parseInt(saved, 10) : null;
}

// 跟踪每个路由是否应该恢复滚动位置
// 如果用户在恢复之前开始滚动，则取消恢复
const scrollRestoreFlags = new Map<string, { shouldRestore: boolean; userScrolled: boolean }>()

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 保存离开页面的滚动位置
    if (from.name) {
      saveScrollPosition(from.name as string);
    }
    // 为当前路由初始化恢复标志
    const routeName = to.name as string;
    if (routeName) {
      scrollRestoreFlags.set(routeName, { shouldRestore: true, userScrolled: false });
    }

    // 如果是从详情页返回主页，已经在afterEach中立即恢复了，这里不在处理
    if (to.name === 'Home' && from.name === 'RecipeDetail') {
      return { top: 0 };
    }
    // 使用 requestAnimationFrame 和 setTimeout 组合，减少延迟并确保DOM已更新
    return new Promise((resolve) => {
      // 先等待一帧，确保DOM渲染
      requestAnimationFrame(() => {
        // 再等待一小段时间确保布局完成
        setTimeout(() => {
          const scrollContainer = getScrollContainer(routeName);
          if (scrollContainer) {
            const restoreFlag = scrollRestoreFlags.get(routeName);

            // 如果用户已经开始滚动，则不恢复滚动位置
            if (restoreFlag && restoreFlag.userScrolled) {
              scrollRestoreFlags.delete(routeName);
              resolve({ top: 0});
              return;
            }

            // 检查当前滚动位置，如果已经被用户改变，则不恢复
            const currentScroll = scrollContainer.scrollTop;
            const shouldRestore = restoreFlag?.shouldRestore !== false;

            if (shouldRestore) {
              let targetScroll: number | null = null;

              // 如果是从浏览器前进/后退按钮触发的导航，恢复保存的滚动位置
              if (savedPosition) {
                const savedScroll = restoreScrollPosition(routeName);
                if (savedScroll !== null) {
                  targetScroll = savedScroll;
                }
              } else {
                // 如果是通过路由跳转（非前进/后退），检查是否有保存的滚动位置
                const savedScroll = restoreScrollPosition(routeName);
                if (savedScroll !== null && to.name === 'Home') {
                  // 只有返回主页时才恢复滚动位置
                  targetScroll = savedScroll;
                } else {
                  // 其他情况滚动到顶部
                  targetScroll = 0;
                }
              }

              // 只有在目标位置与当前位置不同，且用户没有滚动时才恢复
              if (targetScroll !== null && Math.abs(currentScroll - targetScroll) > 1) {
                scrollContainer.scrollTop = targetScroll;
              }
            }

            // 清理标志
            scrollRestoreFlags.delete(routeName);
          }
          resolve({ top: 0 });
        }, 50); // 减少延迟之间到50ms
      })
    })
  },
});

// 添加路由导航守卫用于调试和保存滚动位置
router.beforeEach((to: any, from: any, next: any) => {
  // 保存离开页面的滚动位置
  if (from.name) {
    saveScrollPosition(from.name as string);
  }
  console.log('Route change:', { 
    from: from.path, 
    to: to.path, 
    fullPath: to.fullPath,
    base: import.meta.env.BASE_URL,
    baseUrl: baseUrl
  });
  next();
});

// 存储每个路由的滚动监听器，用于清理
// 使用对象引用存储timer，确保可以正确清理
const scrollListeners = new Map<string, { handler: () => void; timerRef: { value: number | null } }>();

// 立即恢复滚动位置的函数
function restoreScrollImmediately(routeName: string | undefined) {
  if (!routeName) return;

  const scrollContainer = getScrollContainer(routeName);
  if (scrollContainer) {
    const savedScroll = restoreScrollPosition(routeName);
    if (savedScroll !== null && savedScroll > 0) {
      // 立即设置滚动位置，避免山东
      // 使用requestAnimationFrame确保在浏览器渲染前设置
      requestAnimationFrame(() => {
        scrollContainer.scrollTop = savedScroll;
      })
    }
  }
}
// 监听路由变化，设置滚动监听
router.afterEach((to: any, from: any) => {
  console.log('Route changed successfully:', { from: from.path, to: to.path });
  // 清理上一个路由的滚动监听器
  if (from.name) {
    const prevListener = scrollListeners.get(from.name as string);
    if (prevListener) {
      const prevContainer = getScrollContainer(from.name as string);
      if (prevContainer) {
        prevContainer.removeEventListener('scroll', prevListener.handler);
      }
      // 清理定时器（如果存在）
      if (prevListener.timerRef.value !== null) {
        clearTimeout(prevListener.timerRef.value);
        prevListener.timerRef.value = null;
      }
      scrollListeners.delete(from.name as string);
    }
  }

  // 为当前路由的滚动容器添加滚动监听，实时保存滚动位置
  const scrollContainer = getScrollContainer(to.name as string);
  if (scrollContainer) {
    // 立即恢复滚动位置（如果是从其他页面返回主页）
    if (to.name === 'Home' && from.name === 'RecipeDetail') {
      restoreScrollImmediately(to.name as string);
    }
    // 使用对象引用存储timer，确保可以通过引用更新和清理
    const timerRef = { value: null as number | null };
    const handler = () => {
      // 标记用户已经开始滚动，取消滚动位置恢复
      const restoreFlag = scrollRestoreFlags.get(to.name as string);
      if (restoreFlag && !restoreFlag.userScrolled) {
        restoreFlag.userScrolled = true;
      }

      if (timerRef.value !== null) return;
      timerRef.value = window.setTimeout(() => {
        if (to.name) {
          saveScrollPosition(to.name as string);
        }
        timerRef.value = null;
      }, 100);
    };

    scrollContainer.addEventListener('scroll', handler, { passive: true });

    // 保存监听器引用，timerRef是对象引用，可以在handler中更新
    scrollListeners.set(to.name as string, { handler, timerRef });
  } else {
    // 如果容器还不存在，使用nextTick等待DOM更新后再恢复
    if (to.name === 'Home' && from.name === 'RecipeDetail') {
      // 使用动态导入避免循环依赖
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          // 再次尝试获取容器
          const container = getScrollContainer(to.name as string);
          if (container) {
            const savedScroll = restoreScrollPosition(to.name as string);
            if (savedScroll !== null && savedScroll > 0) {
              // 在下一帧设置滚动位置
              requestAnimationFrame(() => {
                container.scrollTop = savedScroll;
              })
            }
          }
        })
      })
    }
  }
});

export default router;

