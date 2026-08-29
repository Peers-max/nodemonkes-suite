import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Download, Shuffle, RefreshCw, Layers, Sliders, Check, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import type { Monke } from '../../types';
import { getMonkeImageUrl } from '../../utils/api';
import { BODY_COLORS, PRESET_COLORS, GIF_PARAMS } from '../../utils/constants';
import { drawAnimationFrame, generateGif } from '../../utils/gifEngine';

interface GifStudioProps {
  initialMonkeId?: number;
  monkes: Monke[];
  onToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
}

export const GifStudio: React.FC<GifStudioProps> = ({
  initialMonkeId = 209,
  monkes,
  onToast,
}) => {
  const [monkeId, setMonkeId] = useState(initialMonkeId);
  const [bgMode, setBgMode] = useState<'transparent' | 'auto' | 'custom'>('auto');
  const [customColor, setCustomColor] = useState('#0A0D14');
  const [fps, setFps] = useState(20);
  const [scale, setScale] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const currentMonke = monkes.find((m) => m.id === monkeId);
  const bodyType = currentMonke?.attributes?.Body?.toLowerCase() || 'gold';
  const autoBgColor = BODY_COLORS[bodyType] || '#FFAA01';

  const effectiveBgColor =
    bgMode === 'transparent' ? null : bgMode === 'auto' ? autoBgColor : customColor;

  // Load Image and Start Animation Loop
  useEffect(() => {
    let currentFrame = 0;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getMonkeImageUrl(monkeId);

    img.onload = () => {
      imageObjRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let lastTime = performance.now();
      const interval = 1000 / fps;

      const loop = (now: number) => {
        if (now - lastTime >= interval) {
          lastTime = now;
          currentFrame = (currentFrame + 1) % GIF_PARAMS.frameCount;
          drawAnimationFrame(
            ctx,
            img,
            currentFrame,
            GIF_PARAMS.frameCount,
            canvas.width,
            canvas.height,
            effectiveBgColor
          );
        }
        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);
    };

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [monkeId, effectiveBgColor, fps]);

  const handleRandomMonke = () => {
    const randomId = Math.floor(Math.random() * 10000) + 1;
    setMonkeId(randomId);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(0);

    try {
      onToast('Generating GIF...', 'Rendering frames with Web Worker', 'info');
      const blob = await generateGif({
        imageUrl: getMonkeImageUrl(monkeId),
        backgroundColor: effectiveBgColor,
        fps,
        scale,
        onProgress: (p) => setProgress(Math.round(p * 100)),
      });

      // Trigger Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nodemonke-${monkeId}-animated.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onToast('GIF Ready!', `Successfully downloaded nodemonke-${monkeId}.gif`, 'success');
    } catch (err: any) {
      console.error('GIF generation failed:', err);
      onToast('Generation Failed', err.message || 'Please try again', 'error');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NODEMONKES ANIMATED GIF STUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Dynamic Looping GIFs
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto font-sans">
          Select any NodeMonke, customize background color, animation speed and scale, then render a crisp looping GIF in seconds.
        </p>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Canvas Preview */}
        <div className="lg:col-span-6 flex flex-col items-center gap-4">
          <div className="relative w-full aspect-square max-w-md rounded-3xl glass-panel p-6 flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden group">
            {/* Checkerboard Pattern for transparent bg */}
            {bgMode === 'transparent' && (
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            )}
            
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="w-full h-full object-contain pixelated relative z-10 filter drop-shadow-xl"
            />

            {/* Live Indicator */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE 24-FRAME PREVIEW</span>
            </div>

            <div className="absolute bottom-4 right-4 z-20 text-xs font-mono text-slate-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              #{monkeId}
            </div>
          </div>

          {/* Quick Monke Selector */}
          <div className="w-full max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min={1}
                max={10000}
                value={monkeId}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= 10000) {
                    setMonkeId(val);
                  }
                }}
                className="w-full pl-4 pr-16 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm font-mono text-white focus:outline-none focus:border-amber-500/60"
                placeholder="Enter Monke ID (1-10000)"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                / 10,000
              </span>
            </div>
            <button
              onClick={handleRandomMonke}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Random</span>
            </button>
          </div>
        </div>

        {/* Right: Studio Controls Panel */}
        <div className="lg:col-span-6 space-y-6 glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
          
          {/* Section 1: Background Mode */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              1. Background Styling
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBgMode('transparent')}
                className={clsx(
                  'p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all',
                  bgMode === 'transparent'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <div className="w-5 h-5 rounded border border-dashed border-slate-500 flex items-center justify-center text-[10px]">
                  ⛶
                </div>
                <span>Transparent</span>
              </button>

              <button
                onClick={() => setBgMode('auto')}
                className={clsx(
                  'p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all',
                  bgMode === 'auto'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <div 
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: autoBgColor }}
                />
                <span>Auto Body Color</span>
              </button>

              <button
                onClick={() => setBgMode('custom')}
                className={clsx(
                  'p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all',
                  bgMode === 'custom'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Palette className="w-5 h-5 text-purple-400" />
                <span>Custom Palette</span>
              </button>
            </div>

            {/* Custom Color Palette Picker */}
            {bgMode === 'custom' && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCustomColor(c.value)}
                      title={c.name}
                      className={clsx(
                        'w-7 h-7 rounded-lg border transition-transform',
                        customColor.toLowerCase() === c.value.toLowerCase()
                          ? 'scale-110 border-white ring-2 ring-amber-400'
                          : 'border-white/20 hover:scale-105'
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Parameters (Speed & Resolution) */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              2. Animation & Resolution Settings
            </label>

            {/* FPS Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Speed (FPS)</span>
                <span className="text-amber-400 font-semibold">{fps} FPS</span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Resolution / Scale */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Export Resolution</span>
                <span className="text-white font-semibold">{28 * scale} × {28 * scale} px ({scale}x HD)</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '1x (28px)', val: 1 },
                  { label: '2x (56px)', val: 2 },
                  { label: '4x (112px)', val: 4 },
                  { label: '8x (224px)', val: 8 },
                ].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => setScale(s.val)}
                    className={clsx(
                      'py-1.5 rounded-lg text-xs font-mono transition-all',
                      scale === s.val
                        ? 'bg-white/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Render & Export Button */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={clsx(
                'w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-xl',
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 shadow-orange-500/25 scale-[1.01]'
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Encoding GIF... {progress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Render & Download Animated GIF</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
