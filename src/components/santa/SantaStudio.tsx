import React, { useState, useRef, useEffect } from 'react';
import { Gift, Download, Shuffle, Sparkles, Palette, Check, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import type { Monke } from '../../types';
import { getSantaMonkeImageUrl } from '../../utils/api';
import { BODY_COLORS } from '../../utils/constants';

interface SantaStudioProps {
  initialMonkeId?: number;
  monkes: Monke[];
  onOpenInGif: (monkeId: number) => void;
  onToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

const SANTA_PRESETS = [
  { name: 'Festive Red', value: '#D32F2F' },
  { name: 'Christmas Pine', value: '#1B5E20' },
  { name: 'Pure Dark', value: '#0A0D14' },
  { name: 'Snow Ice', value: '#E3F2FD' },
  { name: 'Golden Glow', value: '#FFAA01' },
];

export const SantaStudio: React.FC<SantaStudioProps> = ({
  initialMonkeId = 209,
  monkes,
  onOpenInGif,
  onToast,
}) => {
  const [monkeId, setMonkeId] = useState(initialMonkeId);
  const [bgMode, setBgMode] = useState<'transparent' | 'auto' | 'custom'>('auto');
  const [customColor, setCustomColor] = useState('#D32F2F');
  const [resolution, setResolution] = useState(560);
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentMonke = monkes.find((m) => m.id === monkeId);
  const bodyType = currentMonke?.attributes?.Body?.toLowerCase() || 'gold';
  const autoBgColor = BODY_COLORS[bodyType] || '#FFAA01';

  const effectiveBg =
    bgMode === 'transparent' ? null : bgMode === 'auto' ? autoBgColor : customColor;

  const santaImageUrl = getSantaMonkeImageUrl(monkeId);

  // Canvas composite
  useEffect(() => {
    setImageLoaded(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = santaImageUrl;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (effectiveBg) {
        ctx.fillStyle = effectiveBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageLoaded(true);
    };

    img.onerror = () => {
      setImageLoaded(false);
    };
  }, [monkeId, effectiveBg, santaImageUrl]);

  const handleRandomMonke = () => {
    const randomId = Math.floor(Math.random() * 10000) + 1;
    setMonkeId(randomId);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = resolution;
    exportCanvas.height = resolution;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      exportCtx.imageSmoothingEnabled = false;
      exportCtx.drawImage(canvas, 0, 0, resolution, resolution);
    }

    const a = document.createElement('a');
    a.href = exportCanvas.toDataURL('image/png');
    a.download = `santa-nodemonke-${monkeId}-${resolution}px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onToast('Downloaded!', `Saved Santa NodeMonke #${monkeId} (${resolution}px PNG)`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold">
          <Gift className="w-3.5 h-3.5" />
          <span>SANTA MONKES LIMITED EDITION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          10,000 Santa Hat NodeMonkes
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto font-sans">
          Festive holiday edition with pixel-perfect Santa hats. Customize background colors and download high-resolution holiday avatars.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Preview Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="relative w-full aspect-square max-w-md rounded-3xl glass-panel p-6 flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden group">
            {bgMode === 'transparent' && (
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            )}

            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="w-full h-full object-contain pixelated relative z-10 filter drop-shadow-xl"
            />

            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>SANTA EDITION</span>
            </div>

            <div className="absolute bottom-4 right-4 z-20 text-xs font-mono text-slate-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              #{monkeId}
            </div>
          </div>

          <div className="w-full max-w-md flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={10000}
              value={monkeId}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= 10000) setMonkeId(v);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm font-mono text-white focus:outline-none focus:border-rose-500/60"
              placeholder="Monke ID (1-10000)"
            />
            <button
              onClick={handleRandomMonke}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 text-rose-400" />
              <span>Random</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="w-full max-w-md flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download {resolution}px Festive Avatar</span>
          </button>
        </div>

        {/* Right: Controls Panel */}
        <div className="lg:col-span-7 space-y-6 glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
          
          {/* Background Styling */}
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
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-md'
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
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: autoBgColor }} />
                <span>Auto Fur Color</span>
              </button>

              <button
                onClick={() => setBgMode('custom')}
                className={clsx(
                  'p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all',
                  bgMode === 'custom'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                )}
              >
                <Palette className="w-5 h-5 text-rose-400" />
                <span>Holiday Palette</span>
              </button>
            </div>

            {bgMode === 'custom' && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-2 flex-wrap">
                  {SANTA_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCustomColor(c.value)}
                      title={c.name}
                      className={clsx(
                        'w-7 h-7 rounded-lg border transition-transform',
                        customColor.toLowerCase() === c.value.toLowerCase()
                          ? 'scale-110 ring-2 ring-rose-400 border-white'
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

          {/* Resolution Selector */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              2. Export Dimensions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Standard (280px)', val: 280 },
                { label: 'HD Avatar (560px)', val: 560 },
                { label: 'Ultra 4K (1120px)', val: 1120 },
              ].map((res) => (
                <button
                  key={res.val}
                  onClick={() => setResolution(res.val)}
                  className={clsx(
                    'py-2 rounded-xl text-xs font-mono transition-all',
                    resolution === res.val
                      ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white'
                  )}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cross Link to GIF */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => onOpenInGif(monkeId)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Animate this Monke in GIF Studio</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
