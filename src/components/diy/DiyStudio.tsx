import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Paintbrush, Download, Shuffle, RefreshCw, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { BODY_COLORS } from '../../utils/constants';

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
  block: 'https://pub-d7a7a960d42949efb84bea391aa90d4c.r2.dev',
  dog: 'https://pub-4d8b3f7049bb4025a6642c75eeb71c46.r2.dev',
  normal: 'https://pub-2f0821e8464b4c139f681d763393f4ee.r2.dev',
  peer: 'https://pub-026e5fdeaab545cc9c5aa34738735770.r2.dev',
  rabbit: 'https://pub-e50795db8d0d41dd942f04a8b290f95f.r2.dev',
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

const SERIES_BUTTONS: { id: SeriesType; label: string }[] = [
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

  const [bgColor, setBgColor] = useState<string>('transparent');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [components, setComponents] = useState<Record<SeriesType, Record<CategoryType, TraitPart[]>>>({
    normal: { Body: [], Earring: [], Eyes: [], Head: [] },
    dog: { Body: [], Earring: [], Eyes: [], Head: [] },
    block: { Body: [], Earring: [], Eyes: [], Head: [] },
    rabbit: { Body: [], Earring: [], Eyes: [], Head: [] },
    peer: { Body: [], Earring: [], Eyes: [], Head: [] },
  });

  const colorInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Metadata and Build Component Lists (Ported 1:1 from original r2_content.html)
  useEffect(() => {
    let mounted = true;

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const res = await fetch(METADATA_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const metadataList: any[] = Array.isArray(data) ? data : [data];

        const uniqueComponents: Record<CategoryType, Set<string>> = {
          Body: new Set(),
          Earring: new Set(),
          Eyes: new Set(),
          Head: new Set(),
        };

        metadataList.forEach((item) => {
          if (item.attributes) {
            CATEGORIES.forEach((category) => {
              const value = item.attributes[category];
              if (value && value !== 'None') {
                if (!(category === 'Head' && SPECIAL_SERIES.includes(value))) {
                  uniqueComponents[category].add(value);
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
          SERIES_COMPONENTS[series].forEach((category) => {
            const parts: TraitPart[] = Array.from(uniqueComponents[category]).map((value) => ({
              value,
              url: `${BASE_URLS[series]}/${category.toLowerCase()}/${value}.png`,
            }));

            // Add 'None' option
            if (['Earring', 'Eyes'].includes(category) || (category === 'Head' && series === 'normal')) {
              parts.unshift({ value: 'None', url: 'none' });
            }

            newComponents[series][category] = parts;
          });
        });

        if (!mounted) return;
        setComponents(newComponents);

        // Initial randomize
        const initialParts: Record<CategoryType, string> = {
          Body: '',
          Earring: '',
          Eyes: '',
          Head: '',
        };

        SERIES_COMPONENTS.normal.forEach((cat) => {
          const parts = newComponents.normal[cat];
          const valid = parts.filter((p) => p.url !== 'none');
          if (valid.length > 0) {
            if (cat === 'Body' || Math.random() > 0.3) {
              const rand = valid[Math.floor(Math.random() * valid.length)];
              initialParts[cat] = rand.url;
            } else {
              initialParts[cat] = 'none';
            }
          }
        });

        setSelectedParts(initialParts);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching DIY metadata:', err);
        if (mounted) setLoading(false);
      }
    };

    fetchMetadata();

    return () => {
      mounted = false;
    };
  }, []);

  // Select a part
  const selectPart = (category: CategoryType, src: string) => {
    setSelectedParts((prev) => ({
      ...prev,
      [category]: src,
    }));
  };

  // Switch Series
  const setActiveSeriesHandler = (series: SeriesType) => {
    setActiveSeries(series);
    if (!SERIES_COMPONENTS[series].includes(activeCategory)) {
      setActiveCategory('Body');
    }

    // Reset selected parts for this series
    setSelectedParts({
      Body: '',
      Earring: '',
      Eyes: '',
      Head: '',
    });
  };

  // Randomize (Ported 1:1 from original randomize function)
  const randomize = () => {
    const newParts: Record<CategoryType, string> = {
      Body: '',
      Earring: '',
      Eyes: '',
      Head: '',
    };

    SERIES_COMPONENTS[activeSeries].forEach((category) => {
      const parts = components[activeSeries][category];
      if (parts && parts.length > 0) {
        const validParts = parts.filter((item) => item.url !== 'none');
        const useNone = ['Earring', 'Eyes'].includes(category) && Math.random() < 0.2;

        if (!useNone && validParts.length > 0) {
          const randomIndex = Math.floor(Math.random() * validParts.length);
          newParts[category] = validParts[randomIndex].url;
        } else if (useNone) {
          newParts[category] = 'none';
        } else if (validParts.length > 0) {
          const randomIndex = Math.floor(Math.random() * validParts.length);
          newParts[category] = validParts[randomIndex].url;
        }
      }
    });

    setSelectedParts(newParts);
    onToast('🎲 随机搭配完成！', `已为 ${activeSeries.toUpperCase()} 系列随机生成外观`, 'info');
  };

  // Auto Background
  const setAutoBgColor = () => {
    const bodyUrl = selectedParts.Body;
    if (!bodyUrl || bodyUrl === 'none') {
      onToast('请先选择身体部件', '无法匹配底色', 'error');
      return;
    }

    const filename = bodyUrl.split('/').pop()?.replace('.png', '').toLowerCase() || '';
    for (const [key, color] of Object.entries(BODY_COLORS)) {
      if (filename.includes(key.toLowerCase())) {
        setBgColor(color);
        onToast('自动背景设置完成！', `匹配颜色: ${color}`, 'success');
        return;
      }
    }
    setBgColor('transparent');
    onToast('未找到匹配背景色', '已设为透明', 'info');
  };

  // Save Avatar (Ported 1:1 from original saveAvatar function)
  const saveAvatar = async () => {
    setSaving(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      const OUTPUT_SIZE = 1008;
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      ctx.imageSmoothingEnabled = false;

      // Draw background
      if (bgColor && bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      }

      // Draw layers in order: Body -> Earring -> Eyes -> Head
      for (const category of CATEGORIES) {
        const imgSrc = selectedParts[category];
        if (imgSrc && imgSrc !== 'none') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load ${category}`));
            img.src = imgSrc;
          });
          ctx.drawImage(img, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        }
      }

      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob creation failed');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `avatar-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);

        onToast('头像保存成功！', '已导出 1008px 原版高清无损 PNG 头像', 'success');
        setSaving(false);
      }, 'image/png');
    } catch (err: any) {
      console.error('Save failed:', err);
      onToast('保存失败', err.message || '请重试', 'error');
      setSaving(false);
    }
  };

  const currentParts = components[activeSeries][activeCategory] || [];

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
          100% 还原原版全部 5 大系列真实图层，支持身体、耳环、眼睛、头部自由拼装与高清导出。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Original 4-Layer DOM Preview & Action Buttons */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            
            {/* ⭐️ EXACT Original Preview Container with 4 stacked <img> tags */}
            <div 
              className="relative w-full aspect-square rounded-2xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center transition-colors"
              style={{ backgroundColor: bgColor }}
            >
              {/* Checkerboard Pattern for transparent bg */}
              {bgColor === 'transparent' && (
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
              )}

              {/* Layer 1: Body */}
              {selectedParts.Body && selectedParts.Body !== 'none' && (
                <img
                  src={selectedParts.Body}
                  alt="Body Layer"
                  className="absolute inset-0 w-full h-full object-contain pixelated pointer-events-none z-10"
                />
              )}

              {/* Layer 2: Earring */}
              {selectedParts.Earring && selectedParts.Earring !== 'none' && (
                <img
                  src={selectedParts.Earring}
                  alt="Earring Layer"
                  className="absolute inset-0 w-full h-full object-contain pixelated pointer-events-none z-20"
                />
              )}

              {/* Layer 3: Eyes */}
              {selectedParts.Eyes && selectedParts.Eyes !== 'none' && (
                <img
                  src={selectedParts.Eyes}
                  alt="Eyes Layer"
                  className="absolute inset-0 w-full h-full object-contain pixelated pointer-events-none z-30"
                />
              )}

              {/* Layer 4: Head */}
              {selectedParts.Head && selectedParts.Head !== 'none' && (
                <img
                  src={selectedParts.Head}
                  alt="Head Layer"
                  className="absolute inset-0 w-full h-full object-contain pixelated pointer-events-none z-40"
                />
              )}

              {loading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-50">
                  <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                  <span className="text-xs font-mono text-slate-300">正在加载官方组件...</span>
                </div>
              )}

              <div className="absolute top-3 left-3 z-50 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeSeries.toUpperCase()} SERIES</span>
              </div>
            </div>

            {/* Quick Actions (Save & Randomize) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={randomize}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all shadow-md active:scale-95"
              >
                <Shuffle className="w-4 h-4 text-emerald-400" />
                <span>🎲 随机搭配</span>
              </button>

              <button
                type="button"
                onClick={saveAvatar}
                disabled={loading || saving}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{saving ? '正在保存...' : '💾 保存头像'}</span>
              </button>
            </div>

            {/* Background Selector Buttons */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                背景底色配置
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setBgColor('transparent')}
                  className={clsx(
                    'py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center',
                    bgColor === 'transparent'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  无背景
                </button>

                <button
                  type="button"
                  onClick={() => setBgColor('#F97316')}
                  className={clsx(
                    'py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center',
                    bgColor === '#F97316'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  橙色背景
                </button>

                <button
                  type="button"
                  onClick={setAutoBgColor}
                  className={clsx(
                    'py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  自动背景
                </button>

                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className={clsx(
                    'py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center',
                    bgColor !== 'transparent' && bgColor !== '#F97316'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  自选颜色
                </button>

                <input
                  ref={colorInputRef}
                  type="color"
                  value={bgColor === 'transparent' ? '#000000' : bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Series Buttons */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                系列切换 (Series)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {SERIES_BUTTONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSeriesHandler(s.id)}
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

        {/* Right Side: Category Tabs & Trait Parts Grid */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col min-h-[580px]">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 mb-4">
            {CATEGORIES.map((cat) => {
              const isSupported = SERIES_COMPONENTS[activeSeries].includes(cat);
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => isSupported && setActiveCategory(cat)}
                  disabled={!isSupported}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center',
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

          {/* Parts Grid (Ported 1:1 from original updatePartsGrid) */}
          <div className="flex-1 overflow-y-auto max-h-[480px] pr-1">
            {!SERIES_COMPONENTS[activeSeries].includes(activeCategory) ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm font-mono">
                {activeSeries.toUpperCase()} 系列不支持 {activeCategory} 组件
              </div>
            ) : currentParts.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm font-mono">
                正在加载组件...
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                {currentParts.map((part) => {
                  const isSelected = selectedParts[activeCategory] === part.url;
                  const isNone = part.url === 'none';

                  return (
                    <div
                      key={part.value}
                      onClick={() => selectPart(activeCategory, part.url)}
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
