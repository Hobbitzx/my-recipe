/**
 * 图片压缩工具
 * 使用 Canvas API 进行图片压缩，适合移动设备
 */

interface CompressOptions {
  maxWidth?: number;      // 最大宽度，默认 1200px
  maxHeight?: number;     // 最大高度，默认 1200px
  quality?: number;       // 压缩质量 0-1，默认 0.8
  maxSizeKB?: number;     // 最大文件大小（KB），默认 500KB
}

/**
 * 压缩图片
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的 base64 字符串
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // 计算新尺寸，保持宽高比
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // 创建 canvas 进行压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'));
          return;
        }
        
        // 绘制图片到 canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 base64，尝试不同的质量直到满足大小要求
        let currentQuality = quality;
        const tryCompress = () => {
          const dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          const sizeKB = (dataUrl.length * 3) / 4 / 1024; // base64 大小估算
          
          if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
            resolve(dataUrl);
          } else {
            // 降低质量重试
            currentQuality -= 0.1;
            if (currentQuality > 0.1) {
              tryCompress();
            } else {
              // 如果还是太大，使用最低质量
              resolve(canvas.toDataURL('image/jpeg', 0.1));
            }
          }
        };
        
        tryCompress();
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * 检查图片文件大小
 * @param file 图片文件
 * @returns 文件大小（KB）
 */
export function getImageSizeKB(file: File): number {
  return file.size / 1024;
}

/**
 * 检查是否需要压缩
 * @param file 图片文件
 * @param maxSizeKB 最大大小（KB），默认 500KB
 * @returns 是否需要压缩
 */
export function needsCompression(file: File, maxSizeKB: number = 500): boolean {
  return getImageSizeKB(file) > maxSizeKB;
}

