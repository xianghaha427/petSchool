// 图片处理工具：上传前等比压缩，减小传输体积、加快 AI 识别速度

// 加载图片元素
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

// canvas -> Blob
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/**
 * 等比压缩图片：最长边不超过 maxEdge，输出 JPEG。
 *
 * ⚠️ 任何一步失败（解码失败、canvas 不可用、toBlob 返回 null 等）都会
 * 原样返回原文件，绝不抛错，避免因为压缩失败阻断用户的上传/登记流程。
 */
export async function compressImage(
  file: File,
  maxEdge = 1024,
  quality = 0.8
): Promise<File> {
  try {
    if (!file.type.startsWith('image/')) return file;
    // GIF 压缩会丢失动画，跳过
    if (file.type === 'image/gif') return file;

    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await loadImage(objectUrl);
      const { width, height } = img;
      if (!width || !height) return file;

      const scale = Math.min(1, maxEdge / Math.max(width, height));

      // 尺寸和体积都已经很小，无需重新编码（避免无谓的画质损失）
      if (scale === 1 && file.size <= 1.5 * 1024 * 1024) return file;

      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return file;

      // 先铺白底，避免带透明通道的 PNG 转 JPEG 后变成黑底
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      if (!blob) return file;

      const filename = `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.jpg`;
      const compressed = new File([blob], filename, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // 压缩后反而更大就用原图
      return compressed.size < file.size ? compressed : file;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return file;
  }
}

export default compressImage;
