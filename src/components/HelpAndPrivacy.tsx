import React, { useState } from 'react';
import { ShieldCheck, FileText, Cpu, Lock, RotateCcw, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface HelpAndPrivacyProps {
  onResetComplete: () => void;
}

export const HelpAndPrivacy: React.FC<HelpAndPrivacyProps> = ({ onResetComplete }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemo = async () => {
    if (!confirm('Reset all demo audits, custom rules, and recurrence patterns to canonical initial state?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        setResetSuccess(true);
        onResetComplete();
        setTimeout(() => setResetSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to reset demo:', e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-slate-800" />
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Governance Architecture, Privacy & Verification Notice
          </h2>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          SkyNex AI enforces brand integrity through a dual-stage verification pipeline. This document explains system boundaries, external processing disclosures, and evaluation criteria for Inkloom AI Hackathon judges.
        </p>
      </div>

      {/* Grid of 4 Key Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Supported Formats */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Supported Input Formats & Limits
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform supports direct text paste as well as document uploads for:
          </p>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li><span className="font-semibold text-slate-900">Plain Text:</span> <span className="font-mono">.txt</span>, <span className="font-mono">.md</span></li>
            <li><span className="font-semibold text-slate-900">Word Documents:</span> <span className="font-mono">.docx</span> (extracted via Mammoth)</li>
            <li><span className="font-semibold text-slate-900">Text-Based PDF:</span> <span className="font-mono">.pdf</span> (extracted via PDF Parser)</li>
            <li><span className="font-semibold text-slate-900">Maximum File Size:</span> 10 MB per file</li>
          </ul>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            Note: Complex visual layout preservation and raster image OCR are scheduled for Round 3 extensions.
          </p>
        </div>

        {/* Card 2: Deterministic vs Gemini AI Analysis */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Deterministic Logic vs. Contextual AI
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Deterministic First:</span> Exact product naming, pricing mismatches against approved fact sheets, and explicitly prohibited regulatory phrases are verified by rigid programmatic rules. Gemini is never permitted to override approved facts.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Gemini Contextual Layer:</span> Evaluates nuanced tone of voice and identifies unverified claims lacking supporting documentation.
          </p>
        </div>

        {/* Card 3: Privacy & External Processing */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              External AI Processing Disclosure
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            When Contextual AI review is enabled, submitted text and relevant brand rules are transmitted securely to Google Gemini APIs. All API calls execute strictly on the server side with <span className="font-mono text-slate-800">User-Agent: aistudio-build</span>.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 text-[11px] text-amber-900">
            <span className="font-semibold">Demo Notice: </span>
            This prototype is designed for hackathon demonstration. Please do not submit confidential or sensitive proprietary content in public demo mode.
          </div>
        </div>

        {/* Card 4: Human-in-the-Loop Authority */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-800" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Human-in-the-Loop Authority
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI suggestions never overwrite drafts automatically. The original submitted text is preserved throughout the lifecycle. Creators and reviewers retain complete authority to accept, edit, or reject each finding with recorded audit notes.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unverified claims are labeled <span className="font-semibold text-amber-800">Needs Human Verification</span>, never declared false without proof.
          </p>
        </div>
      </div>

      {/* Demo Reset Card (PRD Section 15) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Reset Demo Workspace</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset all in-memory brand guidelines, submitted audit reports, and Brand Clarity Loop recurrence counters back to the canonical initial seed state.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting Data...' : 'Reset Demo State'}</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo state successfully reset to initial canonical benchmark dataset.</span>
        </div>
      )}
    </div>
  );
};
