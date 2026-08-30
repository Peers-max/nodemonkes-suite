import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  Table as TableIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  ArrowUpDown,
  Filter,
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Monke, SortField, SortOrder, ViewMode } from '../../types';
import { getMonkeImageUrl } from '../../utils/api';
import { ALL_BODY_TYPES } from '../../utils/constants';
import { TraitBadge } from '../ui/Badge';
import { MonkeDetailModal } from './MonkeDetailModal';

interface MonkesExplorerProps {
  monkes: Monke[];
  loading: boolean;
  onOpenInGif: (id: number) => void;
  onOpenInSanta: (id: number) => void;
  onToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

export const MonkesExplorer: React.FC<MonkesExplorerProps> = ({
  monkes,
  loading,
  onOpenInGif,
  onOpenInSanta,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBody, setSelectedBody] = useState('all');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [selectedMonke, setSelectedMonke] = useState<Monke | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filter and Sort Pipeline
  const filteredAndSortedMonkes = useMemo(() => {
    let result = monkes;

    // Filter by search term (ID or Inscription)
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (m) =>
          String(m.id).includes(term) ||
          String(m.inscription).includes(term) ||
          m.attributes?.Body?.toLowerCase().includes(term) ||
          m.attributes?.Head?.toLowerCase().includes(term)
      );
    }

    // Filter by body
    if (selectedBody !== 'all') {
      result = result.filter(
        (m) => m.attributes?.Body?.toLowerCase() === selectedBody.toLowerCase()
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let valA = a[sortField] ?? 0;
      let valB = b[sortField] ?? 0;

      if (sortField === 'rank') {
        valA = a.rank ?? 99999;
        valB = b.rank ?? 99999;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [monkes, searchTerm, selectedBody, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedMonkes.length / itemsPerPage) || 1;

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBody, sortField, sortOrder, itemsPerPage]);

  // Current page slice
  const paginatedMonkes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMonkes.slice(start, start + itemsPerPage);
  }, [filteredAndSortedMonkes, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      handlePageChange(p);
      setJumpPageInput('');
    }
  };

  const handleCopyPubkey = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onToast('Copied to clipboard', `Script PubKey for #${id} copied.`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Control Bar: Filters, Search, Views */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Left: Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or Inscription #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right: Body Filter, Sort & View Mode */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Body Selector */}
            <div className="relative">
              <select
                value={selectedBody}
                onChange={(e) => setSelectedBody(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500/60 transition-all cursor-pointer"
              >
                {ALL_BODY_TYPES.map((b) => (
                  <option key={b} value={b} className="bg-slate-900 text-slate-100">
                    {b === 'all' ? 'All Body Types' : b}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center rounded-xl bg-slate-900/90 border border-white/10 p-0.5 text-xs">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="bg-transparent pl-2.5 pr-2 py-1.5 text-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="rank" className="bg-slate-900">Sort by Rank</option>
                <option value="id" className="bg-slate-900">Sort by ID</option>
                <option value="inscription" className="bg-slate-900">Sort by Inscription</option>
                <option value="block" className="bg-slate-900">Sort by Block</option>
              </select>
              <button
                onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                className="px-2 py-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View Mode Toggle (Grid / Table) */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={clsx(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                )}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Stats & Summary Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
          <div>
            Showing <span className="text-white font-semibold">{filteredAndSortedMonkes.length.toLocaleString()}</span> of{' '}
            <span className="text-white font-semibold">{monkes.length.toLocaleString()}</span> NodeMonkes
            {selectedBody !== 'all' && (
              <span className="ml-2 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Body: {selectedBody}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Per Page:</span>
            {[24, 48, 96].map((num) => (
              <button
                key={num}
                onClick={() => setItemsPerPage(num)}
                className={clsx(
                  'px-2 py-0.5 rounded transition-all',
                  itemsPerPage === num
                    ? 'bg-white/15 text-amber-400 font-bold'
                    : 'hover:text-white'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-800/40 rounded-2xl border border-white/5" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAndSortedMonkes.length === 0 && (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/5 space-y-3">
          <p className="text-slate-400 text-sm font-mono">No NodeMonkes matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedBody('all');
            }}
            className="px-4 py-2 rounded-xl text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* View 1: Grid Mode */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {paginatedMonkes.map((monke) => {
            const body = monke.attributes?.Body;
            return (
              <div
                key={monke.id}
                onClick={() => setSelectedMonke(monke)}
                className="group relative glass-card rounded-2xl p-3 flex flex-col justify-between cursor-pointer overflow-hidden"
              >
                {/* Rank Ribbon */}
                {monke.rank && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
                      #{monke.rank}
                    </span>
                  </div>
                )}

                {/* Monke Image */}
                <div className="relative aspect-square rounded-xl bg-black/40 overflow-hidden flex items-center justify-center p-2 mb-2.5">
                  <img
                    src={getMonkeImageUrl(monke.id)}
                    alt={`Monke #${monke.id}`}
                    loading="lazy"
                    className="w-full h-full object-contain pixelated transform group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity backdrop-blur-[2px]">
                    <span className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="space-y-1.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">#{monke.id}</span>
                    <span className="text-[11px] text-slate-400 font-sans">
                      {body}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                    <span>Ins #{monke.inscription}</span>
                    <span className="text-amber-400/80">4 Traits</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Table Mode */}
      {!loading && viewMode === 'table' && (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold"># ID</th>
                  <th className="py-3.5 px-4 font-semibold">PREVIEW</th>
                  <th className="py-3.5 px-4 font-semibold">TRAITS & RARITY BREAKDOWN</th>
                  <th className="py-3.5 px-4 font-semibold">RANK</th>
                  <th className="py-3.5 px-4 font-semibold">INSCRIPTION</th>
                  <th className="py-3.5 px-4 font-semibold">BLOCK</th>
                  <th className="py-3.5 px-4 font-semibold">SCRIPT PUBKEY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedMonkes.map((monke) => {
                  const attrs = monke.attributes;
                  const isCopied = copiedId === monke.id;

                  return (
                    <tr
                      key={monke.id}
                      onClick={() => setSelectedMonke(monke)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 sm:py-5 px-4 font-mono font-extrabold text-white text-base sm:text-lg">
                        #{monke.id}
                      </td>
                      <td className="py-4 sm:py-5 px-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/50 p-2 border border-white/10 flex items-center justify-center overflow-hidden shadow-md group-hover:border-amber-500/40 transition-all">
                          <img
                            src={getMonkeImageUrl(monke.id)}
                            alt={`#${monke.id}`}
                            loading="lazy"
                            className="w-full h-full object-contain pixelated transform group-hover:scale-115 transition-transform duration-200"
                          />
                        </div>
                      </td>
                      <td className="py-4 sm:py-5 px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-w-md">
                          <TraitBadge
                            label="Body"
                            value={attrs.Body}
                            percentage={attrs.BodyCount ? (attrs.BodyCount / 10000) * 100 : undefined}
                          />
                          <TraitBadge
                            label="Head"
                            value={attrs.Head || 'None'}
                            percentage={attrs.HeadCount ? (attrs.HeadCount / 10000) * 100 : undefined}
                          />
                          <TraitBadge
                            label="Eyes"
                            value={attrs.Eyes || 'None'}
                            percentage={attrs.EyesCount ? (attrs.EyesCount / 10000) * 100 : undefined}
                          />
                          <TraitBadge
                            label="Earring"
                            value={attrs.Earring || 'None'}
                            percentage={attrs.EarringCount ? (attrs.EarringCount / 10000) * 100 : undefined}
                          />
                        </div>
                      </td>
                      <td className="py-4 sm:py-5 px-4">
                        {monke.rank ? (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs shadow-sm">
                            #{monke.rank}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4 sm:py-5 px-4 text-slate-200 font-mono text-xs sm:text-sm font-semibold">
                        #{monke.inscription}
                      </td>
                      <td className="py-4 sm:py-5 px-4 text-slate-400 font-mono text-xs sm:text-sm">
                        {monke.block}
                      </td>
                      <td className="py-4 sm:py-5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono max-w-[160px] truncate bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                            {monke.scriptPubkey.slice(0, 16)}...{monke.scriptPubkey.slice(-8)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPubkey(monke.scriptPubkey, monke.id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400 border border-transparent hover:border-white/10 transition-colors"
                            title="Copy Script PubKey"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && filteredAndSortedMonkes.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-lg">
          <div className="text-slate-400">
            Page <span className="text-white font-bold">{currentPage}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 transition-all font-sans text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={totalPages}
                placeholder="Go to..."
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-16 px-2.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-center text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold transition-all"
              >
                Go
              </button>
            </form>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 transition-all font-sans text-xs font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Monke Detail Modal */}
      <MonkeDetailModal
        monke={selectedMonke}
        onClose={() => setSelectedMonke(null)}
        onOpenInGif={onOpenInGif}
        onOpenInSanta={onOpenInSanta}
        onCopyPubkey={(key) => handleCopyPubkey(key, selectedMonke?.id || 0)}
      />

    </div>
  );
};
