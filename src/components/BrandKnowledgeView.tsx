import React, { useState } from 'react';
import { BrandProfile, GuidelineRule, ProductFact, ProhibitedTerm } from '../types.ts';
import { BookOpen, Search, ShieldCheck, DollarSign, Plus, CheckCircle2, Tag, FileText, Check } from 'lucide-react';

interface BrandKnowledgeViewProps {
  brand: BrandProfile;
  onRuleAdded?: () => void;
}

export const BrandKnowledgeView: React.FC<BrandKnowledgeViewProps> = ({ brand, onRuleAdded }) => {
  const [activeSubTab, setActiveSubTab] = useState<'guidelines' | 'facts' | 'prohibited' | 'terms'>('guidelines');
  const [searchQuery, setSearchQuery] = useState('');

  // Add rule modal state
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Terminology' | 'Pricing & Facts' | 'Regulatory & Claims' | 'Tone of Voice' | 'Performance Claims'>('Terminology');
  const [newRuleText, setNewRuleText] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [newSeverity, setNewSeverity] = useState<'critical' | 'warning' | 'info'>('warning');
  const [newCitation, setNewCitation] = useState('');
  const [newSourceLabel, setNewSourceLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState('');

  const filteredGuidelines = brand.guidelines.filter(g =>
    g.rule.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.citation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFacts = brand.facts.filter(f =>
    f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.approvedValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.context.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProhibited = brand.prohibitedTerms.filter(p =>
    p.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.suggestedAlternative.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRuleText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/brands/${brand.id}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory,
          title: newTitle,
          rule: newRuleText,
          rationale: newRationale,
          severity: newSeverity,
          citation: newCitation || `${newTitle} (v1.0)`,
          sourceLabel: newSourceLabel || 'Admin Policy Form'
        })
      });

      if (res.ok) {
        setAddSuccessMsg('New approved rule registered and activated!');
        setTimeout(() => {
          setIsAddRuleOpen(false);
          setAddSuccessMsg('');
          setNewTitle('');
          setNewRuleText('');
          setNewRationale('');
          setNewCitation('');
          setNewSourceLabel('');
          if (onRuleAdded) onRuleAdded();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to add rule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-800" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {brand.name} Approved Knowledge Base
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Single Source of Truth · <span className="font-semibold text-slate-700">{brand.industry}</span> · {brand.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rules, facts, prices..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-800"
              />
            </div>

            {/* Add Rule Button (PRD Section 6.4) */}
            <button
              type="button"
              onClick={() => setIsAddRuleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('guidelines')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'guidelines'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Guidelines & Policies ({brand.guidelines.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('facts')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'facts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Commercial Rate Card & Facts ({brand.facts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('prohibited')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'prohibited'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Prohibited Lexicon ({brand.prohibitedTerms.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('terms')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSubTab === 'terms'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved Terminology ({brand.approvedTerms.length})
          </button>
        </div>
      </div>

      {/* Guidelines Tab */}
      {activeSubTab === 'guidelines' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Authoritative Active Guidelines ({filteredGuidelines.length})
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Only Active rules are used as authoritative checks
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredGuidelines.map(g => (
              <div key={g.id} className="p-4.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{g.id}</span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {g.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                        g.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {g.severity}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.5 rounded">
                      ACTIVE v{g.version}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {g.citation}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{g.title || g.rule}</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-1">{g.rule}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{g.rationale}</p>
                {g.sourceLabel && (
                  <div className="text-[10px] text-slate-400 font-mono mt-2">
                    Source Document: {g.sourceLabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facts & Pricing Tab */}
      {activeSubTab === 'facts' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Verified Product Facts & Pricing Matrix
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Source of truth for numerical claims
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {filteredFacts.map(f => (
              <div key={f.id} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400">{f.id}</span>
                  <span className="text-xs text-slate-500 font-medium">Approved Value</span>
                </div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{f.key}</h4>
                <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {f.approvedValue}
                  {f.unit && <span className="text-xs font-normal text-slate-500 ml-1">{f.unit}</span>}
                </div>
                <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                  {f.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prohibited Terms Tab */}
      {activeSubTab === 'prohibited' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Prohibited Lexicon & Explicitly Banned Claims
            </span>
            <span className="text-xs text-slate-500">
              Deterministic hard-block terms
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredProhibited.map(p => (
              <div key={p.term} className="p-4.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      BANNED: "{p.term}"
                    </span>
                    <span className="text-xs text-slate-400 ml-2">Category: {p.category}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                    {p.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-2">
                  <span className="font-semibold text-slate-700">Reason for Ban: </span>
                  {p.explanation}
                </p>

                <div className="text-xs bg-emerald-50/70 border border-emerald-200 rounded-md p-2 text-emerald-900">
                  <span className="font-bold">Approved Alternative: </span>
                  <span>"{p.suggestedAlternative}"</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Terminology Tab */}
      {activeSubTab === 'terms' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Approved Terminology & Whitelist
            </span>
            <span className="text-xs text-slate-500">
              Verified vocabulary for creators
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {brand.approvedTerms.map(t => (
              <div key={t.term} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-bold text-slate-900">{t.term}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{t.context}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Rule Modal Form (PRD Section 6.4) */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddRuleSubmit}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Brand Administrator Portal
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Register New Active Rule ({brand.name})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRuleOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rule Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Trade Name Capitalization"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category:
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  >
                    <option value="Terminology">Terminology</option>
                    <option value="Pricing & Facts">Pricing & Facts</option>
                    <option value="Regulatory & Claims">Regulatory & Claims</option>
                    <option value="Performance Claims">Performance Claims</option>
                    <option value="Tone of Voice">Tone of Voice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Severity:
                  </label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  >
                    <option value="critical">Critical (Blocking)</option>
                    <option value="warning">Warning (Requires Review)</option>
                    <option value="info">Info / Advisory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Authoritative Rule Statement:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Exact rule text to verify against..."
                  value={newRuleText}
                  onChange={e => setNewRuleText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Compliance Rationale:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Legal trademark protection guidelines"
                  value={newRationale}
                  onChange={e => setNewRationale(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Citation:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manual 2026, Rule 1.4"
                    value={newCitation}
                    onChange={e => setNewCitation(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Source Reference:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Corporate Doc #881"
                    value={newSourceLabel}
                    onChange={e => setNewSourceLabel(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>

            {addSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{addSuccessMsg}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddRuleOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Registering...' : 'Save & Activate Rule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
