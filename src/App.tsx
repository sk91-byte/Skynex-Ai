import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Layers,
  History,
  Sparkles,
  UploadCloud,
  Check,
  X,
  Edit3,
  Copy,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Info,
  TrendingUp,
  RefreshCw,
  Sliders,
  Download,
  BookOpen,
  Clock,
  UserCheck,
  Lock,
  Save,
  Eye,
  Trash2,
  HelpCircle,
  FileCheck,
  RotateCcw,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { USER_PROFILES, DEFAULT_USER_PROFILE } from './data/userProfiles.ts';
import {
  BrandId,
  BrandProfile,
  BrandRule,
  RuleCategory,
  RuleApprovalStatus,
  AuditReport,
  AuditFinding,
  DecisionStatus,
  ContentApprovalStatus,
  RecurringPattern,
  RecurrenceThresholdConfig,
  UserProfile,
  SampleScenario
} from './types.ts';

const ACTIVE_REPORT_STORAGE_KEY = 'skynex_active_report_id_v1';
const ACTIVE_BRAND_STORAGE_KEY = 'skynex_active_brand_id_v1';

export default function App() {
  // User Persona State
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Navigation: 'review' | 'knowledge' | 'history' | 'recurring'
  const [currentView, setCurrentView] = useState<'review' | 'knowledge' | 'history' | 'recurring'>('review');
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'info' | 'error' | 'success' } | null>(null);

  // Persistent Server State
  const [brands, setBrands] = useState<Record<string, BrandProfile>>({});
  const [activeBrandId, setActiveBrandId] = useState<BrandId>(() => {
    const saved = localStorage.getItem(ACTIVE_BRAND_STORAGE_KEY);
    return (saved === 'novapay' || saved === 'aerosip' || saved === 'skynex') ? saved : 'novapay';
  });
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [auditHistory, setAuditHistory] = useState<AuditReport[]>([]);
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPattern[]>([]);
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceThresholdConfig>({
    minOccurrences: 3,
    minDistinctDrafts: 2,
    windowDays: 7
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Review Workspace State
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [contentType, setContentType] = useState<string>('Advertisement');
  const [contentTitle, setContentTitle] = useState<string>('NovaPay Promotional Ad (Canonical Demo)');
  const [draftText, setDraftText] = useState<string>(
    'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractedPreviewText, setExtractedPreviewText] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Engine Configuration & Execution State
  const [enableGemini, setEnableGemini] = useState<boolean>(true);
  const [simulateAiFailure, setSimulateAiFailure] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [draftPaneTab, setDraftPaneTab] = useState<'interactive' | 'diff' | 'versions'>('interactive');

  // Inline Suggestion Edit / Reject State
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [customEditValues, setCustomEditValues] = useState<Record<string, string>>({});
  const [rejectingFindingId, setRejectingFindingId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [approvalNotesInput, setApprovalNotesInput] = useState<string>('');

  // Brand Knowledge Filters & Modals
  const [ruleSearchQuery, setRuleSearchQuery] = useState<string>('');
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>('All');
  const [ruleStatusFilter, setRuleStatusFilter] = useState<string>('All');
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<BrandRule | null>(null);
  const [ruleForm, setRuleForm] = useState<{
    title: string;
    category: RuleCategory;
    ruleStatement: string;
    targetPatterns: string;
    approvedValue: string;
    sourceRef: string;
    status: RuleApprovalStatus;
    severity: 'critical' | 'warning' | 'info';
    explanation: string;
  }>({
    title: '',
    category: 'Terminology',
    ruleStatement: '',
    targetPatterns: '',
    approvedValue: '',
    sourceRef: '',
    status: 'Approved',
    severity: 'critical',
    explanation: ''
  });

  // Review History Filter & Detail Modal
  const [historyBrandFilter, setHistoryBrandFilter] = useState<string>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [inspectingHistoryReport, setInspectingHistoryReport] = useState<AuditReport | null>(null);

  // Recurring Issues Investigation Modal & Config Modal
  const [investigatingPattern, setInvestigatingPattern] = useState<RecurringPattern | null>(null);
  const [invRootCause, setInvRootCause] = useState<'unclear_guidelines' | 'outdated_approved_info' | 'training_need'>('unclear_guidelines');
  const [invNotes, setInvNotes] = useState<string>('');
  const [invAction, setInvAction] = useState<string>('');
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [thresholdForm, setThresholdForm] = useState<RecurrenceThresholdConfig>({
    minOccurrences: 3,
    minDistinctDrafts: 2,
    windowDays: 7
  });

  const triggerToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4200);
  };

  const activeBrand: BrandProfile | undefined = brands[activeBrandId];

  // Fetch initial state from backend and run/restore active review
  const fetchAppState = async (runInitialDemoIfNoActive = false) => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to load application state');
      const data = await res.json();

      setBrands(data.brands || {});
      setAuditHistory(data.auditHistory || []);
      setRecurringPatterns(data.recurringPatterns || []);
      if (data.recurrenceConfig) {
        setRecurrenceConfig(data.recurrenceConfig);
        setThresholdForm(data.recurrenceConfig);
      }

      const savedReportId = localStorage.getItem(ACTIVE_REPORT_STORAGE_KEY);
      const foundReport = savedReportId
        ? (data.auditHistory || []).find((r: AuditReport) => r.id === savedReportId)
        : null;

      if (foundReport) {
        setActiveReport(foundReport);
        setActiveBrandId(foundReport.brandId);
        setDraftText(foundReport.originalText);
        setContentTitle(foundReport.title);
        setContentType(foundReport.contentType);
        if (foundReport.findings.length > 0) {
          setSelectedFindingId(foundReport.findings[0].id);
        }
      } else if (runInitialDemoIfNoActive && data.brands?.novapay) {
        // Run the real review engine on the canonical NovaPay advertisement so findings are genuinely computed
        const defaultBrand: BrandProfile = data.brands[activeBrandId] || data.brands.novapay;
        const sample = defaultBrand.sampleScenarios[0];
        if (sample) {
          setDraftText(sample.text);
          setContentTitle(sample.title);
          setContentType(sample.contentType);
          await executeReviewEngine(defaultBrand.id, sample.text, sample.title, sample.contentType, undefined, true);
        }
      }
    } catch (err: any) {
      triggerToast(`Error loading state: ${err?.message || 'Network error'}`, 'error');
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAppState(true);
  }, []);

  // Core Review Engine Caller
  const executeReviewEngine = async (
    brandIdToUse: BrandId,
    textToCheck: string,
    titleToUse: string,
    channelToUse: string,
    filename?: string,
    silentToast = false
  ) => {
    if (!textToCheck.trim()) {
      triggerToast('Please enter or upload draft text before running a content check.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);
    setUploadError(null);

    const t1 = setTimeout(() => setAnalysisStep(2), 250);
    const t2 = setTimeout(() => setAnalysisStep(3), 550);
    const t3 = setTimeout(() => setAnalysisStep(4), 850);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brandIdToUse,
          draftText: textToCheck,
          contentType: channelToUse,
          title: titleToUse || 'Untitled Content Draft',
          sourceFilename: filename || uploadedFileName || undefined,
          enableGemini,
          simulateAiFailure,
          submittedBy: currentUser.name,
          submittedByRole: currentUser.roleLabel,
          submittedByRoleKey: currentUser.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Content check failed');
      }

      const newReport: AuditReport = data.report;
      setActiveReport(newReport);
      localStorage.setItem(ACTIVE_REPORT_STORAGE_KEY, newReport.id);

      setAuditHistory(prev => [newReport, ...prev.filter(r => r.id !== newReport.id)]);
      if (data.recurringPatterns) {
        setRecurringPatterns(data.recurringPatterns);
      }

      if (newReport.findings.length > 0) {
        setSelectedFindingId(newReport.findings[0].id);
      } else {
        setSelectedFindingId(null);
      }

      // Initialize custom edit values for convenience
      const editMap: Record<string, string> = {};
      newReport.findings.forEach(f => {
        editMap[f.id] = f.editedReplacement || f.suggestedReplacement || f.originalSpan;
      });
      setCustomEditValues(editMap);
      setEditingFindingId(null);
      setRejectingFindingId(null);

      if (!silentToast) {
        if (newReport.overallStatus === 'partial_review_ai_unavailable') {
          triggerToast(
            'Deterministic checks completed, but AI contextual service was unavailable (marked incomplete).',
            'info'
          );
        } else {
          triggerToast(
            `Check completed against ${newReport.checksExecuted.deterministicRulesChecked} approved rules: ${newReport.findings.length} finding(s) identified.`,
            'success'
          );
        }
      }
    } catch (err: any) {
      triggerToast(`Review check failed: ${err?.message || 'Server error'}`, 'error');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsAnalyzing(false);
    }
  };

  // Switch Brand Profile
  const handleSelectBrand = async (brandKey: BrandId) => {
    setActiveBrandId(brandKey);
    localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, brandKey);
    setIsBrandDropdownOpen(false);
    setUploadError(null);
    setUploadedFileName(null);
    setExtractedPreviewText(null);

    const targetBrand = brands[brandKey];
    if (targetBrand && targetBrand.sampleScenarios.length > 0) {
      const sample = targetBrand.sampleScenarios[0];
      setDraftText(sample.text);
      setContentTitle(sample.title);
      setContentType(sample.contentType);
      await executeReviewEngine(brandKey, sample.text, sample.title, sample.contentType);
    }
  };

  // Load Sample Scenario
  const handleLoadSampleScenario = async (scenario: SampleScenario) => {
    setInputMode('paste');
    setUploadedFileName(null);
    setExtractedPreviewText(null);
    setUploadError(null);
    setDraftText(scenario.text);
    setContentTitle(scenario.title);
    setContentType(scenario.contentType);
    await executeReviewEngine(scenario.brandId, scenario.text, scenario.title, scenario.contentType);
  };

  // File Upload with Real Extraction & Honest Error Reporting
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadedFileName(file.name);
    setExtractedPreviewText(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : '';
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
          if (!res.ok || !data.extractedText) {
            setUploadError(
              data.error ||
                `Could not extract text from "${file.name}". Please use the Paste Text option instead.`
            );
            triggerToast(data.error || 'Document extraction failed', 'error');
          } else {
            setExtractedPreviewText(data.extractedText);
            setDraftText(data.extractedText);
            setContentTitle(file.name.replace(/\.[^/.]+$/, ''));
            triggerToast(`Extracted ${data.wordCount} words from "${file.name}". Preview ready below.`, 'success');
          }
        } catch (err: any) {
          setUploadError(
            `Extraction request failed (${err?.message || 'network error'}). Please paste your text directly.`
          );
          triggerToast('Document extraction failed. Use text-paste fallback.', 'error');
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(`Could not read file: ${err?.message || 'Unknown error'}`);
    }
  };

  // Record Human Decision on Individual Finding (Accept, Edit, Reject, Verification Requested, or Pending)
  const handleFindingDecision = async (
    finding: AuditFinding,
    decision: DecisionStatus,
    customReplacementText?: string,
    rejectionReasonText?: string
  ) => {
    if (!activeReport) return;

    try {
      const res = await fetch(`/api/history/${activeReport.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          findingId: finding.id,
          decision,
          editedReplacement: customReplacementText,
          rejectionReason: rejectionReasonText,
          decidedBy: currentUser.name,
          decidedByRole: currentUser.roleLabel
        })
      });

      const data = await res.json();
      if (!res.ok) {
        // Requirement 8: "If saving a decision fails, clearly report the failure rather than pretending the action succeeded."
        triggerToast(data.error || 'Failed to save decision to server. Please retry.', 'error');
        return;
      }

      const updatedReport: AuditReport = data.report;
      setActiveReport(updatedReport);
      setAuditHistory(prev => prev.map(r => (r.id === updatedReport.id ? updatedReport : r)));
      setEditingFindingId(null);
      setRejectingFindingId(null);

      if (decision === 'accepted') {
        triggerToast(`Accepted correction: "${finding.originalSpan}" → "${finding.suggestedReplacement}"`, 'success');
      } else if (decision === 'edited') {
        triggerToast(`Saved edited replacement: "${customReplacementText}"`, 'success');
      } else if (decision === 'rejected') {
        triggerToast(`Rejected suggestion and preserved original wording: "${finding.originalSpan}"`, 'info');
      } else if (decision === 'verification_requested') {
        triggerToast(`Flagged "${finding.originalSpan}" for human verification.`, 'info');
      } else {
        triggerToast(`Reverted decision on "${finding.originalSpan}" back to pending.`, 'info');
      }
    } catch (err: any) {
      triggerToast(`Saving decision failed: ${err?.message || 'Network error'}. Action was not saved.`, 'error');
    }
  };

  // Separate Final Approval for Entire Content Item
  const handleContentApprovalDecision = async (status: ContentApprovalStatus) => {
    if (!activeReport) return;
    try {
      const res = await fetch(`/api/history/${activeReport.id}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentApprovalStatus: status,
          contentApprovedBy: `${currentUser.name} (${currentUser.roleLabel})`,
          contentApprovalNotes: approvalNotesInput.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Failed to save final content approval status.', 'error');
        return;
      }
      const updatedReport: AuditReport = data.report;
      setActiveReport(updatedReport);
      setAuditHistory(prev => prev.map(r => (r.id === updatedReport.id ? updatedReport : r)));
      triggerToast(
        status === 'approved_for_publication'
          ? `Content item "${updatedReport.title}" marked Approved for Publication.`
          : status === 'changes_requested'
          ? `Content item marked as Changes Requested.`
          : `Content item escalated for human verification.`,
        'success'
      );
    } catch (err: any) {
      triggerToast(`Failed to save content approval: ${err?.message || 'Server error'}`, 'error');
    }
  };

  // Reopen a saved review from History or Recurring Issues
  const handleReopenReport = (report: AuditReport) => {
    setActiveBrandId(report.brandId);
    localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, report.brandId);
    localStorage.setItem(ACTIVE_REPORT_STORAGE_KEY, report.id);
    setActiveReport(report);
    setDraftText(report.originalText);
    setContentTitle(report.title);
    setContentType(report.contentType);
    setUploadedFileName(report.sourceFilename || null);
    setExtractedPreviewText(null);
    setUploadError(null);
    if (report.findings.length > 0) {
      setSelectedFindingId(report.findings[0].id);
    }
    const editMap: Record<string, string> = {};
    report.findings.forEach(f => {
      editMap[f.id] = f.editedReplacement || f.suggestedReplacement || f.originalSpan;
    });
    setCustomEditValues(editMap);
    setInspectingHistoryReport(null);
    setCurrentView('review');
    triggerToast(`Reopened saved review ${report.id} ("${report.title}")`, 'info');
  };

  // Open Rule Modal for Create or Edit
  const handleOpenCreateRule = () => {
    setEditingRule(null);
    setRuleForm({
      title: '',
      category: 'Terminology',
      ruleStatement: '',
      targetPatterns: '',
      approvedValue: '',
      sourceRef: `${activeBrand?.name || 'Brand'} Brand Guidelines 2026`,
      status: currentUser.permissions.canManageRules ? 'Approved' : 'Draft',
      severity: 'critical',
      explanation: ''
    });
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule: BrandRule) => {
    setEditingRule(rule);
    setRuleForm({
      title: rule.title,
      category: rule.category,
      ruleStatement: rule.ruleStatement,
      targetPatterns: rule.targetPatterns.join(', '),
      approvedValue: rule.approvedValue,
      sourceRef: rule.sourceRef,
      status: rule.status,
      severity: rule.severity,
      explanation: rule.explanation
    });
    setIsRuleModalOpen(true);
  };

  const handleSaveRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.title.trim() || !ruleForm.approvedValue.trim()) {
      triggerToast('Rule title and approved content/value are required.', 'error');
      return;
    }

    const patternsArray = ruleForm.targetPatterns
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const url = editingRule
        ? `/api/brands/${activeBrandId}/rules/${editingRule.id}`
        : `/api/brands/${activeBrandId}/rules`;
      const method = editingRule ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ruleForm,
          targetPatterns: patternsArray
        })
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Failed to save brand rule.', 'error');
        return;
      }

      setBrands(prev => ({
        ...prev,
        [activeBrandId]: data.brand
      }));
      setIsRuleModalOpen(false);
      triggerToast(
        editingRule
          ? `Updated rule ${data.rule.id} (${data.rule.status}).`
          : `Created rule ${data.rule.id} with status "${data.rule.status}".`,
        'success'
      );
    } catch (err: any) {
      triggerToast(`Failed to save rule: ${err?.message || 'Server error'}`, 'error');
    }
  };

  const handleToggleRuleApproval = async (rule: BrandRule, newStatus: RuleApprovalStatus) => {
    try {
      const res = await fetch(`/api/brands/${activeBrandId}/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Could not update rule status.', 'error');
        return;
      }
      setBrands(prev => ({
        ...prev,
        [activeBrandId]: data.brand
      }));
      triggerToast(
        newStatus === 'Approved'
          ? `Rule ${rule.id} approved! It is now enforced as authoritative.`
          : `Rule ${rule.id} moved to ${newStatus} (not enforced until approved).`,
        'success'
      );
    } catch (err: any) {
      triggerToast(`Error updating rule status: ${err?.message}`, 'error');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/brands/${activeBrandId}/rules/${ruleId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setBrands(prev => ({
          ...prev,
          [activeBrandId]: data.brand
        }));
        triggerToast(`Deleted rule ${ruleId}.`, 'info');
      }
    } catch (err: any) {
      triggerToast(`Failed to delete rule: ${err?.message}`, 'error');
    }
  };

  // Save Manager Investigation on Recurring Issue
  const handleSaveInvestigation = async (newStatus: 'investigating' | 'resolved') => {
    if (!investigatingPattern) return;
    try {
      const res = await fetch('/api/clarity-loop/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternId: investigatingPattern.id,
          rootCause: invRootCause,
          rootCauseNotes: invNotes.trim() || 'Investigated recurring rule violation across drafts.',
          correctiveAction: invAction.trim() || 'Reviewed guideline clarity and notified content team.',
          newStatus,
          investigatedBy: `${currentUser.name} (${currentUser.roleLabel})`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Failed to save investigation.', 'error');
        return;
      }
      setRecurringPatterns(data.recurringPatterns || []);
      setInvestigatingPattern(null);
      triggerToast(`Saved manager investigation for ${investigatingPattern.ruleId} (${newStatus}).`, 'success');
    } catch (err: any) {
      triggerToast(`Failed to save investigation: ${err?.message}`, 'error');
    }
  };

  // Update Recurrence Threshold Config
  const handleSaveThresholdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clarity-loop/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thresholdForm)
      });
      const data = await res.json();
      if (res.ok) {
        setRecurrenceConfig(data.recurrenceConfig);
        setRecurringPatterns(data.recurringPatterns);
        setIsThresholdModalOpen(false);
        triggerToast(
          `Updated alert threshold: ${data.recurrenceConfig.minOccurrences} findings across ${data.recurrenceConfig.minDistinctDrafts} drafts within ${data.recurrenceConfig.windowDays} days.`,
          'success'
        );
      }
    } catch (err: any) {
      triggerToast(`Failed to update threshold: ${err?.message}`, 'error');
    }
  };

  // Reset Demo Data
  const handleResetDemoData = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem(ACTIVE_REPORT_STORAGE_KEY);
        setBrands(data.brands);
        setAuditHistory(data.auditHistory);
        setRecurringPatterns(data.recurringPatterns);
        setRecurrenceConfig(data.recurrenceConfig);
        setActiveBrandId('novapay');
        const npSample = data.brands.novapay.sampleScenarios[0];
        setDraftText(npSample.text);
        setContentTitle(npSample.title);
        setContentType(npSample.contentType);
        await executeReviewEngine('novapay', npSample.text, npSample.title, npSample.contentType, undefined, true);
        triggerToast('Reset all demo rules, history, and recurring issues to canonical seed state.', 'success');
      }
    } catch (err: any) {
      triggerToast(`Reset failed: ${err?.message}`, 'error');
    }
  };

  // Dynamic Interactive Draft Renderer: highlights exact spans from activeReport.findings
  // and replaces accepted/edited spans inline so it works on ANY user-submitted text!
  const renderHighlightedWorkingDraft = () => {
    if (!activeReport) {
      return <p className="whitespace-pre-wrap text-slate-700">{draftText}</p>;
    }

    const baseText = activeReport.originalText;
    const sortedFindings = [...activeReport.findings].sort((a, b) => a.startIndex - b.startIndex);

    if (sortedFindings.length === 0) {
      return <p className="whitespace-pre-wrap text-slate-800">{activeReport.currentText}</p>;
    }

    const elements: React.ReactNode[] = [];
    let cursor = 0;

    sortedFindings.forEach((f, idx) => {
      // Find span in baseText starting at or near f.startIndex
      let start = f.startIndex;
      let end = f.endIndex;
      if (
        start < cursor ||
        baseText.slice(start, end).toLowerCase() !== f.originalSpan.toLowerCase()
      ) {
        const fallbackIdx = baseText.toLowerCase().indexOf(f.originalSpan.toLowerCase(), cursor);
        if (fallbackIdx !== -1) {
          start = fallbackIdx;
          end = fallbackIdx + f.originalSpan.length;
        } else {
          return;
        }
      }

      if (start > cursor) {
        elements.push(<span key={`txt-${idx}`}>{baseText.slice(cursor, start)}</span>);
      }

      const isSelected = selectedFindingId === f.id;
      const isAcceptedOrEdited = f.decision === 'accepted' || f.decision === 'edited';
      const isRejected = f.decision === 'rejected';
      const isUnsupported =
        f.classification === 'unsupported_claim' || f.classification === 'needs_human_verification';
      const isStyle = f.classification === 'style_tone_suggestion';

      const displayValue =
        f.decision === 'edited' && f.editedReplacement
          ? f.editedReplacement
          : f.decision === 'accepted' && f.suggestedReplacement
          ? f.suggestedReplacement
          : baseText.slice(start, end);

      let badgeStyle = 'bg-[#FFF1EF] text-[#D92D20] border-b-2 border-[#F05252]';
      if (isAcceptedOrEdited) {
        badgeStyle = 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A] font-semibold';
      } else if (isRejected) {
        badgeStyle = 'bg-slate-200/80 text-slate-700 border-b-2 border-slate-400';
      } else if (isUnsupported) {
        badgeStyle = 'bg-[#FFF3D6] text-[#B45309] border-b-2 border-[#F59E0B]';
      } else if (isStyle) {
        badgeStyle = 'bg-[#E8F1FF] text-[#1D4ED8] border-b-2 border-[#3B82F6]';
      }

      elements.push(
        <span
          key={`find-${f.id}`}
          onClick={() => setSelectedFindingId(f.id)}
          title={`${f.ruleId || 'Contextual'}: ${f.conflictText}`}
          className={`cursor-pointer px-1.5 py-0.5 rounded transition-all font-medium ${badgeStyle} ${
            isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
          }`}
        >
          {displayValue}
        </span>
      );

      cursor = end;
    });

    if (cursor < baseText.length) {
      elements.push(<span key="txt-end">{baseText.slice(cursor)}</span>);
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{elements}</div>;
  };

  // Summary metrics for the active report
  const summaryMetrics = useMemo(() => {
    const list = activeReport?.findings || [];
    const conflicts = list.filter(
      f =>
        (f.classification === 'confirmed_rule_conflict' ||
          f.classification === 'approved_fact_conflict' ||
          f.classification === 'prohibited_claim') &&
        f.decision === 'pending'
    ).length;
    const verifications = list.filter(
      f =>
        (f.classification === 'unsupported_claim' ||
          f.classification === 'needs_human_verification') &&
        f.decision === 'pending'
    ).length;
    const suggestions = list.filter(
      f => f.classification === 'style_tone_suggestion' && f.decision === 'pending'
    ).length;
    const decided = list.filter(f => f.decision !== 'pending').length;
    return {
      total: list.length,
      conflicts,
      verifications,
      suggestions,
      decided
    };
  }, [activeReport]);

  const activeAlertsCount = useMemo(
    () => recurringPatterns.filter(p => p.thresholdTriggered && p.status !== 'resolved').length,
    [recurringPatterns]
  );

  const filteredRules = useMemo(() => {
    const rules = activeBrand?.rules || [];
    return rules.filter(r => {
      const matchesCategory = ruleCategoryFilter === 'All' || r.category === ruleCategoryFilter;
      const matchesStatus =
        ruleStatusFilter === 'All' ||
        (ruleStatusFilter === 'Approved' && r.status === 'Approved') ||
        (ruleStatusFilter === 'Draft' && r.status !== 'Approved');
      const q = ruleSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.approvedValue.toLowerCase().includes(q) ||
        r.sourceRef.toLowerCase().includes(q) ||
        r.targetPatterns.some(p => p.toLowerCase().includes(q));
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [activeBrand, ruleCategoryFilter, ruleStatusFilter, ruleSearchQuery]);

  const classificationLabel = (c: AuditFinding['classification']) => {
    switch (c) {
      case 'confirmed_rule_conflict':
        return { text: 'Confirmed Rule Violation', color: 'bg-[#FFF1EF] text-[#D92D20] border-[#FECACA]' };
      case 'approved_fact_conflict':
        return { text: 'Factual / Price Contradiction', color: 'bg-[#FFF1EF] text-[#D92D20] border-[#FECACA]' };
      case 'prohibited_claim':
        return { text: 'Prohibited Claim', color: 'bg-[#FFF1EF] text-[#D92D20] border-[#FECACA]' };
      case 'unsupported_claim':
      case 'needs_human_verification':
        return { text: 'Unsupported Claim · Verify', color: 'bg-[#FFF3D6] text-[#B45309] border-[#FDE68A]' };
      case 'style_tone_suggestion':
        return { text: 'Writing & Tone Suggestion', color: 'bg-[#E8F1FF] text-[#1D4ED8] border-blue-200' };
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-[#10243A] font-sans antialiased overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-xs font-medium border animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-md ${
            toastMessage.type === 'error'
              ? 'bg-red-950 text-white border-red-700'
              : toastMessage.type === 'success'
              ? 'bg-[#0F291E] text-white border-emerald-700'
              : 'bg-[#10243A] text-white border-slate-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span className="leading-snug">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LEFT NAVIGATION SIDEBAR */}
      {/* ========================================================= */}
      <aside className="w-[256px] bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Brand Logo & Tagline */}
          <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10243A] flex items-center justify-center text-white shadow-xs ring-2 ring-blue-500/20 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H14M4 12H20M4 18H16" stroke="#3B82F6" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="18" cy="6" r="2.5" fill="#0F9D8A" />
                <circle cx="10" cy="18" r="2.5" fill="#F05252" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#10243A]">SkyNex AI</span>
                <span className="text-[10px] font-semibold bg-[#E8F1FF] text-[#3B82F6] px-1.5 py-0.5 rounded">
                  Round 2
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] truncate font-medium">
                Review · Verify · Track Issues
              </p>
            </div>
          </div>

          {/* 4 Required Application Sections */}
          <nav className="p-3 space-y-5">
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold text-[#64748B] tracking-wider uppercase">
                Core Workflow
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentView('review')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentView === 'review'
                        ? 'bg-[#10243A] text-white shadow-xs'
                        : 'text-[#475569] hover:text-[#10243A] hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className={`w-4 h-4 ${currentView === 'review' ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>1. Review Content</span>
                    </div>
                    {activeReport && activeReport.findings.length > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          currentView === 'review'
                            ? 'bg-red-500/20 text-red-200 border border-red-400/30'
                            : 'bg-[#FFF1EF] text-[#D92D20] border border-[#FECACA]'
                        }`}
                      >
                        {activeReport.findings.length}
                      </span>
                    )}
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setCurrentView('knowledge')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentView === 'knowledge'
                        ? 'bg-[#10243A] text-white shadow-xs'
                        : 'text-[#475569] hover:text-[#10243A] hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className={`w-4 h-4 ${currentView === 'knowledge' ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>2. Brand Knowledge</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        currentView === 'knowledge' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      {activeBrand ? activeBrand.rules.filter(r => r.status === 'Approved').length : 0} active
                    </span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setCurrentView('history')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentView === 'history'
                        ? 'bg-[#10243A] text-white shadow-xs'
                        : 'text-[#475569] hover:text-[#10243A] hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <History className={`w-4 h-4 ${currentView === 'history' ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>3. Review History</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        currentView === 'history' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      {auditHistory.length}
                    </span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setCurrentView('recurring')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentView === 'recurring'
                        ? 'bg-[#10243A] text-white shadow-xs'
                        : 'text-[#475569] hover:text-[#10243A] hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className={`w-4 h-4 ${currentView === 'recurring' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>4. Recurring Issues</span>
                    </div>
                    {activeAlertsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {activeAlertsCount} alert{activeAlertsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            {/* End-to-End Workflow Sequence Indicator */}
            <div className="mx-1 p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Governance Pipeline
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Approved Rules Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Deterministic + Gemini AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>Evidence-Linked Findings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Human Decisions & History</span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Brand Switcher & Active User */}
        <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/70 space-y-2.5">
          {/* Brand Selector */}
          <div className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white relative">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#64748B] font-bold uppercase tracking-wider">Selected Brand</span>
              <span className="text-[#0F9D8A] font-semibold bg-[#EAF9F3] px-1.5 py-0.2 rounded">
                Fictional Demo
              </span>
            </div>
            <button
              onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              className="w-full text-left flex items-center justify-between py-0.5 text-xs font-bold text-[#10243A] hover:text-blue-600 transition-colors cursor-pointer"
            >
              <span className="truncate">{activeBrand?.name || 'NovaPay'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isBrandDropdownOpen && (
              <div className="absolute left-0 bottom-full mb-1.5 w-60 bg-white border border-[#E2E8F0] rounded-lg shadow-xl py-1.5 z-40">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] border-b border-slate-100">
                  Switch Brand Profile
                </div>
                {Object.values(brands).map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBrand(b.id)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      activeBrandId === b.id ? 'bg-[#E8F1FF] text-[#1D4ED8] font-bold' : 'text-[#10243A]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>{b.name}</span>
                        {b.id === 'novapay' && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                            Canonical
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#64748B]">{b.industry}</div>
                    </div>
                    {activeBrandId === b.id && <Check className="w-3.5 h-3.5 text-[#1D4ED8]" />}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#64748B]">
              <span>
                {activeBrand ? activeBrand.rules.filter(r => r.status === 'Approved').length : 0} approved rules
              </span>
              <button
                onClick={() => setCurrentView('knowledge')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Manage Rules →
              </button>
            </div>
          </div>

          {/* Reset Demo Button for Judges */}
          <button
            onClick={handleResetDemoData}
            className="w-full py-1.5 px-2.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Reset all rules, history, and recurring issues back to initial NovaPay demo state"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {Object.values(brands).map(b => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBrand(b.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeBrandId === b.id
                      ? 'bg-[#10243A] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b.name}
                  {b.id === 'novapay' && (
                    <span className="ml-1 text-[9px] opacity-80 font-normal">(Demo)</span>
                  )}
                </button>
              ))}
            </div>

            <span className="h-4 w-px bg-slate-200 hidden sm:block"></span>

            <span className="text-xs text-[#64748B] hidden md:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D8A]" />
              <span>{activeBrand?.fictionalLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick 1-Click Canonical NovaPay Sample Button for Judges */}
            <button
              onClick={() => {
                setCurrentView('review');
                const np = brands['novapay'];
                if (np && np.sampleScenarios[0]) {
                  if (activeBrandId !== 'novapay') {
                    setActiveBrandId('novapay');
                    localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, 'novapay');
                  }
                  handleLoadSampleScenario(np.sampleScenarios[0]);
                }
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title='Load and run the canonical NovaPay sample advertisement: "Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!"'
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Run NovaPay Sample Ad</span>
            </button>

            {/* Role Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full ${currentUser.avatarColor} flex items-center justify-center font-bold text-[10px]`}
                >
                  {currentUser.initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#10243A] leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-[#64748B] leading-none mt-0.5">{currentUser.roleLabel}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-[#E2E8F0] shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Switch Active User Role
                  </div>
                  <div className="p-1.5 space-y-1">
                    {USER_PROFILES.map(profile => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setCurrentUser(profile);
                          setIsRoleDropdownOpen(false);
                          triggerToast(`Switched active user to ${profile.name} (${profile.roleLabel}).`, 'info');
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 cursor-pointer ${
                          currentUser.id === profile.id ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full ${profile.avatarColor} flex items-center justify-center font-bold text-xs shrink-0`}
                        >
                          {profile.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#10243A]">{profile.name}</div>
                          <div className="text-[10px] text-[#64748B] truncate">{profile.roleLabel}</div>
                        </div>
                        {currentUser.id === profile.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ========================================================= */}
          {/* SECTION 1: REVIEW CONTENT WORKSPACE */}
          {/* ========================================================= */}
          {currentView === 'review' && (
            <div className="max-w-7xl mx-auto space-y-5">
              {/* Top Heading & Sample Scenarios Bar */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h1 className="text-lg font-bold text-[#10243A]">
                      Review Content — {activeBrand?.name}
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      Submit marketing copy or upload a document to verify against{' '}
                      <strong>
                        {activeBrand ? activeBrand.rules.filter(r => r.status === 'Approved').length : 0} approved brand rules
                      </strong>{' '}
                      (deterministic engine + contextual Gemini AI).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      External AI processing via server-side Gemini API · Fictional demo data only
                    </span>
                  </div>
                </div>

                {/* 1-Click Sample Scenarios for Current Brand */}
                {activeBrand && activeBrand.sampleScenarios.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                      Sample Drafts ({activeBrand.name}):
                    </span>
                    {activeBrand.sampleScenarios.map(sc => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => handleLoadSampleScenario(sc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                          contentTitle === sc.title
                            ? 'bg-[#10243A] text-white border-[#10243A]'
                            : 'bg-slate-50 hover:bg-slate-100 text-[#10243A] border-slate-200'
                        }`}
                      >
                        <span>{sc.title}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            contentTitle === sc.title
                              ? 'bg-blue-500/30 text-blue-100'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {sc.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission Card: Paste Text / Upload Document */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Input Mode Toggle */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                        inputMode === 'paste'
                          ? 'bg-white text-[#10243A] shadow-2xs'
                          : 'text-[#64748B] hover:text-[#10243A]'
                      }`}
                    >
                      Paste Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('upload')}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                        inputMode === 'upload'
                          ? 'bg-white text-[#10243A] shadow-2xs'
                          : 'text-[#64748B] hover:text-[#10243A]'
                      }`}
                    >
                      Upload Document (.txt, .md, .docx, .pdf)
                    </button>
                  </div>

                  {/* Content Type & Draft Title */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span className="font-semibold">Content Type:</span>
                      <select
                        value={contentType}
                        onChange={e => setContentType(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1 text-xs text-[#10243A] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Advertisement">Advertisement</option>
                        <option value="Social Post">Social Post</option>
                        <option value="Email">Email</option>
                        <option value="Website Copy">Website Copy</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span className="font-semibold">Draft Title:</span>
                      <input
                        type="text"
                        value={contentTitle}
                        onChange={e => setContentTitle(e.target.value)}
                        placeholder="Enter draft title..."
                        className="bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1 text-xs text-[#10243A] w-56 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Document Zone */}
                {inputMode === 'upload' && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-[#CBD5E1] hover:border-blue-500 rounded-lg p-5 text-center bg-slate-50/60 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <UploadCloud className="w-7 h-7 text-[#3B82F6] mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-[#10243A]">
                        Upload a text-based document for genuine server-side text extraction
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Supported formats: <span className="font-mono">.txt, .md, .docx, .pdf</span> (Max 10 MB). Visual/image OCR is not claimed.
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3.5 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold rounded-md shadow-2xs cursor-pointer"
                        >
                          {isUploading ? 'Extracting Text...' : 'Select Document File'}
                        </button>
                      </div>
                    </div>

                    {/* Honest Upload Error & Paste Fallback */}
                    {uploadError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Document Extraction Error: </span>
                            <span>{uploadError}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInputMode('paste');
                            setUploadError(null);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-red-100 text-red-800 border border-red-300 rounded font-semibold cursor-pointer shrink-0"
                        >
                          Switch to Paste Text Alternative →
                        </button>
                      </div>
                    )}

                    {/* Extracted Text Preview Before Review */}
                    {extractedPreviewText && (
                      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Extracted Text Preview from "{uploadedFileName}" (Editable below before running check):
                          </span>
                          <span className="text-[11px] font-mono text-emerald-800">
                            {extractedPreviewText.length} chars
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Text Editor (Always visible so extracted or pasted text can be inspected/edited) */}
                <div>
                  <textarea
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    rows={3}
                    placeholder="Paste or type the marketing draft to check against approved brand rules..."
                    className="w-full text-sm font-sans text-[#10243A] p-3 border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 leading-relaxed bg-slate-50/30"
                  />
                </div>

                {/* Bottom Action & Engine Options Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableGemini}
                        onChange={e => setEnableGemini(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span className="font-medium">AI-Assisted Contextual Review (Gemini)</span>
                    </label>

                    {enableGemini && (
                      <label
                        className="flex items-center gap-1.5 cursor-pointer text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
                        title="Test Requirement 8: When checked, simulates an external AI outage so you can verify that deterministic checks still run while contextual review is honestly marked incomplete."
                      >
                        <input
                          type="checkbox"
                          checked={simulateAiFailure}
                          onChange={e => setSimulateAiFailure(e.target.checked)}
                          className="rounded border-amber-400 text-amber-700"
                        />
                        <span className="text-[11px] font-semibold">Simulate AI Unavailable (Test Fallback)</span>
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftText('');
                        setContentTitle('Custom Draft Review');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear Editor
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        executeReviewEngine(
                          activeBrandId,
                          draftText,
                          contentTitle,
                          contentType,
                          uploadedFileName || undefined
                        )
                      }
                      disabled={isAnalyzing}
                      className="px-5 py-2 text-xs font-bold text-white bg-[#10243A] hover:bg-slate-800 disabled:bg-slate-400 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          <span>Checking Rules & Claims (Step {analysisStep}/4)...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Check Content</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Honest Check Execution & AI Availability Banner */}
              {activeReport && !isAnalyzing && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
                    activeReport.checksExecuted.geminiContextual && !activeReport.checksExecuted.geminiSuccess
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : activeReport.overallStatus === 'no_issues_detected'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-white border-[#E2E8F0] text-[#10243A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {activeReport.checksExecuted.geminiContextual && !activeReport.checksExecuted.geminiSuccess ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : activeReport.findings.length === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">
                        {activeReport.checksExecuted.geminiContextual && !activeReport.checksExecuted.geminiSuccess
                          ? 'Partial Review (Contextual AI Incomplete): '
                          : activeReport.overallStatus === 'no_issues_detected'
                          ? 'No Issues Detected by Checks That Ran: '
                          : activeReport.overallStatus === 'changes_applied'
                          ? 'All Individual Findings Addressed: '
                          : 'Review Results Ready: '}
                      </span>
                      <span>
                        Evaluated against <strong>{activeReport.checksExecuted.deterministicRulesChecked} approved rules</strong> for{' '}
                        <strong>{activeReport.brandName}</strong>.{' '}
                        {activeReport.checksExecuted.geminiContextual && !activeReport.checksExecuted.geminiSuccess
                          ? 'External AI service was unavailable; deterministic rule checks succeeded, while contextual review is marked incomplete (never treated as full compliance).'
                          : activeReport.toneSummary}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      ID: {activeReport.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        activeReport.checksExecuted.geminiSuccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {activeReport.checksExecuted.geminiContextual
                        ? activeReport.checksExecuted.geminiSuccess
                          ? 'Deterministic + Gemini Verified'
                          : 'Deterministic Only (AI Incomplete)'
                        : 'Deterministic Rules Only'}
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* DUAL-PANE RESULTS & HUMAN DECISION WORKSPACE */}
              {/* ========================================================= */}
              {activeReport && !isAnalyzing && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* LEFT PANE (5 Cols): Working Draft, Original Recovery & Separate Final Content Approval */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs p-4 space-y-3">
                      {/* Draft View Tabs */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setDraftPaneTab('interactive')}
                            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                              draftPaneTab === 'interactive'
                                ? 'bg-white text-[#10243A] shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Working Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraftPaneTab('diff')}
                            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                              draftPaneTab === 'diff'
                                ? 'bg-white text-[#10243A] shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Original vs. Revised
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraftPaneTab('versions')}
                            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                              draftPaneTab === 'versions'
                                ? 'bg-white text-[#10243A] shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Versions ({activeReport.versions.length})
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(activeReport.currentText);
                            triggerToast('Copied current working version to clipboard.', 'success');
                          }}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                      </div>

                      {/* Tab 1: Interactive Highlighted Working Draft */}
                      {draftPaneTab === 'interactive' && (
                        <div className="space-y-2.5">
                          <div className="p-3.5 bg-slate-50/80 rounded-lg border border-[#E2E8F0] min-h-[210px] text-sm text-[#10243A]">
                            {renderHighlightedWorkingDraft()}
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#F05252]"></span> Conflict
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Unverified
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#0F9D8A]"></span> Applied Fix
                              </span>
                            </div>
                            <span className="text-slate-400">Original draft is preserved</span>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Side-by-Side Original vs Revised */}
                      {draftPaneTab === 'diff' && (
                        <div className="space-y-3 text-xs">
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                                Original Submitted Draft (Immutable & Recoverable)
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftText(activeReport.originalText);
                                  triggerToast('Restored original text into the top editor.', 'info');
                                }}
                                className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                              >
                                Load Original in Editor
                              </button>
                            </div>
                            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed font-sans pt-1">
                              {activeReport.originalText}
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                            <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 block">
                              Current Working Version (v{activeReport.versions.length})
                            </span>
                            <p className="text-emerald-950 font-medium whitespace-pre-wrap leading-relaxed font-sans pt-1">
                              {activeReport.currentText}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Version Audit Log */}
                      {draftPaneTab === 'versions' && (
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                          {[...activeReport.versions].reverse().map(ver => (
                            <div
                              key={ver.versionNumber}
                              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-[#10243A]">
                                  Version {ver.versionNumber}.0 — {ver.changeSummary}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(ver.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-700 text-[11px] bg-white p-2 rounded border border-slate-100">
                                "{ver.contentText}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SEPARATE FINAL CONTENT ITEM APPROVAL CARD */}
                    {/* Step 5 Requirement: "The final approval of an entire content item must remain separate from decisions about individual suggestions." */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Step 5 · Separate Content-Level Sign-Off
                          </span>
                          <h3 className="text-xs font-bold text-[#10243A]">
                            Final Content Item Decision (No Auto-Publish)
                          </h3>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            activeReport.contentApprovalStatus === 'approved_for_publication'
                              ? 'bg-[#EAF9F3] text-[#0F9D8A] border-[#A7F3D0]'
                              : activeReport.contentApprovalStatus === 'changes_requested'
                              ? 'bg-[#FFF1EF] text-[#D92D20] border-[#FECACA]'
                              : activeReport.contentApprovalStatus === 'escalated_for_verification'
                              ? 'bg-[#FFF3D6] text-[#B45309] border-[#FDE68A]'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {activeReport.contentApprovalStatus.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        Decisions on individual findings update the working draft above. Approving or rejecting the entire content item for publication is recorded separately here.
                      </p>

                      <input
                        type="text"
                        value={approvalNotesInput}
                        onChange={e => setApprovalNotesInput(e.target.value)}
                        placeholder="Optional reviewer sign-off note (e.g. Approved after fixing NovaPay price & claim)..."
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[#10243A] focus:bg-white focus:outline-none focus:border-blue-500"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleContentApprovalDecision('approved_for_publication')}
                          className="py-2 px-2.5 bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Approve Content</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleContentApprovalDecision('changes_requested')}
                          className="py-2 px-2.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Request Changes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleContentApprovalDecision('escalated_for_verification')}
                          className="py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Verify Claims</span>
                        </button>
                      </div>

                      {activeReport.contentApprovedBy && (
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          Last signed off by <strong>{activeReport.contentApprovedBy}</strong>
                          {activeReport.contentApprovalNotes ? ` — "${activeReport.contentApprovalNotes}"` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANE (7 Cols): EXPLAINED FINDINGS & INDIVIDUAL HUMAN DECISIONS */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#3B82F6]" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                          Explained Findings & Human Decisions ({activeReport.findings.length})
                        </h2>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#D92D20] font-semibold">
                          {summaryMetrics.conflicts} Conflicts Pending
                        </span>
                        <span className="text-[#B45309] font-semibold">
                          {summaryMetrics.verifications} Need Verification
                        </span>
                        <span className="text-[#0F9D8A] font-semibold">
                          {summaryMetrics.decided}/{summaryMetrics.total} Decided
                        </span>
                      </div>
                    </div>

                    {activeReport.findings.length === 0 ? (
                      <div className="bg-white border border-[#E2E8F0] rounded-xl p-10 text-center space-y-2 shadow-2xs">
                        <CheckCircle2 className="w-8 h-8 text-[#0F9D8A] mx-auto" />
                        <h3 className="text-sm font-bold text-[#10243A]">
                          No Issues Identified by the Checks That Ran
                        </h3>
                        <p className="text-xs text-[#64748B] max-w-md mx-auto">
                          No conflicts were found against the {activeReport.checksExecuted.deterministicRulesChecked} approved rules for {activeReport.brandName}.
                        </p>
                      </div>
                    ) : (
                      activeReport.findings.map((f, index) => {
                        const isSelected = selectedFindingId === f.id;
                        const badge = classificationLabel(f.classification);
                        const isUnsupported =
                          f.classification === 'unsupported_claim' ||
                          f.classification === 'needs_human_verification';

                        return (
                          <div
                            key={f.id}
                            onClick={() => setSelectedFindingId(f.id)}
                            className={`bg-white rounded-xl border transition-all p-4 space-y-3 ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                                : 'border-[#E2E8F0] hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            {/* Top Row: Classification, Rule ID, Engine, Decision Status */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono font-bold text-slate-400">
                                  #{index + 1}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.color}`}
                                >
                                  {badge.text}
                                </span>
                                {f.ruleId && (
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setRuleSearchQuery(f.ruleId || '');
                                      setCurrentView('knowledge');
                                    }}
                                    className="text-[11px] font-mono font-bold text-[#10243A] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
                                    title="Click to inspect this rule in Brand Knowledge"
                                  >
                                    Rule: {f.ruleId}
                                  </button>
                                )}
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                  {f.engine === 'deterministic' ? 'Deterministic Engine' : 'Gemini Contextual AI'}
                                </span>
                              </div>

                              {/* Current Decision Pill */}
                              <div>
                                {f.decision === 'accepted' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F9D8A] bg-[#EAF9F3] border border-[#A7F3D0] px-2.5 py-0.5 rounded">
                                    <Check className="w-3 h-3" /> Suggestion Accepted
                                  </span>
                                )}
                                {f.decision === 'edited' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-[#E8F1FF] border border-blue-200 px-2.5 py-0.5 rounded">
                                    <Edit3 className="w-3 h-3" /> Edited & Applied
                                  </span>
                                )}
                                {f.decision === 'rejected' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded">
                                    <X className="w-3 h-3" /> Rejected (Original Kept)
                                  </span>
                                )}
                                {f.decision === 'verification_requested' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                                    <HelpCircle className="w-3 h-3" /> Verification Requested
                                  </span>
                                )}
                                {f.decision === 'pending' && (
                                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200">
                                    Decision Required
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 1. ISSUE: What may be wrong */}
                            <div className="text-xs font-bold text-[#10243A]">
                              {f.conflictText}
                            </div>

                            {/* 2. AFFECTED TEXT & 3. EXPLANATION & 4. EVIDENCE */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                              <div className="p-2.5 rounded-lg bg-red-50/50 border border-red-200/80">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block mb-0.5">
                                  Affected Text in Draft:
                                </span>
                                <span className="font-mono font-semibold text-red-900">
                                  "{f.originalSpan}"
                                </span>
                              </div>

                              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-200/80">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                                  Supporting Approved Rule / Evidence:
                                </span>
                                <span className="font-semibold text-[#10243A] block">
                                  {f.ruleId ? `[${f.ruleId}] ` : ''}
                                  {f.approvedRuleCitation}
                                </span>
                              </div>
                            </div>

                            {/* Explanation */}
                            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                              <strong className="text-[#10243A]">Why flagged: </strong>
                              {f.explanation}
                              {isUnsupported && (
                                <span className="block mt-1 text-[11px] font-semibold text-amber-900">
                                  Note: A missing supporting source does not automatically prove that a claim is false. Please verify with product/legal evidence or adjust the claim.
                                </span>
                              )}
                            </div>

                            {/* 5. SUGGESTED CORRECTION */}
                            {f.suggestedReplacement && (
                              <div className="p-2.5 bg-emerald-50/40 rounded-lg border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                                    Suggested Correction:
                                  </span>
                                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                                    <span className="line-through text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                      {f.originalSpan}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[#0F9D8A] font-bold bg-[#EAF9F3] px-2 py-0.5 rounded border border-[#A7F3D0]">
                                      {f.decision === 'edited' && f.editedReplacement
                                        ? f.editedReplacement
                                        : f.suggestedReplacement}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Inline Edit Suggestion Box */}
                            {editingFindingId === f.id && (
                              <div
                                onClick={e => e.stopPropagation()}
                                className="p-3 bg-blue-50/70 border border-blue-300 rounded-lg space-y-2"
                              >
                                <label className="block text-xs font-bold text-[#10243A]">
                                  Edit Proposed Replacement for "{f.originalSpan}":
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={customEditValues[f.id] ?? f.suggestedReplacement ?? ''}
                                    onChange={e =>
                                      setCustomEditValues(prev => ({ ...prev, [f.id]: e.target.value }))
                                    }
                                    className="flex-1 text-xs bg-white border border-blue-300 rounded-md px-2.5 py-1.5 text-[#10243A] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleFindingDecision(
                                        f,
                                        'edited',
                                        customEditValues[f.id] ?? f.suggestedReplacement ?? f.originalSpan
                                      )
                                    }
                                    className="px-3 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold rounded-md cursor-pointer"
                                  >
                                    Save Edited Version
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingFindingId(null)}
                                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Inline Reject Suggestion Note Box */}
                            {rejectingFindingId === f.id && (
                              <div
                                onClick={e => e.stopPropagation()}
                                className="p-3 bg-slate-100 border border-slate-300 rounded-lg space-y-2"
                              >
                                <label className="block text-xs font-bold text-[#10243A]">
                                  Preserve Original Wording ("{f.originalSpan}") — Optional Reason:
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. Approved campaign exception or contextual fit..."
                                    value={rejectionReasons[f.id] ?? ''}
                                    onChange={e =>
                                      setRejectionReasons(prev => ({ ...prev, [f.id]: e.target.value }))
                                    }
                                    className="flex-1 text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-[#10243A] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleFindingDecision(
                                        f,
                                        'rejected',
                                        undefined,
                                        rejectionReasons[f.id] || 'Reviewer chose to preserve original wording'
                                      )
                                    }
                                    className="px-3 py-1.5 bg-[#10243A] hover:bg-slate-800 text-white text-xs font-bold rounded-md cursor-pointer"
                                  >
                                    Confirm Reject
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingFindingId(null)}
                                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 6. ACTION: Accept Suggestion, Edit Suggestion, Reject Suggestion, or Request Verification */}
                            <div
                              onClick={e => e.stopPropagation()}
                              className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                {f.suggestedReplacement && (
                                  <button
                                    type="button"
                                    onClick={() => handleFindingDecision(f, 'accepted')}
                                    className="px-3 py-1.5 bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white text-xs font-bold rounded-md shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accept Suggestion</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingFindingId(null);
                                    setEditingFindingId(f.id);
                                    setCustomEditValues(prev => ({
                                      ...prev,
                                      [f.id]: f.editedReplacement || f.suggestedReplacement || f.originalSpan
                                    }));
                                  }}
                                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-[#10243A] hover:text-blue-700 border border-[#CBD5E1] text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Suggestion</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFindingId(null);
                                    setRejectingFindingId(f.id);
                                  }}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#64748B] hover:text-[#10243A] border border-[#CBD5E1] text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject Suggestion</span>
                                </button>

                                {isUnsupported && (
                                  <button
                                    type="button"
                                    onClick={() => handleFindingDecision(f, 'verification_requested')}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>Request Human Verification</span>
                                  </button>
                                )}
                              </div>

                              {f.decision !== 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleFindingDecision(f, 'pending')}
                                  className="text-[11px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                                >
                                  Reset Decision
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: BRAND KNOWLEDGE PAGE */}
          {/* ========================================================= */}
          {currentView === 'knowledge' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Header */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-[#10243A]">
                      Brand Knowledge — {activeBrand?.name}
                    </h1>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      {activeBrand?.rules.filter(r => r.status === 'Approved').length || 0} Approved ·{' '}
                      {activeBrand?.rules.filter(r => r.status !== 'Approved').length || 0} Draft/Unverified
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Manage product names, preferred terminology, approved prices & facts, prohibited claims, tone guidelines, and supporting sources.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateRule}
                  className="px-4 py-2 bg-[#10243A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span>Add Brand Rule</span>
                </button>
              </div>

              {/* Authoritative Rule Enforcement Guarantee Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Authoritative Rule Governance:</strong> Only rules with status{' '}
                    <span className="font-bold text-[#0F9D8A] underline">Approved</span> are used by the review engine.{' '}
                    <strong>Draft</strong> or <strong>Unverified</strong> rules never silently become approved information until explicitly approved.
                  </span>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-72 bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={ruleSearchQuery}
                      onChange={e => setRuleSearchQuery(e.target.value)}
                      placeholder="Search rule ID, price, phrase, or source..."
                      className="w-full bg-transparent focus:outline-none text-[#10243A]"
                    />
                    {ruleSearchQuery && (
                      <button
                        onClick={() => setRuleSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Rule Type:</span>
                      <select
                        value={ruleCategoryFilter}
                        onChange={e => setRuleCategoryFilter(e.target.value)}
                        className="bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1 text-xs text-[#10243A] font-medium"
                      >
                        <option value="All">All Rule Types</option>
                        <option value="Terminology">Terminology</option>
                        <option value="Pricing & Facts">Pricing & Facts</option>
                        <option value="Prohibited Claim">Prohibited Claim</option>
                        <option value="Performance & Claims">Performance & Claims</option>
                        <option value="Tone & Style">Tone & Style</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Approval Status:</span>
                      <select
                        value={ruleStatusFilter}
                        onChange={e => setRuleStatusFilter(e.target.value)}
                        className="bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1 text-xs text-[#10243A] font-medium"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Approved">Approved (Authoritative)</option>
                        <option value="Draft">Draft / Unverified Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rules Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Rule ID & Type</th>
                        <th className="py-3 px-4">Title & Rule Statement</th>
                        <th className="py-3 px-4">Trigger / Forbidden Patterns</th>
                        <th className="py-3 px-4">Approved Content / Value</th>
                        <th className="py-3 px-4">Supporting Source Reference</th>
                        <th className="py-3 px-4">Approval Status</th>
                        <th className="py-3 px-4 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {filteredRules.map(rule => (
                        <tr
                          key={rule.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            rule.status !== 'Approved' ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="font-mono font-bold text-[#10243A]">{rule.id}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {rule.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 align-top max-w-xs">
                            <div className="font-bold text-[#10243A]">{rule.title}</div>
                            <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                              {rule.ruleStatement}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {rule.targetPatterns.map((pat, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono text-[11px]"
                                >
                                  "{pat}"
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <span className="px-2 py-1 rounded bg-emerald-50 text-[#0F9D8A] border border-emerald-200 font-semibold inline-block">
                              "{rule.approvedValue}"
                            </span>
                          </td>

                          <td className="py-3.5 px-4 align-top text-[#475569] max-w-xs">
                            <div className="font-medium">{rule.sourceRef}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Updated: {rule.updatedAt}</div>
                          </td>

                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            {rule.status === 'Approved' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F9D8A] bg-[#EAF9F3] border border-[#A7F3D0] px-2.5 py-0.5 rounded">
                                <Check className="w-3 h-3" /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded">
                                <Clock className="w-3 h-3" /> {rule.status} (Not Enforced)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 align-top text-right whitespace-nowrap space-x-2">
                            {rule.status !== 'Approved' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleRuleApproval(rule, 'Approved')}
                                className="px-2.5 py-1 bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white rounded text-[11px] font-bold cursor-pointer"
                              >
                                Approve Rule
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleRuleApproval(rule, 'Draft')}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-medium cursor-pointer"
                                title="Set to Draft so it is no longer enforced"
                              >
                                Set Draft
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditRule(rule)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-bold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Delete rule"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 3: REVIEW HISTORY PAGE */}
          {/* ========================================================= */}
          {currentView === 'history' && (
            <div className="max-w-6xl mx-auto space-y-5">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-[#10243A]">Review History</h1>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Persistent audit history of submitted drafts, identified findings, rule citations, human decisions, revised versions, and final approval status. Survives navigation and application reloads.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={historyBrandFilter}
                    onChange={e => setHistoryBrandFilter(e.target.value)}
                    className="bg-slate-50 border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#10243A]"
                  >
                    <option value="all">All Brands ({auditHistory.length})</option>
                    <option value="novapay">NovaPay</option>
                    <option value="aerosip">AeroSip</option>
                    <option value="skynex">SkyNex Cloud</option>
                  </select>

                  <select
                    value={historyStatusFilter}
                    onChange={e => setHistoryStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#10243A]"
                  >
                    <option value="all">All Approval Statuses</option>
                    <option value="approved_for_publication">Approved for Publication</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="changes_requested">Changes Requested</option>
                    <option value="escalated_for_verification">Escalated for Verification</option>
                  </select>
                </div>
              </div>

              {/* History List Table */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Review ID & Brand</th>
                        <th className="py-3 px-4">Submitted Draft & Revised Version</th>
                        <th className="py-3 px-4">Findings & Rule Refs</th>
                        <th className="py-3 px-4">Human Decisions</th>
                        <th className="py-3 px-4">Content Approval Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {auditHistory
                        .filter(
                          h =>
                            (historyBrandFilter === 'all' || h.brandId === historyBrandFilter) &&
                            (historyStatusFilter === 'all' || h.contentApprovalStatus === historyStatusFilter)
                        )
                        .map(h => {
                          const accepted = h.findings.filter(f => f.decision === 'accepted').length;
                          const edited = h.findings.filter(f => f.decision === 'edited').length;
                          const rejected = h.findings.filter(f => f.decision === 'rejected').length;
                          const pending = h.findings.filter(f => f.decision === 'pending').length;

                          return (
                            <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                <div className="font-mono font-bold text-[#10243A]">{h.id}</div>
                                <div className="text-[11px] font-semibold text-blue-700 mt-0.5">
                                  {h.brandName} · {h.contentType}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {new Date(h.createdAt).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 align-top max-w-sm">
                                <div className="font-bold text-[#10243A] mb-1">{h.title}</div>
                                <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 truncate">
                                  <strong>Original:</strong> "{h.originalText}"
                                </div>
                                {h.currentText !== h.originalText && (
                                  <div className="text-[11px] text-emerald-900 bg-emerald-50/60 p-1.5 rounded border border-emerald-200 truncate mt-1">
                                    <strong>Revised (v{h.versions.length}):</strong> "{h.currentText}"
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 align-top">
                                <div className="font-semibold text-[#10243A] mb-1">
                                  {h.findings.length} finding{h.findings.length === 1 ? '' : 's'}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(new Set(h.findings.map(f => f.ruleId).filter(Boolean))).map(
                                    rId => (
                                      <span
                                        key={rId}
                                        className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                      >
                                        {rId}
                                      </span>
                                    )
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                <div className="space-y-0.5 text-[11px]">
                                  {accepted > 0 && (
                                    <div className="text-[#0F9D8A] font-semibold">✓ {accepted} accepted</div>
                                  )}
                                  {edited > 0 && (
                                    <div className="text-blue-700 font-semibold">✎ {edited} edited</div>
                                  )}
                                  {rejected > 0 && (
                                    <div className="text-slate-600 font-semibold">✕ {rejected} rejected</div>
                                  )}
                                  {pending > 0 && (
                                    <div className="text-amber-700 font-semibold">• {pending} pending</div>
                                  )}
                                  {h.findings.length === 0 && (
                                    <div className="text-emerald-700">No findings</div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                    h.contentApprovalStatus === 'approved_for_publication'
                                      ? 'bg-[#EAF9F3] text-[#0F9D8A] border-[#A7F3D0]'
                                      : h.contentApprovalStatus === 'changes_requested'
                                      ? 'bg-[#FFF1EF] text-[#D92D20] border-[#FECACA]'
                                      : h.contentApprovalStatus === 'escalated_for_verification'
                                      ? 'bg-[#FFF3D6] text-[#B45309] border-[#FDE68A]'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {h.contentApprovalStatus.replace(/_/g, ' ')}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 align-top text-right whitespace-nowrap space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setInspectingHistoryReport(h)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#10243A] rounded text-xs font-semibold cursor-pointer"
                                >
                                  Summary
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReopenReport(h)}
                                  className="px-3 py-1 bg-[#10243A] hover:bg-slate-800 text-white rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Reopen Review</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 4: RECURRING ISSUES & MANAGER ALERTS PAGE */}
          {/* ========================================================= */}
          {currentView === 'recurring' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Top Header & Configurable Threshold Controls */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-[#10243A]">
                    Recurring Issues & Manager Alerts
                  </h1>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Detects when the same confirmed deterministic rule violation repeatedly appears across different drafts.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-xs bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-950">
                    <span className="font-bold">Active Alert Threshold: </span>
                    <span className="font-mono font-bold">
                      ≥{recurrenceConfig.minOccurrences} findings
                    </span>{' '}
                    across{' '}
                    <span className="font-mono font-bold">
                      ≥{recurrenceConfig.minDistinctDrafts} drafts
                    </span>{' '}
                    within{' '}
                    <span className="font-mono font-bold">{recurrenceConfig.windowDays} days</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsThresholdModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#10243A] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </button>
                </div>
              </div>

              {/* Mandatory Scope & Signal Disclaimer (Step 7 Requirement) */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Matching Strategy & Governance Notice:</strong> Deterministic findings are matched strictly using the same approved Rule ID (<span className="font-mono">ruleId</span>). Contextual findings are never grouped merely by similar category.{' '}
                  <strong>
                    A recurring issue is a signal for manager investigation (unclear guidelines, outdated approved information, or a training need), not automatic proof of its cause or an individual's responsibility. SkyNex AI does not automatically train itself or rewrite rules without human approval.
                  </strong>
                </div>
              </div>

              {/* Recurring Issue Cards */}
              <div className="space-y-4">
                {recurringPatterns.map(pat => (
                  <div
                    key={pat.id}
                    className={`bg-white rounded-xl border p-5 shadow-2xs space-y-4 ${
                      pat.thresholdTriggered && pat.status !== 'resolved'
                        ? 'border-amber-400 ring-1 ring-amber-400/30'
                        : 'border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {pat.thresholdTriggered ? (
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            Manager Alert Triggered
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                            Below Alert Threshold (Monitoring)
                          </span>
                        )}

                        <span className="font-mono text-xs font-bold bg-slate-100 text-[#10243A] px-2 py-0.5 rounded border border-slate-200">
                          {pat.ruleId}
                        </span>
                        <span className="text-xs font-bold text-blue-700">{pat.brandName}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-600">{pat.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-800 border border-red-200 font-mono text-xs font-bold">
                          {pat.occurrenceCount} occurrences across {pat.distinctDraftCount} drafts
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            pat.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pat.status === 'investigating'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {pat.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#10243A]">{pat.ruleTitle}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{pat.conflictSummary}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Authoritative Citation: {pat.ruleCitation}
                      </p>
                    </div>

                    {/* Affected Drafts List (With Reopen Links!) */}
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Affected Drafts Within {recurrenceConfig.windowDays}-Day Window ({pat.affectedDrafts.length} Distinct Drafts):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pat.affectedDrafts.map(d => (
                          <div
                            key={d.reportId}
                            className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[#10243A] truncate">
                                {d.title}{' '}
                                <span className="font-mono text-[10px] text-slate-400">({d.reportId})</span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Channel: {d.contentType} · Flagged:{' '}
                                <span className="font-mono text-red-700">"{d.matchedSpan}"</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const found = auditHistory.find(r => r.id === d.reportId);
                                if (found) handleReopenReport(found);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded text-[11px] font-semibold shrink-0 cursor-pointer"
                            >
                              Reopen →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Saved Manager Investigation Summary if Present */}
                    {pat.rootCause && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                        <div className="font-bold text-emerald-950">
                          Manager Investigation Recorded ({pat.actionDate}):{' '}
                          <span className="uppercase font-mono text-emerald-800">
                            {pat.rootCause.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {pat.rootCauseNotes && (
                          <div className="text-emerald-900">
                            <strong>Investigation Finding:</strong> {pat.rootCauseNotes}
                          </div>
                        )}
                        {pat.correctiveActionTaken && (
                          <div className="text-emerald-900">
                            <strong>Follow-Up Action:</strong> {pat.correctiveActionTaken}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-mono">
                        First seen: {pat.firstSeen} · Last seen: {pat.lastSeen}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBrandId(pat.brandId);
                            setRuleSearchQuery(pat.ruleId);
                            setCurrentView('knowledge');
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#10243A] border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Inspect Rule {pat.ruleId}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInvestigatingPattern(pat);
                            setInvRootCause(pat.rootCause || 'unclear_guidelines');
                            setInvNotes(pat.rootCauseNotes || '');
                            setInvAction(pat.correctiveActionTaken || '');
                          }}
                          className="px-3.5 py-1.5 bg-[#10243A] hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Investigate Cause & Record Action
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT BRAND RULE */}
      {/* ========================================================= */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-[#10243A]">
                {editingRule ? `Edit Brand Rule ${editingRule.id}` : `Create Brand Rule (${activeBrand?.name})`}
              </h3>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRuleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#10243A] mb-1">Rule Type / Category</label>
                  <select
                    value={ruleForm.category}
                    onChange={e => setRuleForm({ ...ruleForm, category: e.target.value as RuleCategory })}
                    className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                  >
                    <option value="Terminology">Terminology & Product Name</option>
                    <option value="Pricing & Facts">Pricing & Product Facts</option>
                    <option value="Prohibited Claim">Prohibited Phrase / Claim</option>
                    <option value="Performance & Claims">Performance Claim (Needs Evidence)</option>
                    <option value="Tone & Style">Tone & Writing Guideline</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#10243A] mb-1">Approval Status</label>
                  <select
                    value={ruleForm.status}
                    onChange={e => setRuleForm({ ...ruleForm, status: e.target.value as RuleApprovalStatus })}
                    className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A] font-semibold"
                  >
                    <option value="Approved">Approved (Authoritative)</option>
                    <option value="Draft">Draft (Not Enforced)</option>
                    <option value="Unverified">Unverified (Not Enforced)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">Rule Title</label>
                <input
                  type="text"
                  required
                  value={ruleForm.title}
                  onChange={e => setRuleForm({ ...ruleForm, title: e.target.value })}
                  placeholder="e.g. Official Product Name (NovaPay)"
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">
                  Trigger / Forbidden Phrases (Comma-separated)
                </label>
                <input
                  type="text"
                  value={ruleForm.targetPatterns}
                  onChange={e => setRuleForm({ ...ruleForm, targetPatterns: e.target.value })}
                  placeholder="e.g. Nova Pay, Nova-Pay, guarantees risk-free profits"
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">
                  Approved Content / Replacement Value
                </label>
                <input
                  type="text"
                  required
                  value={ruleForm.approvedValue}
                  onChange={e => setRuleForm({ ...ruleForm, approvedValue: e.target.value })}
                  placeholder="e.g. NovaPay or ₹999/month"
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">
                  Supporting Source Reference / Document
                </label>
                <input
                  type="text"
                  value={ruleForm.sourceRef}
                  onChange={e => setRuleForm({ ...ruleForm, sourceRef: e.target.value })}
                  placeholder="e.g. NovaPay Commercial Rate Schedule 2026 §2.1"
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">Rule Explanation</label>
                <textarea
                  rows={2}
                  value={ruleForm.explanation}
                  onChange={e => setRuleForm({ ...ruleForm, explanation: e.target.value })}
                  placeholder="Explain why violating this rule is flagged..."
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#10243A] hover:bg-slate-800 text-white font-bold rounded-md cursor-pointer"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REVIEW HISTORY SUMMARY INSPECTOR */}
      {/* ========================================================= */}
      {inspectingHistoryReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                  Saved Review Record · {inspectingHistoryReport.id}
                </span>
                <h3 className="text-sm font-bold text-[#10243A]">{inspectingHistoryReport.title}</h3>
              </div>
              <button
                onClick={() => setInspectingHistoryReport(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Original Submitted Draft:
                  </span>
                  <p className="text-slate-800 whitespace-pre-wrap">{inspectingHistoryReport.originalText}</p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">
                    Revised Content (v{inspectingHistoryReport.versions.length}):
                  </span>
                  <p className="text-emerald-950 font-medium whitespace-pre-wrap">
                    {inspectingHistoryReport.currentText}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-[#10243A] uppercase tracking-wider text-[11px]">
                  Findings, Supporting Rules & Recorded Decisions ({inspectingHistoryReport.findings.length}):
                </div>
                {inspectingHistoryReport.findings.map((f, i) => (
                  <div key={f.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#10243A]">
                        #{i + 1} {f.conflictText}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200">
                        Decision: {f.decision}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Rule Reference:</strong> {f.ruleId} — {f.approvedRuleCitation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectingHistoryReport(null)}
                className="px-3 py-1.5 text-xs text-slate-600 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleReopenReport(inspectingHistoryReport)}
                className="px-4 py-1.5 bg-[#10243A] hover:bg-slate-800 text-white text-xs font-bold rounded-md cursor-pointer"
              >
                Reopen in Review Workspace →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: MANAGER INVESTIGATION ON RECURRING ISSUE */}
      {/* ========================================================= */}
      {investigatingPattern && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-amber-50/70">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-800">
                  Recurring Issue Investigation · {investigatingPattern.ruleId}
                </span>
                <h3 className="text-sm font-bold text-[#10243A]">{investigatingPattern.ruleTitle}</h3>
              </div>
              <button
                onClick={() => setInvestigatingPattern(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Detected <strong>{investigatingPattern.occurrenceCount} times</strong> across{' '}
                <strong>{investigatingPattern.distinctDraftCount} drafts</strong> within {recurrenceConfig.windowDays} days.
                Investigate whether this pattern relates to unclear guidelines, outdated approved information, or a team training need.
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1.5">
                  Diagnosed Root-Cause Category:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'unclear_guidelines', label: 'Unclear Guidelines' },
                    { key: 'outdated_approved_info', label: 'Outdated Info' },
                    { key: 'training_need', label: 'Training Need' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setInvRootCause(opt.key as any)}
                      className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                        invRootCause === opt.key
                          ? 'bg-[#10243A] text-white border-[#10243A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">Investigation Notes:</label>
                <textarea
                  rows={2}
                  value={invNotes}
                  onChange={e => setInvNotes(e.target.value)}
                  placeholder="e.g. Agency contractors were referencing an old Q2 pricing slide deck..."
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">
                  Recommended Follow-Up / Process Improvement:
                </label>
                <input
                  type="text"
                  value={invAction}
                  onChange={e => setInvAction(e.target.value)}
                  placeholder="e.g. Clarified rule wording in Brand Knowledge and circulated updated ₹999/month rate sheet."
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInvestigatingPattern(null)}
                  className="px-3 py-1.5 text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInvestigation('investigating')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#10243A] font-semibold rounded-md cursor-pointer"
                >
                  Save as Investigating
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInvestigation('resolved')}
                  className="px-4 py-1.5 bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white font-bold rounded-md cursor-pointer"
                >
                  Record Action & Resolve Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: CONFIGURE RECURRENCE THRESHOLD */}
      {/* ========================================================= */}
      {isThresholdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveThresholdConfig}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#10243A]">
                Configure Recurring-Issue Alert Threshold
              </h3>
              <button
                type="button"
                onClick={() => setIsThresholdModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#10243A] mb-1">
                  Minimum Matching Findings (Default: 3)
                </label>
                <input
                  type="number"
                  min={1}
                  value={thresholdForm.minOccurrences}
                  onChange={e =>
                    setThresholdForm({ ...thresholdForm, minOccurrences: Number(e.target.value) })
                  }
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">
                  Minimum Distinct Drafts (Default: 2)
                </label>
                <input
                  type="number"
                  min={1}
                  value={thresholdForm.minDistinctDrafts}
                  onChange={e =>
                    setThresholdForm({ ...thresholdForm, minDistinctDrafts: Number(e.target.value) })
                  }
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#10243A] mb-1">
                  Lookback Window in Days (Default: 7)
                </label>
                <input
                  type="number"
                  min={1}
                  value={thresholdForm.windowDays}
                  onChange={e =>
                    setThresholdForm({ ...thresholdForm, windowDays: Number(e.target.value) })
                  }
                  className="w-full border border-[#CBD5E1] rounded-md p-2 text-[#10243A]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsThresholdModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#10243A] text-white font-bold rounded-md cursor-pointer"
              >
                Save Threshold
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
