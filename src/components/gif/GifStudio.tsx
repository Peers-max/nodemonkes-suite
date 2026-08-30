import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Download, Shuffle, RefreshCw, Gift, Sliders, Check, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import type { Monke } from '../../types';
import { BODY_COLORS, PRESET_COLORS } from '../../utils/constants';

interface GifStudioProps {
  initialMonkeId?: number;
  monkes: Monke[];
  onToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
}

const FRAME_COUNT = 36;
const BASE_FRAME_DELAY = 1000 / 30;

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function reduceColorDepth(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / 8) * 8; // R
    data[i + 1] = Math.round(data[i + 1] / 8) * 8; // G
    data[i + 2] = Math.round(data[i + 2] / 8) * 8; // B
  }
}

function drawOriginalFrame(
  ctx: CanvasRenderingContext2D,
  upperImg: HTMLImageElement,
  lowerImg: HTMLImageElement,
  progress: number,
  size: number,
  bgColor: string | null
) {
  const PARAMS = {
    rotationRange: 0.045,
    pressDownStrength: 50,
    insertionStrength: 30,
    insertionAngle: 0.045,
    squashStrength: 0.12,
  };

  ctx.clearRect(0, 0, size, size);
  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  const rotation = Math.sin(progress * Math.PI * 2) * PARAMS.rotationRange;
  const isRaising = rotation < 0;

  const pressDownPhase = Math.max(0, Math.sin(progress * Math.PI * 2));
  const pressDownOffset = pressDownPhase * PARAMS.pressDownStrength;
  const insertionOffset = pressDownPhase * PARAMS.insertionStrength;
  const insertionRotation = pressDownPhase * PARAMS.insertionAngle;
  const compressionFactor = pressDownPhase * PARAMS.squashStrength;

  const smoothCompression = easeInOutQuad(compressionFactor);

  ctx.save();
  const scaleY = 1 - smoothCompression;
  const scaleX = 1 + smoothCompression * 0.2;

  ctx.translate(size / 2, size);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-size / 2, -size);
  ctx.drawImage(lowerImg, 0, pressDownOffset, size, size);
  ctx.restore();

  ctx.save();
  if (isRaising) {
    const raisePivotX = Math.floor((size * 3) / 7);
    const pivotY = size - Math.floor((size * 2) / 9);
    ctx.translate(raisePivotX, pivotY + pressDownOffset);
    ctx.rotate(rotation);
    ctx.translate(-raisePivotX, -(pivotY + pressDownOffset));
    ctx.drawImage(upperImg, 0, pressDownOffset, size, size);
  } else {
    const pivotX = Math.floor((size * 2) / 7);
    const pivotY = size - Math.floor((size * 2) / 9);
    ctx.translate(pivotX, pivotY + pressDownOffset);
    ctx.rotate(insertionRotation);
    ctx.translate(-pivotX, -(pivotY + pressDownOffset));
    ctx.drawImage(upperImg, 0, pressDownOffset + insertionOffset, size, size);
  }
  ctx.restore();
}

function loadImagePromise(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export const GifStudio: React.FC<GifStudioProps> = ({
  initialMonkeId = 209,
  monkes,
  onToast,
}) => {
  const [idInput, setIdInput] = useState(String(initialMonkeId));
  const [currentId, setCurrentId] = useState(initialMonkeId);
  const [mode, setMode] = useState<'normal' | 'santa'>('normal');
  const [resolution] = useState(600); // Original resolution
  const [bgColor, setBgColor] = useState<string | null>(null); // null for transparent
  const [bgMode, setBgMode] = useState<'transparent' | 'auto' | 'custom'>('transparent');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [speed, setSpeed] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const [images, setImages] = useState<{ upper: string | null; lower: string | null }>({
    upper: null,
    lower: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();
  const upperImgRef = useRef<HTMLImageElement | null>(null);
  const lowerImgRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Helper to get image URLs matching original repo
  const getImageUrls = (imageId: number, m: 'normal' | 'santa') => {
    if (m === 'santa') {
      return {
        upper: `https://pub-048d93bb0a5a448783aecb63c784ccbf.r2.dev/santaupperbody/${imageId}.png`,
        lower: `https://pub-048d93bb0a5a448783aecb63c784ccbf.r2.dev/santalowerbody/${imageId}.png`,
      };
    }
    return {
      upper: `https://pub-b4dd93b94d3b4b3a93fa599c57a78615.r2.dev/upperbody/${imageId}.png`,
      lower: `https://pub-b4dd93b94d3b4b3a93fa599c57a78615.r2.dev/lowerbody/${imageId}.png`,
    };
  };

  const getAutoBackground = (imageId: number) => {
    const item = monkes.find((m) => m.id === imageId);
    if (item?.attributes?.Body) {
      const bodyType = item.attributes.Body.toLowerCase();
      return BODY_COLORS[bodyType] || null;
    }
    return null;
  };

  // Load preview for given ID and mode
  const loadPreview = useCallback(async (monkeId: number, m: 'normal' | 'santa') => {
    setStatusText(`正在加载 #${monkeId} 图片资源...`);
    const urls = getImageUrls(monkeId, m);
    setImages(urls);
    setCurrentId(monkeId);
  }, [monkes]);

  // Initial load
  useEffect(() => {
    loadPreview(currentId, mode);
  }, [currentId, mode, loadPreview]);

  // Background sync
  useEffect(() => {
    if (bgMode === 'transparent') {
      setBgColor(null);
    } else if (bgMode === 'auto') {
      const autoBg = getAutoBackground(currentId);
      setBgColor(autoBg || '#FFFFFF');
    } else {
      setBgColor(customColor);
    }
  }, [bgMode, currentId, customColor, monkes]);

  // Live Canvas Animation (Ported 1:1 from original Preview.tsx)
  useEffect(() => {
    if (!canvasRef.current || !images.upper || !images.lower) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = resolution;
    canvasRef.current.height = resolution;

    let imagesLoaded = 0;
    const totalImages = 2;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        progressRef.current = 0;
        lastTimeRef.current = 0;
        setStatusText(`预览已准备就绪 (#${currentId})`);
        animate();
      }
    };

    const upperImg = new Image();
    upperImg.crossOrigin = 'anonymous';
    upperImg.onload = onImageLoad;
    upperImg.onerror = () => setStatusText(`无法加载上半身图片: #${currentId}`);
    upperImg.src = images.upper;
    upperImgRef.current = upperImg;

    const lowerImg = new Image();
    lowerImg.crossOrigin = 'anonymous';
    lowerImg.onload = onImageLoad;
    lowerImg.onerror = () => setStatusText(`无法加载下半身图片: #${currentId}`);
    lowerImg.src = images.lower;
    lowerImgRef.current = lowerImg;

    function animate(currentTime?: number) {
      if (!currentTime) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      const frameDelay = BASE_FRAME_DELAY / speed;

      if (deltaTime >= frameDelay) {
        const c = canvasRef.current?.getContext('2d');
        if (c && upperImgRef.current && lowerImgRef.current) {
          drawOriginalFrame(
            c,
            upperImgRef.current,
            lowerImgRef.current,
            progressRef.current,
            resolution,
            bgColor
          );
          progressRef.current = (progressRef.current + 1 / FRAME_COUNT) % 1;
          lastTimeRef.current = currentTime;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [images, bgColor, resolution, speed, currentId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(idInput.trim(), 10);
    if (!isNaN(val) && val >= 1 && val <= 10000) {
      loadPreview(val, mode);
    } else {
      onToast('输入错误', '请输入 1 - 10,000 之间的有效 ID', 'error');
    }
  };

  const handleRandom = () => {
    const rand = Math.floor(Math.random() * 10000) + 1;
    setIdInput(String(rand));
    loadPreview(rand, mode);
  };

  // Generate GIF (Ported 1:1 from original GifGenerator.tsx)
  const handleGenerate = async () => {
    if (!images.upper || !images.lower || isGenerating) return;
    setIsGenerating(true);
    setProgress(0);

    try {
      // Ensure GIF.js is available
      let GIFConstructor = (window as any).GIF;
      if (!GIFConstructor) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load gif.js'));
          document.head.appendChild(script);
        });
        GIFConstructor = (window as any).GIF;
      }

      const gif = new GIFConstructor({
        workers: 2,
        quality: 10,
        width: resolution,
        height: resolution,
        dither: false,
        transparent: bgColor ? null : 0x00000000,
        background: bgColor || '#00000000',
        repeat: 0,
        workerScript: './gif.worker.js',
      });

      gif.on('progress', (p: number) => {
        setProgress(Math.round(p * 100));
      });

      const targetFrameCount = 24;
      const frameSkip = Math.max(1, Math.floor(FRAME_COUNT / targetFrameCount));
      const frameDelay = Math.max(20, Math.round((BASE_FRAME_DELAY * frameSkip) / speed));

      if (!outputCanvasRef.current) {
        outputCanvasRef.current = document.createElement('canvas');
        outputCanvasRef.current.width = resolution;
        outputCanvasRef.current.height = resolution;
      }

      const ctx = outputCanvasRef.current.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas not available');

      const upperImg = await loadImagePromise(images.upper);
      const lowerImg = await loadImagePromise(images.lower);

      for (let i = 0; i < FRAME_COUNT; i += frameSkip) {
        const p = i / FRAME_COUNT;
        drawOriginalFrame(ctx, upperImg, lowerImg, p, resolution, bgColor);

        const imageData = ctx.getImageData(0, 0, resolution, resolution);
        reduceColorDepth(imageData.data);
        ctx.putImageData(imageData, 0, 0);

        gif.addFrame(ctx.canvas, { copy: true, delay: frameDelay });
        await new Promise((r) => setTimeout(r, 5));
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nodemonke_${currentId}_${mode}_${speed.toFixed(1)}x.gif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onToast('GIF 生成成功！', `已下载 nodemonke_${currentId}_${mode}.gif`, 'success');
        setProgress(0);
        setIsGenerating(false);
      });

      gif.render();
    } catch (err: any) {
      console.error('GIF export error:', err);
      onToast('生成失败', err.message || '请重试', 'error');
      setProgress(0);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NODEMONKES 36-FRAME GENUINE GIF STUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Nodemonkes GIF Generator
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto font-sans">
          使用官方原版 Upper / Lower 分层 36 帧正弦插值动效，支持经典版与 Santa 圣诞版。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Preview Canvas */}
        <div className="lg:col-span-6 flex flex-col items-center gap-3">
          <div className="relative w-full aspect-square max-w-[460px] rounded-2xl glass-panel p-2 flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl">
            {bgMode === 'transparent' && (
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            )}
            
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="w-full h-full object-contain pixelated relative z-10"
            />

            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>#{currentId} ({mode.toUpperCase()})</span>
            </div>
          </div>

          {/* Search ID Form */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-[460px] flex items-center gap-2">
            <input
              type="text"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="输入 ID (1-10000)..."
              className="flex-1 px-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
            >
              确定
            </button>
            <button
              type="button"
              onClick={handleRandom}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs flex items-center gap-1 font-mono transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>随机</span>
            </button>
          </form>

          {statusText && (
            <span className="text-[11px] font-mono text-slate-400">{statusText}</span>
          )}
        </div>

        {/* Right Side: Controls */}
        <div className="lg:col-span-6 space-y-4 glass-panel p-5 rounded-3xl border border-white/10 shadow-xl">
          
          {/* Mode Switcher */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              1. 模式选择 (Mode)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('normal')}
                className={clsx(
                  'py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                  mode === 'normal'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Classic 普通版</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('santa')}
                className={clsx(
                  'py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                  mode === 'santa'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold shadow'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Gift className="w-3.5 h-3.5 text-rose-400" />
                <span>Santa 圣诞帽版</span>
              </button>
            </div>
          </div>

          {/* Background Controls */}
          <div className="space-y-2 pt-3 border-t border-white/5">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              2. 背景底色设置
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBgMode('transparent')}
                className={clsx(
                  'py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all',
                  bgMode === 'transparent'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <div className="w-4 h-4 rounded border border-dashed border-slate-500 flex items-center justify-center text-[9px]">
                  ⛶
                </div>
                <span>无背景 (透明)</span>
              </button>

              <button
                type="button"
                onClick={() => setBgMode('auto')}
                className={clsx(
                  'py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all',
                  bgMode === 'auto'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: getAutoBackground(currentId) || '#FFFFFF' }}
                />
                <span>自动背景色</span>
              </button>

              <button
                type="button"
                onClick={() => setBgMode('custom')}
                className={clsx(
                  'py-2 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all',
                  bgMode === 'custom'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Palette className="w-4 h-4 text-purple-400" />
                <span>自定义颜色</span>
              </button>
            </div>

            {bgMode === 'custom' && (
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex items-center gap-2 flex-wrap animate-in fade-in">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCustomColor(c.value)}
                    title={c.name}
                    className={clsx(
                      'w-6 h-6 rounded-md border transition-transform',
                      customColor.toLowerCase() === c.value.toLowerCase()
                        ? 'scale-110 ring-2 ring-amber-400 border-white'
                        : 'border-white/20 hover:scale-105'
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            )}
          </div>

          {/* Speed Selector */}
          <div className="space-y-2 pt-3 border-t border-white/5">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              3. 播放速度 (Speed)
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '0.75x', val: 0.75 },
                { label: '1.0x (原速)', val: 1.0 },
                { label: '1.25x', val: 1.25 },
                { label: '1.5x', val: 1.5 },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => setSpeed(s.val)}
                  className={clsx(
                    'py-1.5 rounded-lg text-xs font-mono transition-all',
                    speed === s.val
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow'
                      : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !images.upper || !images.lower}
              className={clsx(
                'w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xl',
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 shadow-orange-500/20 active:scale-98'
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>正在导出 GIF... {progress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>生成并下载 GIF 动图 (600px 36帧)</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
