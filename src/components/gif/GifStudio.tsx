import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Download, Shuffle, RefreshCw, Layers, Sliders, Check, Palette, Gift } from 'lucide-react';
import { clsx } from 'clsx';
import type { Monke } from '../../types';
import { BODY_COLORS, PRESET_COLORS } from '../../utils/constants';
import { 
  drawOriginalFrame, 
  generateOriginalGif, 
  getSplitImageUrls, 
  getFallbackSplitImageUrls, 
  loadImage, 
  GIF_ANIMATION_PARAMS 
} from '../../utils/gifEngine';

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
  const [mode, setMode] = useState<'normal' | 'santa'>('normal');
  const [bgMode, setBgMode] = useState<'transparent' | 'auto' | 'custom'>('auto');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [speed, setSpeed] = useState(1);
  const [resolution, setResolution] = useState(400);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const progressRef = useRef(0);
  const lastTimeRef = useRef(0);
  const upperImgRef = useRef<HTMLImageElement | null>(null);
  const lowerImgRef = useRef<HTMLImageElement | null>(null);

  const currentMonke = monkes.find((m) => m.id === monkeId);
  const bodyType = currentMonke?.attributes?.Body?.toLowerCase() || 'gold';
  const autoBgColor = BODY_COLORS[bodyType] || '#FFAA01';

  const effectiveBgColor =
    bgMode === 'transparent' ? null : bgMode === 'auto' ? autoBgColor : customColor;

  // Load upper & lower body images when monkeId or mode changes
  useEffect(() => {
    let active = true;
    setLoadError(null);

    const urls = getSplitImageUrls(monkeId, mode);
    const fallbackUrls = getFallbackSplitImageUrls(monkeId, mode);

    const loadPair = async () => {
      try {
        let upper: HTMLImageElement;
        let lower: HTMLImageElement;

        try {
          [upper, lower] = await Promise.all([
            loadImage(urls.upper),
            loadImage(urls.lower),
          ]);
        } catch {
          // Try fallback URLs
          [upper, lower] = await Promise.all([
            loadImage(fallbackUrls.upper),
            loadImage(fallbackUrls.lower),
          ]);
        }

        if (!active) return;
        upperImgRef.current = upper;
        lowerImgRef.current = lower;
        progressRef.current = 0;
        lastTimeRef.current = 0;
      } catch (err: any) {
        if (!active) return;
        console.error('Failed to load split images:', err);
        setLoadError(`Image assets for #${monkeId} not found`);
      }
    };

    loadPair();

    return () => {
      active = false;
    };
  }, [monkeId, mode]);

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseDelay = GIF_ANIMATION_PARAMS.baseFrameDelay / speed;

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = currentTime - lastTimeRef.current;

      if (deltaTime >= baseDelay) {
        if (upperImgRef.current && lowerImgRef.current) {
          drawOriginalFrame(
            ctx,
            upperImgRef.current,
            lowerImgRef.current,
            progressRef.current,
            resolution,
            effectiveBgColor
          );
          progressRef.current = (progressRef.current + 1 / GIF_ANIMATION_PARAMS.frameCount) % 1;
          lastTimeRef.current = currentTime;
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [effectiveBgColor, speed, resolution]);

  const handleRandomMonke = () => {
    const randomId = Math.floor(Math.random() * 10000) + 1;
    setMonkeId(randomId);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(0);

    try {
      onToast('Generating GIF...', 'Rendering original upper/lower animation frames', 'info');
      const urls = getSplitImageUrls(monkeId, mode);

      const blob = await generateOriginalGif({
        upperUrl: urls.upper,
        lowerUrl: urls.lower,
        backgroundColor: effectiveBgColor,
        speed,
        resolution,
        onProgress: (p) => setProgress(Math.round(p * 100)),
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nodemonke-${monkeId}${mode === 'santa' ? '-santa' : ''}-nodding.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onToast('GIF Downloaded!', `Successfully saved animated nodemonke #${monkeId}.gif`, 'success');
    } catch (err: any) {
      console.error('GIF generation failed:', err);
      onToast('Generation Error', err.message || 'Please try again', 'error');
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
          <span>ORIGINAL NODEMONKES 36-FRAME GIF STUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Nodding Monke GIF Generator
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto font-sans">
          Powered by the genuine pre-sliced upper & lower body motion algorithm. Supports both Classic and Santa Hat editions.
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
              width={resolution}
              height={resolution}
              className="w-full h-full object-contain pixelated relative z-10 filter drop-shadow-xl"
            />

            {/* Error Overlay */}
            {loadError && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30">
                <span className="text-rose-400 font-mono text-sm mb-2">{loadError}</span>
                <button
                  onClick={handleRandomMonke}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"
                >
                  Try Random Monke
                </button>
              </div>
            )}

            {/* Live Indicator */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>GENUINE 36-FRAME MOTION</span>
            </div>

            <div className="absolute bottom-4 right-4 z-20 text-xs font-mono text-slate-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              #{monkeId} ({mode.toUpperCase()})
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
        <div className="lg:col-span-6 space-y-5 glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
          
          {/* Mode Switcher: Normal vs Santa */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              1. Monke Edition Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('normal')}
                className={clsx(
                  'p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all',
                  mode === 'normal'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md font-bold'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Classic NodeMonkes</span>
              </button>

              <button
                onClick={() => setMode('santa')}
                className={clsx(
                  'p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all',
                  mode === 'santa'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md font-bold'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Gift className="w-4 h-4 text-rose-400" />
                <span>Santa Hat Edition</span>
              </button>
            </div>
          </div>

          {/* Background Mode */}
          <div className="space-y-2 pt-3 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              2. Background Styling
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBgMode('transparent')}
                className={clsx(
                  'p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all',
                  bgMode === 'transparent'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <div className="w-4 h-4 rounded border border-dashed border-slate-500 flex items-center justify-center text-[10px]">
                  ⛶
                </div>
                <span>Transparent</span>
              </button>

              <button
                onClick={() => setBgMode('auto')}
                className={clsx(
                  'p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all',
                  bgMode === 'auto'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <div 
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: autoBgColor }}
                />
                <span>Auto Body Match</span>
              </button>

              <button
                onClick={() => setBgMode('custom')}
                className={clsx(
                  'p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all',
                  bgMode === 'custom'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Custom Color</span>
              </button>
            </div>

            {bgMode === 'custom' && (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCustomColor(c.value)}
                      title={c.name}
                      className={clsx(
                        'w-6 h-6 rounded-lg border transition-transform',
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
                    className="w-6 h-6 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Speed & Resolution Settings */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              3. Speed & Resolution
            </label>

            <div className="grid grid-cols-2 gap-4">
              {/* Speed Buttons */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Animation Speed</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: '0.75x', val: 0.75 },
                    { label: '1.0x', val: 1 },
                    { label: '1.5x', val: 1.5 },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setSpeed(s.val)}
                      className={clsx(
                        'py-1.5 rounded-lg text-xs font-mono transition-all',
                        speed === s.val
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Buttons */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Export Size</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: '300px', val: 300 },
                    { label: '400px', val: 400 },
                    { label: '600px', val: 600 },
                  ].map((r) => (
                    <button
                      key={r.val}
                      onClick={() => setResolution(r.val)}
                      className={clsx(
                        'py-1.5 rounded-lg text-xs font-mono transition-all',
                        resolution === r.val
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Render & Export Button */}
          <div className="pt-3 border-t border-white/5">
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
                  <span>Rendering 36-Frame GIF... {progress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Render & Download Animated GIF ({resolution}px)</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
