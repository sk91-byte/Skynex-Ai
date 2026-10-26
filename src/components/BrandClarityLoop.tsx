import React, { useState, useEffect } from 'react';
import { BrandProfile, RecurringPattern, BrandId } from '../types.ts';
import {
  AlertTriangle,
  RotateCw,
  Search,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  Sliders,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface BrandClarityLoopProps {
  brand: BrandProfile;
}

export const BrandClarityLoop: React.FC<BrandClarityLoopProps> = ({ brand }) => {
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [summary, setSummary] = useState({
    totalViolationsTracked: 0,
    activeAlerts: 0,
    underInvestigation: 0,
    resolvedCount: 0
  });
  const [selectedPattern, setSelectedPattern] = useState<RecurringPattern | null>(null);
  const [isInvestigatingModalOpen, setIsInvestigatingModalOpen] = useState(false);

  // Investigation form state
  const [rootCause, setRootCause] = useState<
    'unclear_rule' | 'outdated_reference' | 'training_needed' | 'tooling_gap'
  >('unclear_rule');
  const [rootCauseNotes, setRootCauseNotes] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchPatterns = async () => {
    try {
      const res = await fetch(`/api/clarity-loop?brandId=${brand.id}`);
      const data = await res.json();
      if (res.ok) {
        setPatterns(data.patterns || []);
        setSummary(data.summary || {});
        if (data.patterns && data.patterns.length > 0 && !selectedPattern) {
          setSelectedPattern(data.patterns[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch clarity patterns:', e);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [brand.id]);

  const handleOpenInvestigation = (pat: RecurringPattern) => {
    setSelectedPattern(pat);
    setRootCause(pat.rootCause || 'unclear_rule');
    setRootCauseNotes(pat.rootCauseNotes || '');
    setCorrectiveAction(pat.correctiveActionTaken || '');
    setActionSuccessMsg('');
    setIsInvestigatingModalOpen(true);
  };

  const handleSaveAction = async (status: 'investigating' | 'resolved') => {
    if (!selectedPattern) return;
    setIsSubmittingAction(true);

    try {
      const res = await fetch('/api/clarity-loop/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternId: selectedPattern.id,
          rootCause,
          rootCauseNotes: rootCauseNotes || 'Root cause identified and confirmed by brand manager.',
          correctiveAction: correctiveAction || 'Standardized guideline updated in Brand Portal.',
          newStatus: status
        })
      });

      if (res.ok) {
        setActionSuccessMsg(`Corrective action logged! Status marked as ${status}.`);
        setTimeout(() => {
          setIsInvestigatingModalOpen(false);
          setActionSuccessMsg('');
        }, 1200);
        fetchPatterns();
      }
    } catch (e) {
      console.error('Failed to submit corrective action:', e);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner & 6-Stage Narrative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-slate-800" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Brand Clarity Loop™
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Turn repeated brand mistakes into systemic improvements. SkyNex AI monitors findings across drafts, surfaces recurring violations to managers, facilitates root-cause investigation, and tracks follow-up resolutions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Total Tracked</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {summary.totalViolationsTracked}
              </span>
            </div>
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-center">
              <span className="block text-[10px] uppercase font-bold text-amber-700">Active Alerts</span>
              <span className="text-lg font-bold font-mono text-amber-900 tabular-nums">
                {summary.activeAlerts}
              </span>
            </div>
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-center">
              <span className="block text-[10px] uppercase font-bold text-emerald-700">Resolved</span>
              <span className="text-lg font-bold font-mono text-emerald-900 tabular-nums">
                {summary.resolvedCount}
              </span>
            </div>
          </div>
        </div>

        {/* 6-Stage Stepper Ribbon */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="block text-[10px] font-mono font-bold text-slate-400">STAGE 1</span>
            <span className="block text-xs font-semibold text-slate-800 mt-0.5">Track Findings</span>
            <span className="block text-[10px] text-slate-600 mt-1">Logs rules, categories, campaigns</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="block text-[10px] font-mono font-bold text-slate-400">STAGE 2</span>
            <span className="block text-xs font-semibold text-slate-800 mt-0.5">Detect Patterns</span>
            <span className="block text-[10px] text-slate-600 mt-1">Cross-draft frequency analytics</span>
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="block text-[10px] font-mono font-bold text-amber-700">STAGE 3</span>
            <span className="block text-xs font-semibold text-amber-900 mt-0.5">Alert Manager</span>
            <span className="block text-[10px] text-amber-800 mt-1">Threshold trigger on repeated errors</span>
          </div>

          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="block text-[10px] font-mono font-bold text-blue-700">STAGE 4</span>
            <span className="block text-xs font-semibold text-blue-900 mt-0.5">Investigate Cause</span>
            <span className="block text-[10px] text-blue-800 mt-1">Diagnose rule or training gaps</span>
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="block text-[10px] font-mono font-bold text-emerald-700">STAGE 5</span>
            <span className="block text-xs font-semibold text-emerald-900 mt-0.5">Take Action</span>
            <span className="block text-[10px] text-emerald-800 mt-1">Clarify rule, update rate card</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="block text-[10px] font-mono font-bold text-slate-400">STAGE 6</span>
            <span className="block text-xs font-semibold text-slate-800 mt-0.5">Track Follow-up</span>
            <span className="block text-[10px] text-slate-600 mt-1">Verify error recurrence drop</span>
          </div>
        </div>
      </div>

      {/* Pattern Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Recurring Violations & Patterns ({brand.name})
          </h3>
          <span className="text-xs text-slate-500">
            Click any pattern to review details or take corrective manager action
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map(pat => {
            const isAlert = pat.status === 'alert_active';
            const isInvestigating = pat.status === 'investigating';
            const isResolved = pat.status === 'resolved';

            return (
              <div
                key={pat.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                  isAlert
                    ? 'border-amber-300 hover:border-amber-400'
                    : isResolved
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header status bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                        isAlert
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : isResolved
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {isAlert ? 'Manager Alert: Repeated Error' : isResolved ? 'Resolved' : 'Under Investigation'}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      {pat.category}
                    </span>
                  </div>

                  <div className="text-xs font-mono font-bold text-slate-900 tabular-nums bg-slate-100 px-2 py-0.5 rounded">
                    {pat.occurrenceCount} occurrences
                  </div>
                </div>

                {/* Conflict description */}
                <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                  {pat.conflictSummary}
                </h4>

                {/* Citation */}
                <div className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-400 font-medium">Governing Rule: </span>
                  <span className="font-semibold text-slate-800">{pat.ruleCitation}</span>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Creators Involved:</span>
                    <span className="text-slate-700 font-medium">{pat.creatorsInvolved.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-medium">Campaigns:</span>
                    <span className="text-slate-700 font-medium">{pat.campaignsInvolved.join(', ')}</span>
                  </div>
                </div>

                {/* Recorded Root Cause & Action if existing */}
                {pat.rootCause && (
                  <div className="mb-4 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Diagnosed Root Cause: </span>
                      <span className="font-mono">{pat.rootCause.replace('_', ' ')}</span>
                    </div>
                    {pat.correctiveActionTaken && (
                      <p className="text-emerald-800 text-[11px]">
                        <span className="font-medium">Action Taken: </span>
                        {pat.correctiveActionTaken}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Last logged: {pat.lastSeen}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenInvestigation(pat)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Investigate & Take Action</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manager Investigation & Corrective Action Modal */}
      {isInvestigatingModalOpen && selectedPattern && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Brand Clarity Loop · Stage 4 & 5
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Manager Investigation & Corrective Action
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInvestigatingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Pattern summary recap */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Repeated Conflict:</span>
              <p className="font-semibold text-slate-900">{selectedPattern.conflictSummary}</p>
              <p className="text-slate-500 text-[11px]">
                Governing Rule: <span className="font-mono text-slate-700">{selectedPattern.ruleCitation}</span> · {selectedPattern.occurrenceCount} occurrences
              </p>
            </div>

            {/* Step 4: Investigate Cause */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Stage 4: What is the underlying cause of this repeated issue?
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRootCause('unclear_rule')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    rootCause === 'unclear_rule'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block">The rule is unclear</span>
                  <span className="text-[10px] opacity-80">Ambiguous wording in styleguide</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRootCause('outdated_reference')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    rootCause === 'outdated_reference'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block">Outdated reference</span>
                  <span className="text-[10px] opacity-80">Teams using deprecated rate sheets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRootCause('training_needed')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    rootCause === 'training_needed'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block">Team training needed</span>
                  <span className="text-[10px] opacity-80">Agency creators unaware of rule</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRootCause('tooling_gap')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    rootCause === 'tooling_gap'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block">Guideline hard to find</span>
                  <span className="text-[10px] opacity-80">Brand portal search inaccessibility</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={rootCauseNotes}
                onChange={e => setRootCauseNotes(e.target.value)}
                placeholder="Manager investigation notes (e.g. Creator briefing deck contained unstandardized logo variant)..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-800"
              />
            </div>

            {/* Step 5: Take Corrective Action */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Stage 5: Corrective Action to Prevent Future Recurrence
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCorrectiveAction('Clarified guideline wording and reissued Brand Portal PDF v2.4')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                >
                  Clarify Guideline
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectiveAction('Updated master pricing ledger and retired deprecated starter tier sheet')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                >
                  Update Rate Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectiveAction('Scheduled 30-min compliance review session with external agency partners')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                >
                  Organise Team Training
                </button>
              </div>

              <input
                type="text"
                value={correctiveAction}
                onChange={e => setCorrectiveAction(e.target.value)}
                placeholder="Specific action taken..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800 font-medium"
              />
            </div>

            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsInvestigatingModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={() => handleSaveAction('investigating')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                >
                  Save as In-Progress
                </button>

                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={() => handleSaveAction('resolved')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Complete & Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
