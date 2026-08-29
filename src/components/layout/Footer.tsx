import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#080B10] py-8 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white tracking-tight">NODEMONKES SUITE</span>
          <span>•</span>
          <span>All-in-One Ordinals Hub</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://magiceden.io/ordinals/marketplace/nodemonkes"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <span>Magic Eden</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/Peers-max/nodemonkes-suite"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Source Code</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          100% Client-Side Inscriptions Studio • 2026
        </div>

      </div>
    </footer>
  );
};
