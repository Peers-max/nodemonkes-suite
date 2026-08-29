import { GIF_PARAMS } from './constants';

export interface GifOptions {
  imageUrl: string;
  backgroundColor: string | null; // null for transparent
  fps?: number;
  scale?: number;
  squashStrength?: number;
  rotationRange?: number;
  onProgress?: (progress: number) => void;
}

export function drawAnimationFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frameIndex: number,
  totalFrames: number,
  canvasWidth: number,
  canvasHeight: number,
  bgColor: string | null,
  options?: {
    rotationRange?: number;
    squashStrength?: number;
  }
) {
  const rotationRange = options?.rotationRange ?? GIF_PARAMS.rotationRange;
  const squashStrength = options?.squashStrength ?? GIF_PARAMS.squashStrength;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Background
  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  const t = (frameIndex / totalFrames) * 2 * Math.PI;
  const angle = Math.sin(t) * rotationRange;
  const squash = 1 - Math.abs(Math.sin(t)) * squashStrength;
  const offsetY = Math.sin(t) * 4;

  ctx.save();

  // Anchor at bottom center for natural nod
  const pivotX = canvasWidth / 2;
  const pivotY = canvasHeight * 0.9;

  ctx.translate(pivotX, pivotY + offsetY);
  ctx.rotate(angle);
  ctx.scale(1, squash);
  ctx.translate(-pivotX, -pivotY);

  // Draw pixel art crisply
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

  ctx.restore();
}

/**
 * Generate animated GIF in browser using HTML5 Canvas & GIF.js Worker
 */
export async function generateGif(options: GifOptions): Promise<Blob> {
  const {
    imageUrl,
    backgroundColor,
    fps = 20,
    scale = 4,
    squashStrength = GIF_PARAMS.squashStrength,
    rotationRange = GIF_PARAMS.rotationRange,
    onProgress
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        // Load GIF.js dynamically if needed
        const GIFModule = (window as any).GIF;
        if (!GIFModule) {
          // Load script tag dynamically
          await new Promise<void>((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js';
            script.onload = () => res();
            script.onerror = () => rej(new Error('Failed to load gif.js library'));
            document.head.appendChild(script);
          });
        }

        const GIFConstructor = (window as any).GIF;
        if (!GIFConstructor) {
          throw new Error('GIF encoder not available');
        }

        const baseWidth = img.width || 28;
        const baseHeight = img.height || 28;
        const width = baseWidth * scale;
        const height = baseHeight * scale;

        const gif = new GIFConstructor({
          workers: 4,
          quality: 10,
          width,
          height,
          workerScript: './gif.worker.js',
          transparent: backgroundColor ? null : 0x00000000,
        });

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error('Canvas context not available');
        }

        const totalFrames = GIF_PARAMS.frameCount;
        const delay = Math.round(1000 / fps);

        for (let i = 0; i < totalFrames; i++) {
          drawAnimationFrame(ctx, img, i, totalFrames, width, height, backgroundColor, {
            rotationRange,
            squashStrength
          });
          gif.addFrame(ctx, { copy: true, delay });
        }

        gif.on('progress', (p: number) => {
          if (onProgress) onProgress(p);
        });

        gif.on('finished', (blob: Blob) => {
          resolve(blob);
        });

        gif.render();
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    img.src = imageUrl;
  });
}
