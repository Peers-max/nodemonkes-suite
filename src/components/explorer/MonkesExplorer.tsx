import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon, 
  Sparkles, 
  Gift, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Monke } from '../../types';
import { getMonkeImageUrl } from '../../utils/api';
import { ALL_BODY_TYPES } from '../../utils/constants';
import { TraitBadge } from '../ui/Badge';
import { MonkeDetailModal } from './MonkeDetailModal';
import { useLanguage } from '../../utils/i18n';

interface MonkesExplorerProps {
  monkes: Monke[];
  loading: boolean;
  onOpenInGif: (monkeId: number) => void;
  onOpenInSanta: (monkeId: number) => void;
  onToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;
}

type ViewMode = 'grid' | 'table';
type SortField = 'rank' | 'id' | 'inscription' | 'block';
type SortOrder = 'asc' | 'desc';

export const MonkesExplorer: React.FC<MonkesExplorerProps> = ({
  monkes,
  loading,
  onOpenInGif,
  onOpenInSanta,
  onToast,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBody, setSelectedBody] = useState('all');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(48);
  const [jumpPageInput, setJumpPageInput] = useState('');

  const [activeModalMonke, setActiveModalMonke] = useState<Monke | null>(null);
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

    // Sort (skip if already in default rank-ascending order)
    if (sortField !== 'rank' || sortOrder !== 'asc') {
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
    }

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    onToast(t.modalCopySuccess, `Script PubKey for #${id} copied.`, 'success');
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
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                {t.clearSearch}
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
                    {b === 'all' ? t.allBodies : b}
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
                <option value="rank" className="bg-slate-900">{t.sortRank}</option>
                <option value="id" className="bg-slate-900">{t.sortId}</option>
                <option value="inscription" className="bg-slate-900">Sort by Inscription</option>
                <option value="block" className="bg-slate-900">Sort by Block</option>
              </select>
              <button
                onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                title={sortOrder === 'asc' ? t.orderAsc : t.orderDesc}
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
                title={t.viewGrid}
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
                title={t.viewTable}
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Stats & Summary Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
          <div>
            {t.totalFound} <span className="text-white font-semibold">{filteredAndSortedMonkes.length.toLocaleString()}</span> /{' '}
            <span className="text-white font-semibold">{monkes.length.toLocaleString()}</span> NodeMonkes
            {selectedBody !== 'all' && (
              <span className="ml-2 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Body: {selectedBody}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>{t.perPage}:</span>
            {[24, 48, 96].map((num) => (
              <button
                key={num}
                onClick={() => setItemsPerPage(num)}
                className={clsx(
                  'px-2 py-0.5 rounded-md text-xs transition-colors',
                  itemsPerPage === num
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Content: Grid or Table View */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-slate-900/60 animate-pulse border border-white/5 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800/80" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedMonkes.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Info className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">{t.noResults}</h3>
          <p className="text-sm text-slate-400">Try changing your search keywords or resetting filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* Grid Mode */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {paginatedMonkes.map((monke) => {
            const attrs = monke.attributes;
            return (
              <div
                key={monke.id}
                onClick={() => setActiveModalMonke(monke)}
                className="group glass-panel rounded-2xl p-2.5 sm:p-3 border border-white/5 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Box */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 mb-2.5">
                  <img
                    src={getMonkeImageUrl(monke.id)}
                    alt={`NodeMonke #${monke.id}`}
                    loading="lazy"
                    className="w-full h-full object-contain pixelated group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Rank Badge */}
                  {monke.rank && (
                    <div className="absolute top-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-amber-300 border border-white/10">
                        #{monke.rank}
                      </span>
                    </div>
                  )}

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInGif(monke.id);
                      }}
                      title={t.actionMakeGif}
                      className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:scale-110 transition-transform shadow-lg"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInSanta(monke.id);
                      }}
                      title={t.actionSanta}
                      className="p-2 rounded-xl bg-rose-500 text-white hover:scale-110 transition-transform shadow-lg"
                    >
                      <Gift className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ID & Inscription Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-100">
                      #{monke.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      #{monke.inscription}
                    </span>
                  </div>

                  {/* Traits Badges */}
                  <div className="flex flex-wrap gap-1">
                    {attrs.Body && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-sans border border-white/5 truncate max-w-full">
                        {attrs.Body}
                      </span>
                    )}
                    {attrs.Head && attrs.Head !== 'None' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-sans border border-amber-500/20 truncate max-w-full">
                        {attrs.Head}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (

        /* Table Mode */
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 border-b border-white/10 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">{t.tableThImage}</th>
                  <th className="py-3 px-4">{t.tableThRank}</th>
                  <th className="py-3 px-4">{t.tableThId}</th>
                  <th className="py-3 px-4">{t.tableThInscription}</th>
                  <th className="py-3 px-4">{t.tableThTraits}</th>
                  <th className="py-3 px-4 text-right">{t.tableThActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {paginatedMonkes.map((monke) => {
                  const attrs = monke.attributes;
                  return (
                    <tr 
                      key={monke.id}
                      onClick={() => setActiveModalMonke(monke)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={getMonkeImageUrl(monke.id)}
                            alt={`NodeMonke #${monke.id}`}
                            className="w-full h-full object-contain pixelated group-hover:scale-110 transition-transform"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-amber-400">
                        #{monke.rank || '-'}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-white">
                        #{monke.id}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">
                        #{monke.inscription}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-w-xl">
                          <TraitBadge label="Body" value={attrs.Body} percentage={attrs.BodyCount ? (attrs.BodyCount / 10000) * 100 : undefined} />
                          <TraitBadge label="Head" value={attrs.Head || 'None'} percentage={attrs.HeadCount ? (attrs.HeadCount / 10000) * 100 : undefined} />
                          <TraitBadge label="Eyes" value={attrs.Eyes || 'None'} percentage={attrs.EyesCount ? (attrs.EyesCount / 10000) * 100 : undefined} />
                          <TraitBadge label="Earring" value={attrs.Earring || 'None'} percentage={attrs.EarringCount ? (attrs.EarringCount / 10000) * 100 : undefined} />
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onOpenInGif(monke.id)}
                            title={t.actionMakeGif}
                            className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenInSanta(monke.id)}
                            title={t.actionSanta}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            <Gift className="w-3.5 h-3.5" />
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
      {totalPages > 1 && (
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-xl">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.prevPage}</span>
            </button>

            <span className="text-slate-400">
              Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <span>{t.nextPage}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to Page */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
            <span className="text-slate-400">{t.jumpTo}</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={`${currentPage}`}
              className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-center text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              Go
            </button>
          </form>

        </div>
      )}

      {/* Detail Modal */}
      <MonkeDetailModal
        monke={activeModalMonke}
        onClose={() => setActiveModalMonke(null)}
        onOpenInGif={onOpenInGif}
        onOpenInSanta={onOpenInSanta}
        onCopyPubkey={(text) => activeModalMonke && handleCopyPubkey(text, activeModalMonke.id)}
      />

    </div>
  );
};
