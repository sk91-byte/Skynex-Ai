export type BrandId = 'novapay' | 'aerosip' | 'skynex' | string;

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

export type RuleCategory =
  | 'Terminology'
  | 'Pricing & Facts'
  | 'Prohibited Claim'
  | 'Performance & Claims'
  | 'Tone & Style';

export type ImportedKnowledgeCategory =
  | 'Brand Identity'
  | 'Brand Voice & Writing Style'
  | 'Product Knowledge'
  | 'Pricing & Commercial Information'
  | 'Claims & Supporting Evidence'
  | 'Channel-Specific Guidelines'
  | 'Accessibility & Other Brand Requirements';

export type RuleApprovalStatus = 'Approved' | 'Draft' | 'Unverified';

export type CandidateReviewStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Needs Verification'
  | 'Conflicting Information';

export type FindingClassification =
  | 'confirmed_rule_conflict'
  | 'approved_fact_conflict'
  | 'prohibited_claim'
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

export type ContentApprovalStatus =
  | 'pending_review'
  | 'approved_for_publication'
  | 'changes_requested'
  | 'escalated_for_verification';

export type DecisionStatus = 'pending' | 'accepted' | 'edited' | 'rejected' | 'verification_requested';

export interface RuleVersionEntry {
  version: number;
  title: string;
  ruleStatement: string;
  approvedValue: string;
  targetPatterns: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface MergedSourceRef {
  documentId?: string;
  filename: string;
  location: string;
  excerpt: string;
}

export interface BrandRule {
  id: string;
  brandId: BrandId;
  category: RuleCategory;
  importedCategory?: ImportedKnowledgeCategory;
  title: string;
  ruleStatement: string;
  targetPatterns: string[];
  approvedValue: string;
  sourceRef: string;
  status: RuleApprovalStatus;
  classification: FindingClassification;
  severity: 'critical' | 'warning' | 'info';
  explanation: string;
  updatedAt: string;
  // Extended traceability & versioning fields (Sections 9 & 11)
  version?: number;
  versionHistory?: RuleVersionEntry[];
  sourceDocumentId?: string;
  sourceFilename?: string;
  sourceLocation?: string;
  evidenceExcerpt?: string;
  fullSourceContext?: string;
  mergedSources?: MergedSourceRef[];
  approvedBy?: string;
  approvedAt?: string;
  structuredMeta?: {
    productName?: string;
    sku?: string;
    price?: string;
    currency?: string;
    billingPeriod?: string;
    effectiveDate?: string;
    conditions?: string;
  };
}

export type CompanyTypeOption =
  | 'SaaS'
  | 'E-commerce'
  | 'Retail'
  | 'Fintech'
  | 'Healthcare'
  | 'Education'
  | 'Agency'
  | 'Other';

export interface BrandOnboardingProfile {
  companyName: string;
  companyType: CompanyTypeOption;
  description?: string;
  mainChannels: string[];
  preferredLanguage?: string;
  preferredTone?: string;
  suggestedCategories: ImportedKnowledgeCategory[];
  updatedAt: string;
}

export interface StructuredColumnMapping {
  productNameCol: string;
  skuCol: string;
  descriptionCol: string;
  priceCol: string;
  currencyCol: string;
  billingPeriodCol: string;
  approvedClaimsCol: string;
  sourceRefCol: string;
}

export interface StructuredRowValidationError {
  rowIndex: number; // 1-indexed data row
  rawRow: Record<string, string>;
  issues: string[];
  isValid: boolean;
}

export interface StructuredCataloguePreview {
  documentId: string;
  filename: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  columnMapping: StructuredColumnMapping;
  validationResults: StructuredRowValidationError[];
  validRowCount: number;
  invalidRowCount: number;
}

export interface SourceDocument {
  id: string;
  brandId: BrandId;
  filename: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'md' | 'unsupported';
  fileSizeBytes: number;
  uploadedAt: string;
  processingStatus: 'queued' | 'processed' | 'partial' | 'needs_attention' | 'failed';
  extractionStatus: 'complete' | 'partial_extraction' | 'structured_catalogue' | 'failed';
  pageOrSectionCount: number;
  chunksProcessed: number;
  unprocessedSections: string[];
  errorMessage?: string;
  isApprovedExample?: boolean;
  extractedCharCount?: number;
  structuredCatalogue?: StructuredCataloguePreview;
}

export interface CompetingConflictOption {
  candidateId: string;
  value: string;
  ruleText: string;
  sourceDocumentId: string;
  sourceFilename: string;
  sourceLocation: string;
  effectiveDate?: string;
  evidenceExcerpt: string;
}

export interface KnowledgeCandidate {
  id: string;
  brandId: BrandId;
  category: ImportedKnowledgeCategory;
  engineCategory: RuleCategory;
  title: string;
  extractedRule: string;
  relevantValue: string;
  targetPatterns: string[];
  structuredMeta?: {
    productName?: string;
    sku?: string;
    price?: string;
    currency?: string;
    billingPeriod?: string;
    effectiveDate?: string;
    conditions?: string;
  };
  sourceDocumentId: string;
  sourceFilename: string;
  sourceLocation: string;
  evidenceExcerpt: string;
  fullSourceContext: string;
  status: CandidateReviewStatus;
  // Duplicate & Conflict Tracking
  isDuplicate?: boolean;
  duplicateOfRuleId?: string;
  mergedSources?: MergedSourceRef[];
  conflictKey?: string;
  conflictTopic?: string;
  competingOptions?: CompetingConflictOption[];
  resolvedValue?: string;
  // Style / Example Tracking
  isFromApprovedExample?: boolean;
  contradictsExplicitRuleId?: string;
  contradictionNote?: string;
  // Audit trail
  reviewedBy?: string;
  reviewedAt?: string;
  promotedRuleId?: string;
  createdAt: string;
}

export interface ImportProcessingSummary {
  sessionId: string;
  timestamp: string;
  filesProcessedSuccessfully: number;
  filesNeedingAttention: number;
  candidateRulesExtracted: number;
  potentialDuplicatesCount: number;
  conflictingRulesCount: number;
  unprocessedSections: { filename: string; section: string; reason: string }[];
  categoriesCoverage: Record<ImportedKnowledgeCategory, 'found' | 'not_found'>;
  aiUsed: boolean;
  aiWarning?: string;
}

export interface SampleScenario {
  id: string;
  brandId: BrandId;
  title: string;
  badge: string;
  contentType: string;
  text: string;
  description: string;
}

export interface BrandProfile {
  id: BrandId;
  name: string;
  fictionalLabel: string;
  tagline: string;
  industry: string;
  primaryColor: string;
  onboarding?: BrandOnboardingProfile;
  rules: BrandRule[];
  sourceDocuments?: SourceDocument[];
  knowledgeCandidates?: KnowledgeCandidate[];
  lastImportSummary?: ImportProcessingSummary;
  sampleScenarios: SampleScenario[];
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
  ruleVersion?: number;
  ruleTitle?: string;
  approvedRuleCitation: string;
  sourceReference?: string;
  sourceLocation?: string;
  explanation: string;
  suggestedReplacement?: string;
  requiresHumanReview: boolean;
  engine: 'deterministic' | 'gemini';
  decision: DecisionStatus;
  editedReplacement?: string;
  rejectionReason?: string;
  reviewerComment?: string;
  decidedBy?: string;
  decidedAt?: string;
  timestamp: string;
}

export interface DraftVersion {
  versionNumber: number;
  contentText: string;
  changeSummary: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

export interface AuditReport {
  id: string;
  brandId: BrandId;
  brandName: string;
  campaign: string;
  contentType: string;
  title: string;
  sourceFilename?: string;
  originalText: string;
  currentText: string;
  versions: DraftVersion[];
  findings: AuditFinding[];
  toneSummary?: string;
  checksExecuted: {
    deterministic: boolean;
    deterministicRulesChecked: number;
    geminiContextual: boolean;
    geminiSuccess: boolean;
    geminiError?: string;
  };
  overallStatus: ReviewStatusOutcome;
  contentApprovalStatus: ContentApprovalStatus;
  contentApprovedBy?: string;
  contentApprovedAt?: string;
  contentApprovalNotes?: string;
  submittedBy: string;
  submittedByRole: string;
  submittedByRoleKey: UserRole;
  createdAt: string;
  completedAt?: string;
}

export interface AffectedDraftRef {
  reportId: string;
  title: string;
  contentType: string;
  submittedAt: string;
  matchedSpan: string;
}

export interface RecurringPattern {
  id: string;
  brandId: BrandId;
  brandName: string;
  category: string;
  ruleId: string;
  ruleTitle: string;
  ruleCitation: string;
  conflictSummary: string;
  occurrenceCount: number;
  distinctDraftCount: number;
  affectedDrafts: AffectedDraftRef[];
  affectedChannels: string[];
  firstSeen: string;
  lastSeen: string;
  thresholdTriggered: boolean;
  status: 'monitoring' | 'alert_active' | 'investigating' | 'resolved';
  rootCause?: 'unclear_guidelines' | 'outdated_approved_info' | 'training_need';
  rootCauseNotes?: string;
  correctiveActionTaken?: string;
  investigatedBy?: string;
  actionDate?: string;
}

export interface RecurrenceThresholdConfig {
  minOccurrences: number;
  minDistinctDrafts: number;
  windowDays: number;
}
