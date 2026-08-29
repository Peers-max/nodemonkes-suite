import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Paintbrush, 
  Download, 
  Shuffle, 
  RotateCcw, 
  Palette, 
  Sparkles, 
  Check, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { clsx } from 'clsx';
import { BODY_COLORS, PRESET_COLORS } from '../../utils/constants';

interface DiyStudioProps {
  onToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
}

type SeriesType = 'normal' | 'dog' | 'block' | 'rabbit' | 'peer';
type CategoryType = 'Body' | 'Earring' | 'Eyes' | 'Head';

interface TraitPart {
  value: string;
  url: string;
}

const METADATA_URL = 'https://pub-ce8a03b190984a3d99332e13b7d5e3cb.r2.dev/metadata.json';

const BASE_URLS: Record<SeriesType, string> = {
  normal: 'https://pub-2f0821e8464b4c139f681d763393f4ee.r2.dev',
  dog: 'https://pub-4d8b3f7049bb4025a6642c75eeb71c46.r2.dev',
  block: 'https://pub-d7a7a960d42949efb84bea391aa90d4c.r2.dev',
  rabbit: 'https://pub-e50795db8d0d41dd942f04a8b290f95f.r2.dev',
  peer: 'https://pub-026e5fdeaab545cc9c5aa34738735770.r2.dev',
};

const CATEGORIES: CategoryType[] = ['Body', 'Earring', 'Eyes', 'Head'];
const SPECIAL_SERIES = ['Dog', 'Peer', 'Rabbit', 'Block'];

const SERIES_COMPONENTS: Record<SeriesType, CategoryType[]> = {
  normal: ['Body', 'Earring', 'Eyes', 'Head'],
  dog: ['Body', 'Earring', 'Eyes'],
  block: ['Body', 'Earring', 'Eyes'],
  rabbit: ['Body', 'Earring', 'Eyes'],
  peer: ['Body', 'Eyes'],
};

const SERIES_NAMES: { id: SeriesType; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'dog', label: 'Dog' },
  { id: 'block', label: 'Block' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'peer', label: 'Peer' },
];

export const DiyStudio: React.FC<DiyStudioProps> = ({ onToast }) => {
  const [activeSeries, setActiveSeries] = useState<SeriesType>('normal');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Body');
  const [selectedParts, setSelectedParts] = useState<Record<CategoryType, string>>({
    Body: '',
    Earring: '',
    Eyes: '',
    Head: '',
  });

  const [bgMode, setBgMode] = useState<'transparent' | 'orange' | 'auto' | 'custom'>('orange');
  const [customBgColor, setCustomBgColor] = useState('#F97316');
  const [components, setComponents] = useState<Record<SeriesType, Record<CategoryType, TraitPart[]>>>({
    normal: { Body: [], Earring: [], Eyes: [], Head: [] },
    dog: { Body: [], Earring: [], Eyes: [], Head: [] },
    block: { Body: [], Earring: [], Eyes: [], Head: [] },
    rabbit: { Body: [], Earring: [], Eyes: [], Head: [] },
    peer: { Body: [], Earring: [], Eyes: [], Head: [] },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Helper to load image with cache
  const loadCachedImage = useCallback((url: string): Promise<HTMLImageElement> => {
    if (imageCache.current.has(url)) {
      return Promise.resolve(imageCache.current.get(url)!);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.current.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load ${url}`));
      img.src = url;
    });
  }, []);

  // Fetch Metadata and Construct Trait Components List
  useEffect(() => {
    let mounted = true;

    const initMetadata = async () => {
      try {
        setLoading(true);
        const res = await fetch(METADATA_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const items: any[] = Array.isArray(data) ? data : [data];

        const uniqueComponents: Record<CategoryType, Set<string>> = {
          Body: new Set(),
          Earring: new Set(),
          Eyes: new Set(),
          Head: new Set(),
        };

        items.forEach((item) => {
          if (item.attributes) {
            CATEGORIES.forEach((cat) => {
              const val = item.attributes[cat];
              if (val && val !== 'None') {
                if (!(cat === 'Head' && SPECIAL_SERIES.includes(val))) {
                  uniqueComponents[cat].add(val);
                }
              }
            });
          }
        });

        const newComponents: Record<SeriesType, Record<CategoryType, TraitPart[]>> = {
          normal: { Body: [], Earring: [], Eyes: [], Head: [] },
          dog: { Body: [], Earring: [], Eyes: [], Head: [] },
          block: { Body: [], Earring: [], Eyes: [], Head: [] },
          rabbit: { Body: [], Earring: [], Eyes: [], Head: [] },
          peer: { Body: [], Earring: [], Eyes: [], Head: [] },
        };

        (Object.keys(BASE_URLS) as SeriesType[]).forEach((series) => {
          SERIES_COMPONENTS[series].forEach((cat) => {
            const parts: TraitPart[] = Array.from(uniqueComponents[cat]).map((val) => ({
              value: val,
              url: `${BASE_URLS[series]}/${cat.toLowerCase()}/${val}.png`,
            }));

            // Add 'None' option
            if (['Earring', 'Eyes'].includes(cat) || (cat === 'Head' && series === 'normal')) {
              parts.unshift({ value: 'None', url: 'none' });
            }

            newComponents[series][cat] = parts;
          });
        });

        if (!mounted) return;
        setComponents(newComponents);

        // Initial randomize
        const initialSelection: Record<CategoryType, string> = {
          Body: '',
          Earring: '',
          Eyes: '',
          Head: '',
        };

        const normalBodies = newComponents.normal.Body.filter((p) => p.url !== 'none');
        if (normalBodies.length > 0) {
          const randomBody = normalBodies[Math.floor(Math.random() * normalBodies.length)];
          initialSelection.Body = randomBody.url;
        }

        const normalHeads = newComponents.normal.Head.filter((p) => p.url !== 'none');
        if (normalHeads.length > 0) {
          const randomHead = normalHeads[Math.floor(Math.random() * normalHeads.length)];
          initialSelection.Head = randomHead.url;
        }

        setSelectedParts(initialSelection);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to init DIY metadata:', err);
        if (mounted) setLoading(false);
      }
    };

    initMetadata();

    return () => {
      mounted = false;
    };
  }, []);

  // Compute effective background color
  const getSelectedBodyName = (): string | null => {
    const bodyUrl = selectedParts.Body;
    if (!bodyUrl || bodyUrl === 'none') return null;
    const parts = bodyUrl.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.png', '').toLowerCase();
  };

  const getAutoBgColor = (): string => {
    const bodyName = getSelectedBodyName();
    if (bodyName && BODY_COLORS[bodyName]) {
      return BODY_COLORS[bodyName];
    }
    return '#F97316';
  };

  const effectiveBg =
    bgMode === 'transparent'
      ? null
      : bgMode === 'orange'
      ? '#F97316'
      : bgMode === 'auto'
      ? getAutoBgColor()
      : customBgColor;

  // Composite Canvas Layers
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Background
    if (effectiveBg) {
      ctx.fillStyle = effectiveBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Layer Order: Body -> Earring -> Eyes -> Head
    const layersToDraw = ['Body', 'Earring', 'Eyes', 'Head'] as CategoryType[];

    for (const cat of layersToDraw) {
      const url = selectedParts[cat];
      if (url && url !== 'none') {
        try {
          const img = await loadCachedImage(url);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } catch (e) {
          // Ignore failed layer
        }
      }
    }
  }, [effectiveBg, selectedParts, loadCachedImage]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Select Trait Part
  const handleSelectPart = (category: CategoryType, url: string) => {
    setSelectedParts((prev) => ({
      ...prev,
      [category]: url,
    }));
  };

  // Switch Series
  const handleSeriesChange = (series: SeriesType) => {
    setActiveSeries(series);
    if (!SERIES_COMPONENTS[series].includes(activeCategory)) {
      setActiveCategory('Body');
    }

    // Reset non-supported parts for this series
    setSelectedParts({
      Body: '',
      Earring: '',
      Eyes: '',
      Head: '',
    });
  };

  // Randomize Trait Combination
  const handleRandomize = () => {
    const newParts: Record<CategoryType, string> = {
      Body: '',
      Earring: '',
      Eyes: '',
      Head: '',
    };

    SERIES_COMPONENTS[activeSeries].forEach((cat) => {
      const available = components[activeSeries][cat];
      if (available && available.length > 0) {
        const valid = available.filter((p) => p.url !== 'none');
        if (valid.length > 0) {
          if (cat === 'Body') {
            // Body is required
            newParts.Body = valid[Math.floor(Math.random() * valid.length)].url;
          } else {
            // Other parts have 75% chance of being selected, 25% none
            if (Math.random() > 0.25) {
              newParts[cat] = valid[Math.floor(Math.random() * valid.length)].url;
            } else {
              newParts[cat] = 'none';
            }
          }
        }
      }
    });

    setSelectedParts(newParts);
    onToast('🎲 随机搭配完成！', `已为 ${activeSeries.toUpperCase()} 系列生成随机组合`, 'info');
  };

  // Save Avatar (Download High-Res PNG)
  const handleSaveAvatar = async () => {
    setSaving(true);
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 600;
      exportCanvas.height = 600;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      if (effectiveBg) {
        ctx.fillStyle = effectiveBg;
        ctx.fillRect(0, 0, 600, 600);
      }

      const layersToDraw = ['Body', 'Earring', 'Eyes', 'Head'] as CategoryType[];
      for (const cat of layersToDraw) {
        const url = selectedParts[cat];
        if (url && url !== 'none') {
          const img = await loadCachedImage(url);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, 600, 600);
        }
      }

      const a = document.createElement('a');
      a.href = exportCanvas.toDataURL('image/png');
      a.download = `diynm-${activeSeries}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      onToast('头像已保存！', '成功导出 600px 高清无损 PNG 头像', 'success');
    } catch (err: any) {
      console.error('Failed to save avatar:', err);
      onToast('保存失败', err.message || '请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentAvailableParts = components[activeSeries][activeCategory] || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          <Paintbrush className="w-3.5 h-3.5" />
          <span>OFFICIAL NODEMONKES DIY AVATAR CREATOR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          NodeMonkes DIY 头像工坊
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto font-sans">
          支持 Normal、Dog、Block、Rabbit、Peer 全系列官方原始图层，自由换装、图层拼装与无损导出。
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Preview Canvas & Action Buttons */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            
            {/* Canvas Preview Box */}
            <div className="relative w-full aspect-square rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden group shadow-inner">
              {bgMode === 'transparent' && (
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
              )}
              
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full h-full object-contain pixelated relative z-10 filter drop-shadow-2xl"
              />

              {loading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                  <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                  <span className="text-xs font-mono text-slate-300">正在加载全量官方图层...</span>
                </div>
              )}

              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeSeries.toUpperCase()} SERIES</span>
              </div>
            </div>

            {/* Quick Actions (Randomize & Save) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleRandomize}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all shadow-md active:scale-95"
              >
                <Shuffle className="w-4 h-4 text-emerald-400" />
                <span>🎲 随机搭配</span>
              </button>

              <button
                onClick={handleSaveAvatar}
                disabled={loading || saving}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{saving ? '保存中...' : '💾 保存头像'}</span>
              </button>
            </div>

            {/* Background Selector Buttons */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                背景底色配置
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => setBgMode('transparent')}
                  className={clsx(
                    'py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center',
                    bgMode === 'transparent'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  无背景
                </button>

                <button
                  onClick={() => setBgMode('orange')}
                  className={clsx(
                    'py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center',
                    bgMode === 'orange'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  橙色背景
                </button>

                <button
                  onClick={() => setBgMode('auto')}
                  className={clsx(
                    'py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center',
                    bgMode === 'auto'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  自动背景
                </button>

                <button
                  onClick={() => setBgMode('custom')}
                  className={clsx(
                    'py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center',
                    bgMode === 'custom'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  自选颜色
                </button>
              </div>

              {/* Custom Color Palette */}
              {bgMode === 'custom' && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center gap-2 flex-wrap animate-in fade-in">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCustomBgColor(c.value)}
                      title={c.name}
                      className={clsx(
                        'w-6 h-6 rounded-md border transition-transform',
                        customBgColor.toLowerCase() === c.value.toLowerCase()
                          ? 'scale-110 ring-2 ring-emerald-400 border-white'
                          : 'border-white/20 hover:scale-105'
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              )}
            </div>

            {/* Series Buttons */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                系列切换 (Series)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {SERIES_NAMES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSeriesChange(s.id)}
                    className={clsx(
                      'py-2 rounded-xl text-xs font-mono font-semibold transition-all text-center border',
                      activeSeries === s.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Category Tabs & Trait Grid */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col min-h-[580px]">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 mb-4">
            {CATEGORIES.map((cat) => {
              const isSupported = SERIES_COMPONENTS[activeSeries].includes(cat);
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => isSupported && setActiveCategory(cat)}
                  disabled={!isSupported}
                  className={clsx(
                    'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center',
                    !isSupported && 'opacity-30 cursor-not-allowed text-slate-600',
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span>{cat}</span>
                  {!isSupported && <span className="text-[10px] ml-1 opacity-60">(无)</span>}
                </button>
              );
            })}
          </div>

          {/* Parts Grid */}
          <div className="flex-1 overflow-y-auto max-h-[480px] pr-1">
            {!SERIES_COMPONENTS[activeSeries].includes(activeCategory) ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm font-mono">
                {activeSeries.toUpperCase()} 系列不支持 {activeCategory} 组件
              </div>
            ) : currentAvailableParts.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm font-mono">
                正在加载组件...
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                {currentAvailableParts.map((part) => {
                  const isSelected = selectedParts[activeCategory] === part.url;
                  const isNone = part.url === 'none';

                  return (
                    <div
                      key={part.value}
                      onClick={() => handleSelectPart(activeCategory, part.url)}
                      className={clsx(
                        'aspect-square rounded-2xl p-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-between border group relative overflow-hidden',
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/20 scale-[1.03]'
                          : 'bg-slate-900/60 border-white/5 hover:border-emerald-500/40 hover:bg-slate-800/80 hover:-translate-y-0.5'
                      )}
                    >
                      {/* Image Thumbnail or None Icon */}
                      <div className="w-full h-full flex items-center justify-center overflow-hidden p-1">
                        {isNone ? (
                          <div className="relative w-10 h-10 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center">
                            <div className="w-8 h-0.5 bg-slate-500 transform rotate-45" />
                          </div>
                        ) : (
                          <img
                            src={part.url}
                            alt={part.value}
                            loading="lazy"
                            className="w-full h-full object-contain pixelated transform group-hover:scale-110 transition-transform duration-200"
                          />
                        )}
                      </div>

                      {/* Label */}
                      <span className="text-[10px] text-center font-sans text-slate-300 truncate w-full px-1">
                        {part.value}
                      </span>

                      {/* Selected Indicator Check */}
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
