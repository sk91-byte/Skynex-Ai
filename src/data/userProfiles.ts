import { UserProfile } from '../types.ts';

export const USER_PROFILES: UserProfile[] = [
  {
    id: 'usr-mvance-02',
    name: 'Marcus Vance',
    role: 'brand_manager',
    roleLabel: 'Brand Governance Lead',
    title: 'Head of Brand Governance & Standards',
    department: 'Brand Architecture & Standards Office',
    email: 'marcus.vance@skynex.enterprise',
    initials: 'MV',
    avatarColor: 'bg-indigo-600 text-white',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    permissions: {
      canSubmitContent: true,
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: true,
      canManageRules: true,
      canDeprecateRules: true,
      canExecuteMemo: true,
      canExportAuditLog: true,
      canClearLegalFlags: true
    },
    description: 'Full administrative authority over canonical brand guidelines, terminology tables, pricing rules, recurring conflict memos, and team escalation waivers.',
    responsibilities: [
      'Maintains canonical terminology and commercial facts',
      'Approves new brand rule additions and deprecations',
      'Issues Brand Clarity Memos on recurring patterns',
      'Grants brand policy waivers and updates guidelines'
    ]
  },
  {
    id: 'usr-slin-01',
    name: 'Sarah Lin',
    role: 'creator',
    roleLabel: 'Marketing Creator',
    title: 'Senior Growth & Product Copywriter',
    department: 'Global Growth & Brand Marketing',
    email: 'sarah.lin@skynex.enterprise',
    initials: 'SL',
    avatarColor: 'bg-blue-600 text-white',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    permissions: {
      canSubmitContent: true,
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: false,
      canManageRules: false,
      canDeprecateRules: false,
      canExecuteMemo: false,
      canExportAuditLog: true,
      canClearLegalFlags: false
    },
    description: 'Generates campaign content, checks drafts against brand guidelines, accepts suggested fixes, and requests compliance reviews. Restricted from modifying canonical rules.',
    responsibilities: [
      'Drafts marketing campaigns, landing pages, and email copy',
      'Runs content verification against canonical brand guidelines',
      'Accepts or custom-edits proposed rule replacements',
      'Escalates ambiguous claims for legal verification'
    ]
  },
  {
    id: 'usr-erostova-03',
    name: 'Elena Rostova',
    role: 'legal_counsel',
    roleLabel: 'Legal & Regulatory Counsel',
    title: 'VP of Regulatory Affairs & Legal Counsel',
    department: 'Legal, Risk & Regulatory Affairs',
    email: 'elena.rostova@skynex.enterprise',
    initials: 'ER',
    avatarColor: 'bg-amber-600 text-white',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    permissions: {
      canSubmitContent: true,
      canApplyFixes: true,
      canEditDraft: true,
      canApproveWaiver: true,
      canManageRules: true,
      canDeprecateRules: false,
      canExecuteMemo: true,
      canExportAuditLog: true,
      canClearLegalFlags: true
    },
    description: 'Specialized regulatory oversight of high-liability claims (SLA guarantees, competitor disparagement, pricing disclaimers). Grants legally binding clearances.',
    responsibilities: [
      'Audits high-liability claims flagged for verification',
      'Authorizes formal legal waivers and disclaimers',
      'Enforces FTC, SLA, and regulatory compliance',
      'Reviews compliance audit logs and risk exposure'
    ]
  },
  {
    id: 'usr-dsterling-04',
    name: 'David Sterling',
    role: 'executive',
    roleLabel: 'Executive Auditor',
    title: 'VP of Brand Trust & Customer Experience',
    department: 'Executive Committee & Corporate Governance',
    email: 'david.sterling@skynex.enterprise',
    initials: 'DS',
    avatarColor: 'bg-emerald-600 text-white',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    permissions: {
      canSubmitContent: false,
      canApplyFixes: false,
      canEditDraft: false,
      canApproveWaiver: true,
      canManageRules: false,
      canDeprecateRules: false,
      canExecuteMemo: true,
      canExportAuditLog: true,
      canClearLegalFlags: false
    },
    description: 'Executive surveillance of governance metrics, recurring error patterns, risk indicators, and audit trails. Draft editing disabled to preserve live copy integrity.',
    responsibilities: [
      'Monitors cross-departmental brand health scores',
      'Audits systemic recurring patterns and root causes',
      'Inspects historical audit records and compliance logs',
      'Exports executive governance reports'
    ]
  }
];

export const DEFAULT_USER_PROFILE = USER_PROFILES[0]; // Marcus Vance (Brand Governance Lead)
