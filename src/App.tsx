import React, { useState, useEffect, useCallback } from 'react';
import type { TabType, Monke, ToastMessage } from './types';
import { fetchMonkes } from './utils/api';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MonkesExplorer } from './components/explorer/MonkesExplorer';
import { GifStudio } from './components/gif/GifStudio';
import { DiyStudio } from './components/diy/DiyStudio';
import { SantaStudio } from './components/santa/SantaStudio';
import { ToastContainer } from './components/ui/Toast';

export const App: React.FC = () => {
  // Sync tab and ID with URL Search Params
  const getInitialTab = (): TabType => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as TabType;
    if (['explorer', 'gif', 'diy', 'santa'].includes(tab)) {
      return tab;
    }
    return 'explorer';
  };

  const getInitialMonkeId = (): number => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id') || '209', 10);
    return isNaN(id) || id < 1 || id > 10000 ? 209 : id;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [targetMonkeId, setTargetMonkeId] = useState<number>(getInitialMonkeId);
  const [monkes, setMonkes] = useState<Monke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Update URL parameters without reloading
  const handleTabChange = useCallback((tab: TabType, id?: number) => {
    setActiveTab(tab);
    if (id !== undefined) {
      setTargetMonkeId(id);
    }
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    if (id !== undefined) {
      params.set('id', String(id));
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, []);

  const addToast = useCallback((title: string, description?: string, type?: 'success' | 'info' | 'warning' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Monkes metadata on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMonkes();
        setMonkes(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load NodeMonkes:', err);
        setError('Failed to fetch NodeMonkes data. Please refresh or try again later.');
        addToast('Network Warning', 'Could not load live metadata, check connection.', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast]);

  const handleOpenInGif = (id: number) => {
    handleTabChange('gif', id);
    addToast('Loaded Monke in GIF Studio', `Monke #${id} ready to animate.`, 'info');
  };

  const handleOpenInSanta = (id: number) => {
    handleTabChange('santa', id);
    addToast('Loaded Monke in Santa Edition', `Monke #${id} festive view.`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        totalMonkes={monkes.length || 10000}
        onQuickSearchClick={() => handleTabChange('explorer')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg font-mono text-xs font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab 1: Explorer */}
        {activeTab === 'explorer' && (
          <div className="animate-in fade-in duration-300">
            <MonkesExplorer
              monkes={monkes}
              loading={loading}
              onOpenInGif={handleOpenInGif}
              onOpenInSanta={handleOpenInSanta}
              onToast={addToast}
            />
          </div>
        )}

        {/* Tab 2: GIF Studio */}
        {activeTab === 'gif' && (
          <div className="animate-in fade-in duration-300">
            <GifStudio
              initialMonkeId={targetMonkeId}
              monkes={monkes}
              onToast={addToast}
            />
          </div>
        )}

        {/* Tab 3: DIY Studio */}
        {activeTab === 'diy' && (
          <div className="animate-in fade-in duration-300">
            <DiyStudio onToast={addToast} />
          </div>
        )}

        {/* Tab 4: Santa Monkes */}
        {activeTab === 'santa' && (
          <div className="animate-in fade-in duration-300">
            <SantaStudio
              initialMonkeId={targetMonkeId}
              monkes={monkes}
              onOpenInGif={handleOpenInGif}
              onToast={addToast}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Global Toast System */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
};
