import React from 'react';
import { Search, Sparkles, Image as ImageIcon, Paintbrush, Gift, Github, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import type { TabType } from '../../types';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  totalMonkes?: number;
  onQuickSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  totalMonkes = 10000,
  onQuickSearchClick,
}) => {
  const tabs = [
    { id: 'explorer' as TabType, label: 'Explorer', icon: Search, badge: '10K' },
    { id: 'gif' as TabType, label: 'Make GIF', icon: Sparkles, badge: 'Studio' },
    { id: 'diy' as TabType, label: 'DIY Studio', icon: Paintbrush, badge: 'Creator' },
    { id: 'santa' as TabType, label: 'Santa Monkes', icon: Gift, badge: 'Special' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0A0D14]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div 
          onClick={() => onTabChange('explorer')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-amber-500/20 to-orange-500/20 p-0.5 border border-amber-500/30 group-hover:border-amber-500/60 transition-all shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]">
            <img 
              src="https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images/209.png" 
              alt="NodeMonkes"
              className="w-full h-full object-cover pixelated transform group-hover:scale-110 transition-transform" 
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-white font-sans">
                NODEMONKES
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                SUITE
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
              Bitcoin Ordinals • 10,000 Monkes
            </span>
          </div>
        </div>

        {/* Center: Module Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={clsx(
                  'relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                )}
              >
                <Icon className={clsx('w-4 h-4', isActive ? 'text-slate-950' : 'text-slate-400')} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/20 text-slate-950 font-mono font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Tools & Links */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onQuickSearchClick && (
            <button
              onClick={onQuickSearchClick}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search ID...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-900 rounded border border-white/10 font-mono text-slate-400">
                /
              </kbd>
            </button>
          )}

          <a
            href="https://github.com/Peers-max/nodemonkes-suite"
            target="_blank"
            rel="noreferrer"
            title="GitHub Repository"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-white/5 transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>

      </div>
    </header>
  );
};
