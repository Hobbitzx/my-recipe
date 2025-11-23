/**
 * 图片压缩工具 - 支持无损和高质量压缩
 * 使用 Canvas API 进行图片优化，保持最佳质量
 */

interface CompressOptions {
  maxWidth?: number;      // 最大宽度，默认 1920px（更高分辨率）
  maxHeight?: number;     // 最大高度，默认 1920px
  quality?: number;       // 压缩质量 0-1，默认 0.95（高质量）
  maxSizeKB?: number;     // 最大文件大小（KB），默认 800KB
  lossless?: boolean;     // 是否使用无损压缩（仅 WebP），默认 false
  preserveFormat?: boolean; // 是否保持原始格式，默认 true
}

/**
 * 检查浏览器是否支持 WebP
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * 获取最佳图片格式
 */
function getBestFormat(file: File, preserveFormat: boolean): string {
  if (preserveFormat) {
    // 保持原始格式
    if (file.type === 'image/png') return 'image/png';
    if (file.type === 'image/webp') return 'image/webp';
    if (file.type === 'image/gif') return 'image/gif';
  }
  
  // 如果支持 WebP，优先使用（更好的压缩比）
  if (supportsWebP()) {
    return 'image/webp';
  }
  
  // 回退到原始格式或 JPEG
  return file.type === 'image/png' ? 'image/png' : 'image/jpeg';
}

/**
 * 高质量图片压缩（优先保持质量）
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的 base64 字符串
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,  // 提高分辨率限制
    maxHeight = 1920,
    quality = 0.95,   // 提高默认质量
    maxSizeKB = 800,  // 提高大小限制
    lossless = false,
    preserveFormat = true
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // 计算新尺寸，保持宽高比
        let width = img.width;
        let height = img.height;
        
        // 只在图片确实很大时才缩放
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // 创建 canvas 进行压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d', {
          alpha: true,  // 支持透明度
          willReadFrequently: false,
          colorSpace: 'srgb'  // 使用标准色彩空间
        });
        
        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'));
          return;
        }
        
        // 使用高质量图像渲染设置
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 绘制图片到 canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // 确定最佳格式
        const format = getBestFormat(file, preserveFormat);
        const isWebP = format === 'image/webp';
        const isPNG = format === 'image/png';
        
        // 压缩策略
        const compress = (currentQuality: number, attempt: number = 0): void => {
          let dataUrl: string;
          
          if (isWebP && lossless) {
            // WebP 无损模式
            dataUrl = canvas.toDataURL('image/webp', 1.0);
          } else if (isPNG) {
            // PNG 格式（保持透明度，但文件可能较大）
            dataUrl = canvas.toDataURL('image/png');
          } else if (isWebP) {
            // WebP 有损模式（更好的压缩比）
            dataUrl = canvas.toDataURL('image/webp', currentQuality);
          } else {
            // JPEG 格式
            dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          }
          
          const sizeKB = (dataUrl.length * 3) / 4 / 1024; // base64 大小估算
          
          // 如果满足大小要求，或者质量已经很低，或者尝试次数过多
          if (sizeKB <= maxSizeKB || currentQuality <= 0.5 || attempt >= 5) {
            console.log(`压缩完成: ${sizeKB.toFixed(2)} KB, 质量: ${currentQuality.toFixed(2)}, 格式: ${format}`);
            resolve(dataUrl);
            return;
          }
          
          // 如果太大，逐步降低质量（但保持较高质量）
          const qualityStep = currentQuality > 0.9 ? 0.05 : 0.1;
          const newQuality = Math.max(0.5, currentQuality - qualityStep);
          
          // 如果质量降低后仍然可能太大，考虑进一步缩小尺寸
          if (attempt >= 2 && sizeKB > maxSizeKB * 1.5) {
            const scaleFactor = Math.sqrt(maxSizeKB / sizeKB);
            const newWidth = Math.round(width * scaleFactor);
            const newHeight = Math.round(height * scaleFactor);
            
            if (newWidth < width && newHeight < height) {
              canvas.width = newWidth;
              canvas.height = newHeight;
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, newWidth, newHeight);
              width = newWidth;
              height = newHeight;
            }
          }
          
          compress(newQuality, attempt + 1);
        };
        
        // 开始压缩，从高质量开始
        compress(quality);
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
 * 无损压缩（仅调整尺寸，不降低质量）
 * @param file 原始图片文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @returns 压缩后的 base64 字符串
 */
export async function compressImageLossless(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<string> {
  return compressImage(file, {
    maxWidth,
    maxHeight,
    quality: 1.0,
    lossless: true,
    preserveFormat: true,
    maxSizeKB: Infinity  // 不限制大小
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
 * @param maxSizeKB 最大大小（KB），默认 800KB
 * @returns 是否需要压缩
 */
export function needsCompression(file: File, maxSizeKB: number = 800): boolean {
  return getImageSizeKB(file) > maxSizeKB;
}

/**
 * 获取图片信息
 */
export function getImageInfo(file: File): Promise<{ width: number; height: number; sizeKB: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          sizeKB: getImageSizeKB(file)
        });
      };
      img.onerror = () => reject(new Error('无法读取图片信息'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}
