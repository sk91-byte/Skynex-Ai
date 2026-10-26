import React from 'react';
import { BrandId } from '../types.ts';
import { Shield, Sparkles, RefreshCw, HelpCircle, Layers, History, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentBrand: BrandId;
  onBrandChange: (brand: BrandId) => void;
  activeTab: 'review' | 'knowledge' | 'history' | 'insights' | 'help';
  onTabChange: (tab: 'review' | 'knowledge' | 'history' | 'insights' | 'help') => void;
  onTrySample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBrand,
  onBrandChange,
  activeTab,
  onTabChange,
  onTrySample
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Wordmark & Canonical Brand Switcher */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                  SkyNex AI
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  Brand Governance
                </span>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Brand Switcher Segmented Control */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => onBrandChange('aerosip')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  currentBrand === 'aerosip'
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AeroSip <span className="text-[10px] font-normal text-slate-500 ml-0.5">(Canonical)</span>
              </button>
              <button
                type="button"
                onClick={() => onBrandChange('novapay')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  currentBrand === 'novapay'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                NovaPay <span className="text-[10px] font-normal text-slate-500 ml-0.5">(Fintech)</span>
              </button>
            </div>
          </div>

          {/* Zone 2: Main Navigation Links (PRD Section 5) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => onTabChange('review')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === 'review'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Review Content
            </button>
            <button
              type="button"
              onClick={() => onTabChange('knowledge')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === 'knowledge'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Brand Knowledge
            </button>
            <button
              type="button"
              onClick={() => onTabChange('history')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Review History
            </button>
            <button
              type="button"
              onClick={() => onTabChange('insights')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'insights'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>Manager Insights</span>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-mono px-1 py-0.2 rounded font-bold">
                Loop
              </span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('help')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === 'help'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Help & Privacy
            </button>
          </nav>

          {/* Zone 3: Primary Action ("Try sample draft") */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onTrySample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Try Sample Draft</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
