/**
 * PWA 工具函数
 */

/**
 * 检测是否在 PWA standalone 模式下运行
 */
export function isStandalone(): boolean {
  // 检查是否在 standalone 模式下
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(display-mode: standalone)').matches;
  }
  
  // 备用检测方法
  if (typeof window !== 'undefined' && (window.navigator as any).standalone) {
    return true;
  }
  
  // 检查是否通过 manifest 启动
  if (typeof window !== 'undefined') {
    const isStandalone = (window.navigator as any).standalone === true ||
      (window.matchMedia('(display-mode: standalone)').matches) ||
      document.referrer.includes('android-app://');
    return isStandalone;
  }
  
  return false;
}

/**
 * 获取视口高度（考虑PWA模式）
 */
export function getViewportHeight(): string {
  if (isStandalone()) {
    // PWA模式下，使用100vh填满整个屏幕
    return '100vh';
  }
  // 普通浏览器模式，使用100dvh（动态视口高度）
  return '100dvh';
}

