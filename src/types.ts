export type BrandId = 'aerosip' | 'novapay' | 'skynex';

export type UserRole = 'creator' | 'brand_manager' | 'legal_counsel' | 'executive';

export interface RolePermissions {
  canSubmitContent: boolean;
  canApplyFixes: boolean;
  canEditDraft: boolean;
  canApproveWaiver: boolean;
  canManageRules: boolean;
  canDeprecateRules: boolean;
  canExecuteMemo: boolean;
  canExportAuditLog: boolean;
  canClearLegalFlags: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  department: string;
  email: string;
  initials: string;
  avatarColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  permissions: RolePermissions;
  description: string;
  responsibilities: string[];
}

export type FindingClassification =
  | 'confirmed_rule_conflict'
  | 'approved_fact_conflict'
  | 'unsupported_claim'
  | 'style_tone_suggestion'
  | 'needs_human_verification';

export type ReviewStatusOutcome =
  | 'issues_found'
  | 'no_issues_detected'
  | 'needs_human_verification'
  | 'partial_review_ai_unavailable'
  | 'extraction_incomplete'
  | 'changes_applied';

export type DecisionStatus = 'pending' | 'accepted' | 'edited' | 'rejected' | 'escalated';

export interface GuidelineRule {
  id: string;
  category: 'Terminology' | 'Pricing & Facts' | 'Regulatory & Claims' | 'Tone of Voice' | 'Performance Claims' | 'Asset & Style';
  title: string;
  rule: string;
  rationale: string;
  severity: 'critical' | 'warning' | 'info';
  citation: string;
  sourceLabel?: string;
  sourceUrl?: string;
  status: 'active' | 'draft' | 'inactive' | 'needs_review';
  version: string;
}

export interface ProductFact {
  id: string;
  key: string;
  approvedValue: string;
  unit?: string;
  context: string;
}

export interface ProhibitedTerm {
  term: string;
  category: string;
  explanation: string;
  suggestedAlternative: string;
  severity: 'critical' | 'warning';
}

export interface BrandProfile {
  id: BrandId;
  name: string;
  tagline: string;
  industry: string;
  primaryColor: string;
  guidelines: GuidelineRule[];
  facts: ProductFact[];
  prohibitedTerms: ProhibitedTerm[];
  approvedTerms: { term: string; context: string }[];
  requiredDisclaimers: { triggerKeyword: string; disclaimerText: string; reason: string }[];
}

export interface AuditFinding {
  id: string;
  classification: FindingClassification;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  originalSpan: string;
  startIndex: number;
  endIndex: number;
  conflictText: string;
  ruleId?: string;
  approvedRuleCitation: string;
  sourceReference?: string;
  explanation: string;
  suggestedReplacement?: string;
  requiresHumanReview: boolean;
  engine: 'deterministic' | 'gemini' | 'hybrid';
  decision: DecisionStatus;
  editedReplacement?: string;
  rejectionReason?: string;
  reviewerComment?: string;
  timestamp: string;
}

export interface DraftVersion {
  versionNumber: number;
  contentText: string;
  changeSummary: string;
  createdByRole: string;
  createdAt: string;
}

export interface AuditReport {
  id: string;
  brandId: BrandId;
  campaign: string;
  contentType: string;
  title?: string;
  sourceFilename?: string;
  originalText: string;
  currentText: string;
  versions: DraftVersion[];
  findings: AuditFinding[];
  checksExecuted: {
    deterministic: boolean;
    geminiContextual: boolean;
    geminiSuccess: boolean;
  };
  overallStatus: ReviewStatusOutcome;
  createdAt: string;
  completedAt?: string;
}

export interface RecurringPattern {
  id: string;
  brandId: BrandId;
  category: string;
  ruleCitation: string;
  ruleId?: string;
  conflictSummary: string;
  occurrenceCount: number;
  distinctDraftCount: number;
  creatorsInvolved: string[];
  campaignsInvolved: string[];
  firstSeen: string;
  lastSeen: string;
  status: 'alert_active' | 'investigating' | 'resolved';
  rootCause?: 'unclear_rule' | 'outdated_reference' | 'training_needed' | 'tooling_gap';
  rootCauseNotes?: string;
  correctiveActionTaken?: string;
  actionDate?: string;
}

export interface BenchmarkScenario {
  id: string;
  brandId: BrandId;
  title: string;
  badge: string;
  campaign: string;
  contentType: string;
  text: string;
  expectedIssuesDescription: string;
}
