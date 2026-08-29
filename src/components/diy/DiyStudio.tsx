import React, { useState, useRef, useEffect } from 'react';
import { Paintbrush, Download, Shuffle, RotateCcw, Copy, Check, Layers, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { BODY_COLORS, PRESET_COLORS } from '../../utils/constants';

interface DiyStudioProps {
  onToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

// Built-in Modular Traits Options
const DIY_BODIES = [
  { id: 'gold', name: 'Gold', color: '#FFAA01' },
  { id: 'alien', name: 'Alien', color: '#04CFE7' },
  { id: 'pepe', name: 'Pepe', color: '#127602' },
  { id: 'albino', name: 'Albino', color: '#BDADAD' },
  { id: 'pink', name: 'Pink', color: '#E944CE' },
  { id: 'dark', name: 'Dark', color: '#482510' },
  { id: 'deathbot', name: 'Deathbot', color: '#282831' },
  { id: 'zombie', name: 'Zombie', color: '#104119' },
  { id: 'dos', name: 'DOS', color: '#0002A5' },
  { id: 'white', name: 'White', color: '#C7BCB6' },
];

const DIY_HEADS = [
  { id: 'none', name: 'None (Clean)' },
  { id: 'crown', name: 'Golden Crown' },
  { id: 'terminal', name: 'Terminal Cap' },
  { id: 'bandana', name: 'Pirate Bandana' },
  { id: 'halo', name: 'Angel Halo' },
  { id: 'tophat', name: 'Gentleman Top Hat' },
  { id: 'santa', name: 'Santa Festive Hat' },
  { id: 'ninja', name: 'Ninja Headband' },
];

const DIY_EYES = [
  { id: 'normal', name: 'Classic Pixel Eyes' },
  { id: 'deathbot', name: 'Red Laser Deathbot' },
  { id: 'vr', name: 'Cyber VR Goggles' },
  { id: '3d', name: 'Retro 3D Glasses' },
  { id: 'sunglasses', name: 'Black Shades' },
  { id: 'cyclops', name: 'Cyclops Visor' },
];

const DIY_EARRINGS = [
  { id: 'none', name: 'None' },
  { id: 'gold', name: 'Gold Hoop' },
  { id: 'silver', name: 'Silver Stud' },
  { id: 'cross', name: 'Holy Cross' },
  { id: 'diamond', name: 'Diamond Sparkle' },
];

export const DiyStudio: React.FC<DiyStudioProps> = ({ onToast }) => {
  const [selectedBody, setSelectedBody] = useState('gold');
  const [selectedHead, setSelectedHead] = useState('crown');
  const [selectedEyes, setSelectedEyes] = useState('deathbot');
  const [selectedEarring, setSelectedEarring] = useState('gold');
  const [bgColor, setBgColor] = useState('#0A0D14');
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render Canvas Composite
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Base Monke Silhouette with selected color
    const bodyColor = BODY_COLORS[selectedBody] || '#FFAA01';
    
    // Draw stylized pixel monke on canvas (28x28 grid scaled up to 280x280)
    const pixelSize = 10;
    ctx.imageSmoothingEnabled = false;

    // Head/Body Shape (Classic 28x28 Monke Template)
    ctx.fillStyle = bodyColor;
    
    // Body Block
    ctx.fillRect(6 * pixelSize, 8 * pixelSize, 16 * pixelSize, 16 * pixelSize);
    ctx.fillRect(4 * pixelSize, 11 * pixelSize, 20 * pixelSize, 10 * pixelSize);
    
    // Ears
    ctx.fillRect(3 * pixelSize, 12 * pixelSize, 2 * pixelSize, 4 * pixelSize);
    ctx.fillRect(23 * pixelSize, 12 * pixelSize, 2 * pixelSize, 4 * pixelSize);

    // Snout / Face Accent
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(8 * pixelSize, 14 * pixelSize, 12 * pixelSize, 8 * pixelSize);

    // 3. Eyes Layer
    if (selectedEyes === 'deathbot') {
      ctx.fillStyle = '#FF0033'; // Bright Red Laser Eyes
      ctx.fillRect(9 * pixelSize, 12 * pixelSize, 4 * pixelSize, 2 * pixelSize);
      ctx.fillRect(15 * pixelSize, 12 * pixelSize, 4 * pixelSize, 2 * pixelSize);
    } else if (selectedEyes === 'vr') {
      ctx.fillStyle = '#00F0FF'; // Cyberpunk Cyan Visor
      ctx.fillRect(8 * pixelSize, 11 * pixelSize, 12 * pixelSize, 4 * pixelSize);
      ctx.fillStyle = '#FF0055';
      ctx.fillRect(10 * pixelSize, 12 * pixelSize, 2 * pixelSize, 2 * pixelSize);
      ctx.fillRect(16 * pixelSize, 12 * pixelSize, 2 * pixelSize, 2 * pixelSize);
    } else if (selectedEyes === '3d') {
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(9 * pixelSize, 12 * pixelSize, 3 * pixelSize, 2 * pixelSize);
      ctx.fillStyle = '#00FFFF';
      ctx.fillRect(16 * pixelSize, 12 * pixelSize, 3 * pixelSize, 2 * pixelSize);
    } else if (selectedEyes === 'sunglasses') {
      ctx.fillStyle = '#050505';
      ctx.fillRect(8 * pixelSize, 11 * pixelSize, 12 * pixelSize, 3 * pixelSize);
      ctx.fillRect(10 * pixelSize, 14 * pixelSize, 3 * pixelSize, 1 * pixelSize);
      ctx.fillRect(15 * pixelSize, 14 * pixelSize, 3 * pixelSize, 1 * pixelSize);
    } else {
      // Classic pixel eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(10 * pixelSize, 12 * pixelSize, 2 * pixelSize, 2 * pixelSize);
      ctx.fillRect(16 * pixelSize, 12 * pixelSize, 2 * pixelSize, 2 * pixelSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(10 * pixelSize, 12 * pixelSize, 1 * pixelSize, 1 * pixelSize);
      ctx.fillRect(16 * pixelSize, 12 * pixelSize, 1 * pixelSize, 1 * pixelSize);
    }

    // 4. Head Wear Layer
    if (selectedHead === 'crown') {
      ctx.fillStyle = '#FFD700'; // Gold Crown
      ctx.fillRect(8 * pixelSize, 4 * pixelSize, 12 * pixelSize, 4 * pixelSize);
      ctx.clearRect(10 * pixelSize, 4 * pixelSize, 2 * pixelSize, 2 * pixelSize);
      ctx.clearRect(16 * pixelSize, 4 * pixelSize, 2 * pixelSize, 2 * pixelSize);
      ctx.fillStyle = '#FF0000'; // Ruby Gem in crown
      ctx.fillRect(13 * pixelSize, 6 * pixelSize, 2 * pixelSize, 2 * pixelSize);
    } else if (selectedHead === 'terminal') {
      ctx.fillStyle = '#111111'; // Black Terminal Cap
      ctx.fillRect(6 * pixelSize, 6 * pixelSize, 16 * pixelSize, 3 * pixelSize);
      ctx.fillRect(4 * pixelSize, 8 * pixelSize, 20 * pixelSize, 2 * pixelSize);
      ctx.fillStyle = '#00FF66'; // Prompt >_
      ctx.fillRect(8 * pixelSize, 7 * pixelSize, 2 * pixelSize, 1 * pixelSize);
    } else if (selectedHead === 'santa') {
      ctx.fillStyle = '#D32F2F'; // Santa Red Hat
      ctx.fillRect(7 * pixelSize, 4 * pixelSize, 14 * pixelSize, 4 * pixelSize);
      ctx.fillRect(17 * pixelSize, 2 * pixelSize, 4 * pixelSize, 3 * pixelSize);
      ctx.fillStyle = '#FFFFFF'; // White Fur Trim & Ball
      ctx.fillRect(6 * pixelSize, 7 * pixelSize, 16 * pixelSize, 2 * pixelSize);
      ctx.fillRect(20 * pixelSize, 2 * pixelSize, 3 * pixelSize, 3 * pixelSize);
    } else if (selectedHead === 'bandana') {
      ctx.fillStyle = '#9C27B0';
      ctx.fillRect(6 * pixelSize, 7 * pixelSize, 16 * pixelSize, 3 * pixelSize);
    } else if (selectedHead === 'halo') {
      ctx.fillStyle = '#FFEB3B';
      ctx.fillRect(8 * pixelSize, 2 * pixelSize, 12 * pixelSize, 2 * pixelSize);
    }

    // 5. Earring Layer
    if (selectedEarring === 'gold') {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(3 * pixelSize, 15 * pixelSize, 2 * pixelSize, 2 * pixelSize);
    } else if (selectedEarring === 'silver') {
      ctx.fillStyle = '#E0E0E0';
      ctx.fillRect(3 * pixelSize, 15 * pixelSize, 2 * pixelSize, 2 * pixelSize);
    } else if (selectedEarring === 'cross') {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(3 * pixelSize, 14 * pixelSize, 2 * pixelSize, 4 * pixelSize);
      ctx.fillRect(2 * pixelSize, 15 * pixelSize, 4 * pixelSize, 1 * pixelSize);
    }

  }, [selectedBody, selectedHead, selectedEyes, selectedEarring, bgColor]);

  const handleRandomize = () => {
    const randomBody = DIY_BODIES[Math.floor(Math.random() * DIY_BODIES.length)].id;
    const randomHead = DIY_HEADS[Math.floor(Math.random() * DIY_HEADS.length)].id;
    const randomEyes = DIY_EYES[Math.floor(Math.random() * DIY_EYES.length)].id;
    const randomEarring = DIY_EARRINGS[Math.floor(Math.random() * DIY_EARRINGS.length)].id;

    setSelectedBody(randomBody);
    setSelectedHead(randomHead);
    setSelectedEyes(randomEyes);
    setSelectedEarring(randomEarring);
    onToast('Randomized!', 'Created new unique DIY NodeMonke', 'info');
  };

  const handleReset = () => {
    setSelectedBody('gold');
    setSelectedHead('crown');
    setSelectedEyes('deathbot');
    setSelectedEarring('gold');
    setBgColor('#0A0D14');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res 560x560 export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 560;
    exportCanvas.height = 560;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      exportCtx.imageSmoothingEnabled = false;
      exportCtx.drawImage(canvas, 0, 0, 560, 560);
    }

    const a = document.createElement('a');
    a.href = exportCanvas.toDataURL('image/png');
    a.download = `diy-nodemonke-${selectedBody}-${selectedHead}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onToast('Downloaded!', 'Saved High-Res DIY Monke PNG', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-semibold">
          <Paintbrush className="w-3.5 h-3.5" />
          <span>NODEMONKES DIY AVATAR STUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create & Customize Your Custom Monke
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto font-sans">
          Mix and match legendary pixel traits, colors, crowns, laser eyes, and accessories with real-time Canvas rendering.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Live Canvas Preview & Quick Action Bar */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="relative w-full aspect-square max-w-md rounded-3xl glass-panel p-6 flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden group">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="w-full h-full object-contain pixelated relative z-10 filter drop-shadow-2xl"
            />
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>CUSTOM CANVAS COMPOSITE</span>
            </div>
          </div>

          <div className="w-full max-w-md flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-mono text-xs font-bold transition-all shadow-md"
            >
              <Shuffle className="w-4 h-4" />
              <span>🎲 Randomize</span>
            </button>
            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="w-full max-w-md flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-purple-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res 560px PNG</span>
          </button>
        </div>

        {/* Right: Trait Customizers */}
        <div className="lg:col-span-7 space-y-5 glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
          
          {/* Trait 1: Body Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              1. Body Type & Fur
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DIY_BODIES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBody(b.id)}
                  className={clsx(
                    'p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all',
                    selectedBody === b.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: b.color }} />
                  <span className="truncate">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trait 2: Head Wear */}
          <div className="space-y-2 pt-3 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              2. Head Wear
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIY_HEADS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHead(h.id)}
                  className={clsx(
                    'p-2.5 rounded-xl border text-xs font-sans transition-all text-left truncate',
                    selectedHead === h.id
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold shadow-md'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trait 3: Eyes & Visors */}
          <div className="space-y-2 pt-3 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              3. Eyes & Visor
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DIY_EYES.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEyes(e.id)}
                  className={clsx(
                    'p-2.5 rounded-xl border text-xs font-sans transition-all text-left truncate',
                    selectedEyes === e.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trait 4: Earring */}
          <div className="space-y-2 pt-3 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              4. Earring & Accessories
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DIY_EARRINGS.map((ea) => (
                <button
                  key={ea.id}
                  onClick={() => setSelectedEarring(ea.id)}
                  className={clsx(
                    'p-2 rounded-xl border text-xs font-sans transition-all text-center truncate',
                    selectedEarring === ea.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  {ea.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trait 5: Background */}
          <div className="space-y-2 pt-3 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              5. Canvas Background Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setBgColor(c.value)}
                  className={clsx(
                    'w-7 h-7 rounded-lg border transition-transform',
                    bgColor.toLowerCase() === c.value.toLowerCase()
                      ? 'scale-110 ring-2 ring-purple-400 border-white'
                      : 'border-white/20 hover:scale-105'
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
