import React, { useState, useEffect, useRef } from 'react';
import {
  BrandProfile,
  BenchmarkScenario,
  AuditFinding,
  AuditReport,
  BrandId,
  DecisionStatus,
  FindingClassification,
  ReviewStatusOutcome
} from '../types.ts';
import { BENCHMARK_SCENARIOS } from '../data/mockBrands.ts';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Edit2,
  Copy,
  FileCheck,
  Layers,
  Upload,
  FileText,
  Lock,
  ExternalLink,
  ShieldAlert,
  Info,
  Clock,
  Send
} from 'lucide-react';

interface AuditStudioProps {
  brand: BrandProfile;
  onBrandChange: (brandId: BrandId) => void;
  onAuditCompleted: (report: AuditReport) => void;
  onNavigateToHelp: () => void;
}

export const AuditStudio: React.FC<AuditStudioProps> = ({
  brand,
  onBrandChange,
  onAuditCompleted,
  onNavigateToHelp
}) => {
  const [draftTitle, setDraftTitle] = useState('Summer Promotional Launch');
  const [channel, setChannel] = useState<'Social post' | 'Advertisement' | 'Email' | 'Website/Product page' | 'Other'>('Advertisement');
  const [draftText, setDraftText] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [extractedPreviewVisible, setExtractedPreviewVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contextual AI toggle
  const [enableGemini, setEnableGemini] = useState(true);

  // Audit workflow states
  const [auditStep, setAuditStep] = useState<'idle' | 'extracting' | 'checking_rules' | 'contextual_ai' | 'completed'>('idle');
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [toneSummary, setToneSummary] = useState<string>('');
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);

  // Decision editing states
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [customEditText, setCustomEditText] = useState<string>('');
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Available scenarios for current brand
  const brandScenarios = BENCHMARK_SCENARIOS.filter(s => s.brandId === brand.id);

  // Pre-load canonical PRD scenario on initial load
  useEffect(() => {
    if (brandScenarios.length > 0) {
      loadScenario(brandScenarios[0]);
    }
  }, [brand.id]);

  const loadScenario = (scenario: BenchmarkScenario) => {
    setSelectedScenarioId(scenario.id);
    setDraftTitle(scenario.title);
    setDraftText(scenario.text);
    setChannel(scenario.contentType as any);
    setAuditReport(null);
    setToneSummary('');
    setActiveFindingId(null);
    setEditingFindingId(null);
    setUploadedFilename(null);
    setUploadError(null);
    setExtractedPreviewVisible(false);
  };

  const handleStartNewReview = () => {
    setDraftTitle('New Draft');
    setDraftText('');
    setSelectedScenarioId(null);
    setAuditReport(null);
    setToneSummary('');
    setUploadedFilename(null);
    setUploadError(null);
    setExtractedPreviewVisible(false);
  };

  // File upload and text extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadedFilename(file.name);
    setIsUploading(true);

    const validExtensions = ['.txt', '.md', '.docx', '.pdf'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setUploadError(`File format "${fileExt}" is not supported. Please upload .txt, .md, .docx, or .pdf, or paste text.`);
      setIsUploading(false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File exceeds maximum size limit of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      setIsUploading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const res = await fetch('/api/extract-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              base64Content: base64Data
            })
          });

          const data = await res.json();
          if (!res.ok) {
            setUploadError(data.error || 'Failed to extract text from document. Please use paste-text fallback.');
          } else {
            setDraftText(data.extractedText);
            setDraftTitle(file.name.replace(/\.[^/.]+$/, ''));
            setExtractedPreviewVisible(true);
            setAuditReport(null);
          }
        } catch (apiErr: any) {
          setUploadError(`Server extraction failed. Please paste text directly: ${apiErr.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(`Unable to read file: ${err.message}`);
      setIsUploading(false);
    }
  };

  // Run audit through stages
  const runAudit = async () => {
    if (!draftText.trim()) return;

    setAuditStep('checking_rules');
    setUploadError(null);

    try {
      // Step simulated visual progression
      setTimeout(() => {
        if (enableGemini) setAuditStep('contextual_ai');
      }, 350);

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brand.id,
          draftText,
          campaign: draftTitle,
          contentType: channel,
          title: draftTitle,
          enableGemini
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Audit request failed');
      }

      setAuditReport(data.report);
      setToneSummary(data.toneSummary || '');
      onAuditCompleted(data.report);
      setAuditStep('completed');

      if (data.report.findings.length > 0) {
        setActiveFindingId(data.report.findings[0].id);
      }
    } catch (err: any) {
      console.error('Audit failed:', err);
      setAuditStep('idle');
      setUploadError(`Audit failed: ${err.message}`);
    }
  };

  // Decision Handlers (PRD Section 6.3)
  const handleDecision = async (
    findingId: string,
    decision: DecisionStatus,
    customReplacement?: string,
    rejectionReason?: string
  ) => {
    if (!auditReport) return;

    const finding = auditReport.findings.find(f => f.id === findingId);
    if (!finding) return;

    let updatedDraft = auditReport.currentText;

    if (decision === 'accepted') {
      const replacement = finding.suggestedReplacement || '';
      if (finding.originalSpan === 'Full Draft Body') {
        updatedDraft = updatedDraft + replacement;
      } else {
        updatedDraft = updatedDraft.split(finding.originalSpan).join(replacement);
      }
    } else if (decision === 'edited' && customReplacement) {
      if (finding.originalSpan === 'Full Draft Body') {
        updatedDraft = updatedDraft + customReplacement;
      } else {
        updatedDraft = updatedDraft.split(finding.originalSpan).join(customReplacement);
      }
    }

    const updatedFindings = auditReport.findings.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          decision,
          editedReplacement: customReplacement,
          rejectionReason
        };
      }
      return f;
    });

    const pendingCount = updatedFindings.filter(f => f.decision === 'pending').length;
    const newStatus: ReviewStatusOutcome = pendingCount === 0 ? 'changes_applied' : 'issues_found';

    const updatedReport: AuditReport = {
      ...auditReport,
      currentText: updatedDraft,
      findings: updatedFindings,
      overallStatus: newStatus
    };

    setAuditReport(updatedReport);
    setDraftText(updatedDraft);
    setEditingFindingId(null);
    setRejectionModalId(null);

    try {
      await fetch('/api/history/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: auditReport.id,
          findingId,
          decision,
          editedReplacement: customReplacement,
          rejectionReason,
          updatedFullText: updatedDraft
        })
      });
    } catch (e) {
      console.error('Failed to sync decision:', e);
    }
  };

  const copyToClipboard = () => {
    if (!auditReport) return;
    navigator.clipboard.writeText(auditReport.currentText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const renderStatusBadge = (status: ReviewStatusOutcome) => {
    switch (status) {
      case 'no_issues_detected':
        return (
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            No issues detected by checks that ran
          </span>
        );
      case 'issues_found':
        return (
          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Issues found
          </span>
        );
      case 'needs_human_verification':
        return (
          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs human verification
          </span>
        );
      case 'partial_review_ai_unavailable':
        return (
          <span className="text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Partial review — contextual AI unavailable
          </span>
        );
      case 'changes_applied':
        return (
          <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Revisions applied · Original preserved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Header as specified in PRD Section 6.1 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Review Content
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Check a draft against approved brand rules before publication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartNewReview}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Start New Review
          </button>

          <button
            type="button"
            onClick={() => brandScenarios.length > 0 && loadScenario(brandScenarios[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load Canonical Test Draft</span>
          </button>
        </div>
      </div>

      {/* Preset Test Scenarios Carousel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            Pre-loaded Benchmark Scenarios ({brand.name})
          </span>
          <span className="text-[11px] text-slate-400">1-click test without typing</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {brandScenarios.map(sc => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => loadScenario(sc)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="font-semibold">{sc.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {sc.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Grid: Left Input & Map, Right Findings & Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Input Form & Extraction Preview) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            {/* Metadata selectors (Channel, Title) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Draft Title / Reference:
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  placeholder="e.g. Summer Launch Social Copy"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Content Channel:
                </label>
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value as any)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 font-medium"
                >
                  <option value="Social post">Social post</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Email">Email</option>
                  <option value="Website/Product page">Website/Product page</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Document Upload Zone (PRD Section 6.1) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Upload Document or Paste Text
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Supported: .txt, .md, .docx, .pdf (Max 10MB)
                </span>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-lg p-3 text-center cursor-pointer transition-colors bg-slate-50/50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>
                    {isUploading ? 'Extracting document text...' : 'Click to upload .docx, .pdf, or .md file'}
                  </span>
                </div>
              </div>

              {uploadedFilename && (
                <div className="text-xs text-slate-600 flex items-center justify-between bg-slate-100 px-2.5 py-1 rounded">
                  <span className="truncate font-mono">File: {uploadedFilename}</span>
                  <span className="text-emerald-700 font-semibold text-[11px]">✓ Text extracted</span>
                </div>
              )}

              {uploadError && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{uploadError}</div>
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Content Body:
                </label>
                <span className="text-xs font-mono text-slate-400">
                  {draftText.length} chars · {draftText.trim() ? draftText.trim().split(/\s+/).length : 0} words
                </span>
              </div>

              <textarea
                rows={6}
                value={draftText}
                onChange={e => {
                  setDraftText(e.target.value);
                  if (auditReport) setAuditReport(null);
                }}
                placeholder="Paste marketing content or select a canonical sample draft above..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans"
              />
            </div>

            {/* AI Review Notice & Check Button (PRD Section 6.1) */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={enableGemini}
                    onChange={e => setEnableGemini(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                  <span className="font-semibold">Run Gemini Contextual Analysis</span>
                </label>

                <button
                  type="button"
                  onClick={onNavigateToHelp}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>AI Privacy Disclosure</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Engine: <span className="font-semibold text-slate-700">Deterministic Rules</span>
                  {enableGemini && <span className="text-slate-600"> + Gemini 3.8 Flash</span>}
                </div>

                <button
                  type="button"
                  onClick={runAudit}
                  disabled={auditStep !== 'idle' && auditStep !== 'completed' || !draftText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  {auditStep === 'checking_rules' && (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking deterministic rules...</span>
                    </>
                  )}
                  {auditStep === 'contextual_ai' && (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Gemini contextual audit...</span>
                    </>
                  )}
                  {(auditStep === 'idle' || auditStep === 'completed') && (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Check Content</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Text Map / Highlight Visualizer */}
          {auditReport && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Interactive Text Map
                </span>
                <span className="text-xs text-slate-500">Click highlighted text to inspect evidence</span>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-800">
                {auditReport.findings.length === 0 ? (
                  <div className="text-emerald-700 flex items-center gap-2 py-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No issues detected by checks that ran.</span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">
                    {auditReport.findings.reduce<React.ReactNode[]>((acc, f) => {
                      return [
                        ...acc,
                        <span
                          key={f.id}
                          onClick={() => setActiveFindingId(f.id)}
                          className={`cursor-pointer px-1 py-0.5 rounded transition-all mr-1 ${
                            activeFindingId === f.id ? 'ring-2 ring-slate-900 font-bold' : ''
                          } ${
                            f.decision === 'accepted'
                              ? 'bg-emerald-100 text-emerald-900 line-through'
                              : f.classification === 'unsupported_claim'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {f.originalSpan}
                        </span>
                      ];
                    }, [
                      <span key="full-text" className="text-slate-800 mr-2">
                        {auditReport.currentText}
                      </span>
                    ])}
                  </p>
                )}
              </div>

              {toneSummary && (
                <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 flex items-start gap-2">
                  <FileCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Contextual Voice & Tone: </span>
                    {toneSummary}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Findings & Human Decision Workspace */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            {/* Header with overall status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Review Findings ({auditReport ? auditReport.findings.length : 0})
                </h3>
              </div>

              {auditReport && renderStatusBadge(auditReport.overallStatus)}
            </div>

            {/* Zero State */}
            {!auditReport && auditStep === 'idle' && (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Ready for Content Review</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Select a canonical scenario or upload a document, then click "Check Content" to run deterministic checks and contextual review.
                  </p>
                </div>
              </div>
            )}

            {/* Loading Progression State */}
            {auditStep !== 'idle' && auditStep !== 'completed' && (
              <div className="py-16 text-center space-y-3">
                <RotateCcw className="w-8 h-8 animate-spin text-slate-900 mx-auto" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {auditStep === 'checking_rules' ? 'Verifying Approved Brand Rules...' : 'Evaluating Context with Gemini...'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Checking terminology, structured prices, and verifying claims against approved citations...
                  </p>
                </div>
              </div>
            )}

            {/* No Issues Detected State */}
            {auditReport && auditReport.findings.length === 0 && (
              <div className="py-14 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">No Issues Detected by Checks that Ran</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Content complies with approved product naming, price schedules, and active policy directives for {brand.name}.
                  </p>
                </div>
              </div>
            )}

            {/* Findings List (PRD Section 6.2) */}
            {auditReport && auditReport.findings.length > 0 && (
              <div className="space-y-4 mt-4">
                {auditReport.findings.map((f, index) => {
                  const isActive = activeFindingId === f.id;
                  const isPending = f.decision === 'pending';
                  const isAccepted = f.decision === 'accepted';
                  const isEdited = f.decision === 'edited';
                  const isRejected = f.decision === 'rejected';

                  return (
                    <div
                      key={f.id}
                      onClick={() => setActiveFindingId(f.id)}
                      className={`border rounded-xl p-4 transition-all text-left ${
                        isActive
                          ? 'border-slate-800 shadow-sm bg-white'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      {/* Finding Card Top Bar */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{index + 1}
                          </span>
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider ${
                              f.classification === 'unsupported_claim'
                                ? 'text-amber-800'
                                : f.severity === 'critical'
                                ? 'text-rose-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {f.classification.replace(/_/g, ' ')}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {f.engine === 'deterministic' ? 'Deterministic Engine' : 'Gemini Contextual'}
                          </span>
                        </div>

                        {/* Status Label */}
                        <div className="text-xs font-medium">
                          {isPending && (
                            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                              Decision Required
                            </span>
                          )}
                          {isAccepted && (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 font-semibold">
                              <Check className="w-3 h-3" /> Accepted
                            </span>
                          )}
                          {isEdited && (
                            <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 font-semibold">
                              <Edit2 className="w-3 h-3" /> Customized
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                              <X className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Conflict summary */}
                      <div className="text-xs font-bold text-slate-900 mb-1.5 leading-snug">
                        {f.conflictText}
                      </div>

                      {/* Evidence & Supporting Approved Rule (PRD Requirement) */}
                      <div className="bg-slate-100/80 border border-slate-200/90 rounded-md p-2.5 text-xs text-slate-700 space-y-1 mb-3">
                        <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-[11px]">
                          <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Supporting Approved Rule:</span>
                          <span className="font-mono text-blue-700">{f.approvedRuleCitation}</span>
                        </div>
                        {f.sourceReference && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            Verified Source: {f.sourceReference}
                          </div>
                        )}
                        <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                          {f.explanation}
                        </p>
                      </div>

                      {/* Original vs Proposed Correction (PRD Requirement) */}
                      {f.suggestedReplacement ? (
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="p-2 bg-rose-50/60 border border-rose-200 rounded">
                            <span className="block text-[10px] font-mono text-rose-700 uppercase font-bold">Original Text:</span>
                            <span className="font-medium text-rose-900 line-through">{f.originalSpan}</span>
                          </div>
                          <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded">
                            <span className="block text-[10px] font-mono text-emerald-700 uppercase font-bold">Proposed Correction:</span>
                            <span className="font-semibold text-emerald-900">{f.suggestedReplacement}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-amber-50/60 border border-amber-200 rounded text-xs mb-3 text-amber-900">
                          <span className="font-bold">No safe correction in approved facts: </span>
                          <span>Requires manual verification with brand administrator.</span>
                        </div>
                      )}

                      {/* Inline Custom Edit Interface */}
                      {editingFindingId === f.id && (
                        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg mb-3 space-y-2">
                          <label className="block text-xs font-semibold text-blue-900">
                            Custom Replacement Text:
                          </label>
                          <input
                            type="text"
                            value={customEditText}
                            onChange={e => setCustomEditText(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-medium"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingFindingId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDecision(f.id, 'edited', customEditText)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                            >
                              Apply Custom Edit
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Rejection Note Interface */}
                      {rejectionModalId === f.id && (
                        <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg mb-3 space-y-2">
                          <label className="block text-xs font-semibold text-slate-900">
                            Reason for Rejection (Recorded in Audit Trail):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Approved special partner promotional exception"
                            value={rejectionReasonInput}
                            onChange={e => setRejectionReasonInput(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none text-slate-900"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setRejectionModalId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDecision(f.id, 'rejected', undefined, rejectionReasonInput)}
                              className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-semibold"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Human Decision Action Bar (PRD Section 6.3) */}
                      {isPending && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                          {f.suggestedReplacement && (
                            <button
                              type="button"
                              onClick={() => handleDecision(f.id, 'accepted')}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Suggestion</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingFindingId(f.id);
                              setCustomEditText(f.suggestedReplacement || f.originalSpan);
                            }}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRejectionModalId(f.id);
                              setRejectionReasonInput('');
                            }}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-rose-50 border border-slate-300 text-rose-700 hover:border-rose-300 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {/* Recorded Note when decided */}
                      {!isPending && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            {isAccepted && 'Applied approved fix to new revision.'}
                            {isEdited && `Custom edit applied: "${f.editedReplacement}"`}
                            {isRejected && `Rejected${f.rejectionReason ? `: ${f.rejectionReason}` : ''}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDecision(f.id, 'pending')}
                            className="text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
                          >
                            Change decision
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Original Preserved & Final Actions Callout */}
          {auditReport && (
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Human Decision Authority Enforced
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The original draft remains preserved. Revisions are versioned as you accept or customize each suggested fix.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Version: <span className="font-mono text-white">v{auditReport.versions.length}.0</span>
                </div>

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Revised Draft!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Current Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
