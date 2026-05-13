import type { Area } from 'react-easy-crop';

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  const safeArea = (size: number) => Math.max(1, Math.round(size));

  const cropWidth = safeArea(pixelCrop.width);
  const cropHeight = safeArea(pixelCrop.height);

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  // Draw rotated image centered on canvas
  ctx.translate(cropWidth / 2, cropHeight / 2);
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  ctx.translate(-cropWidth / 2, -cropHeight / 2);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      'image/png',
      1,
    );
  });
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
