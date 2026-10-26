import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
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
  ExternalLink,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Sliders,
  Download,
  BookOpen,
  Clock,
  User,
  UserCheck,
  Lock,
  Unlock,
  Award,
  Save,
  Eye,
  Trash2,
  ArrowUpRight,
  HelpCircle,
  FileCheck,
  CheckCheck
} from 'lucide-react';
import { USER_PROFILES, DEFAULT_USER_PROFILE } from './data/userProfiles.ts';
import { UserProfile, UserRole } from './types.ts';

// ==========================================
// MOCK DATA & KNOWLEDGE BASE
// ==========================================

const INITIAL_BRAND_RULES = [
  {
    id: 'RULE-PRD-102',
    category: 'Terminology',
    title: 'Product Naming Convention',
    targetPattern: 'SkyNex Pro',
    approvedValue: 'SkyNex Enterprise',
    sourceRef: 'Brand Identity Manual 2026 §3.1 (Nomenclature)',
    status: 'Approved',
    severity: 'conflict',
    explanation: "The legacy product moniker 'SkyNex Pro' was deprecated in Q3 2025. All tier offerings above Starter must be designated 'SkyNex Enterprise' to prevent contract ambiguity.",
    updatedAt: '2026-02-14'
  },
  {
    id: 'RULE-FIN-204',
    category: 'Pricing',
    title: 'Current Base Seat Licensing',
    targetPattern: '$49/mo',
    approvedValue: '$79/mo',
    sourceRef: 'Q1 Master Commercial Schedule §1.4',
    status: 'Approved',
    severity: 'conflict',
    explanation: "Effective January 1, 2026, the approved standard enterprise seat price is $79/mo. Publishing $49/mo breaches authorized discounting policies and creates pricing liability.",
    updatedAt: '2026-01-05'
  },
  {
    id: 'RULE-MKT-408',
    category: 'Claims',
    title: 'Competitor Disparagement Prohibition',
    targetPattern: "Unlike Acme Cloud's clunky and sluggish interface,",
    approvedValue: "Engineered for high-velocity enterprise teams,",
    sourceRef: 'Global Competitive Positioning Guidelines §7.2',
    status: 'Approved',
    severity: 'conflict',
    explanation: "Direct naming and derogatory characterization of competitors is strictly prohibited under our fair advertising policy. Frame advantages in terms of our native capabilities.",
    updatedAt: '2025-11-20'
  },
  {
    id: 'RULE-LGL-310',
    category: 'Claims',
    title: 'Service Level Agreement Threshold',
    targetPattern: 'guaranteed 100% uptime SLA with zero seconds of annual downtime',
    approvedValue: 'enterprise 99.99% uptime commitment',
    sourceRef: 'Infrastructure SLA Disclosure Policy §2.1',
    status: 'Approved',
    severity: 'verification',
    explanation: "Legal counsel prohibits absolute '100% uptime' or 'zero downtime' claims without written VP Infrastructure sign-off. Standard SLA commitment is 99.99%.",
    updatedAt: '2026-03-01'
  },
  {
    id: 'RULE-TON-055',
    category: 'Tone',
    title: 'Executive Assurance Tone',
    targetPattern: 'undisputed market leaders',
    approvedValue: 'recognized industry innovators',
    sourceRef: 'Voice & Tone Playbook §2.4 (Substantiation)',
    status: 'Approved',
    severity: 'suggestion',
    explanation: "Unsubstantiated market leadership claims trigger advertising compliance scrutiny. Prefer defensible, qualitative positioning unless citing analyst reports.",
    updatedAt: '2026-02-28'
  }
];

const INITIAL_HISTORY = [
  {
    id: 'REV-8941',
    title: 'Q1 Enterprise Launch Email Campaign',
    channel: 'Email',
    submittedAt: 'Today, 10:15 AM',
    author: 'Sarah Lin',
    authorRole: 'Marketing Creator',
    authorRoleKey: 'creator' as UserRole,
    authorInitials: 'SL',
    authorColor: 'bg-blue-600',
    status: 'Needs Review',
    conflictsCount: 2,
    verificationCount: 1,
    contentPreview: 'Subject: Unlock next-gen productivity with SkyNex Pro tier upgrade...',
    resolved: false
  },
  {
    id: 'REV-8938',
    title: 'Customer Onboarding Help Center Update',
    channel: 'Website Copy',
    submittedAt: 'Yesterday, 4:20 PM',
    author: 'Marcus Vance',
    authorRole: 'Brand Governance Lead',
    authorRoleKey: 'brand_manager' as UserRole,
    authorInitials: 'MV',
    authorColor: 'bg-indigo-600',
    status: 'Compliant',
    conflictsCount: 0,
    verificationCount: 0,
    contentPreview: 'Step 1: Configure your SSO settings inside SkyNex Enterprise tenant admin...',
    resolved: true
  },
  {
    id: 'REV-8935',
    title: '99.99% Infrastructure SLA Claim Verification',
    channel: 'Whitepaper',
    submittedAt: 'Yesterday, 11:30 AM',
    author: 'Elena Rostova',
    authorRole: 'Legal & Regulatory Counsel',
    authorRoleKey: 'legal_counsel' as UserRole,
    authorInitials: 'ER',
    authorColor: 'bg-amber-600',
    status: 'Compliant',
    conflictsCount: 0,
    verificationCount: 0,
    contentPreview: 'Audited SLA language against infrastructure disaster recovery disclosures...',
    resolved: true
  },
  {
    id: 'REV-8924',
    title: 'LinkedIn Product Announcement Brief',
    channel: 'Social Post',
    submittedAt: '2 days ago',
    author: 'David Sterling',
    authorRole: 'Executive Auditor',
    authorRoleKey: 'executive' as UserRole,
    authorInitials: 'DS',
    authorColor: 'bg-emerald-600',
    status: 'Compliant',
    conflictsCount: 0,
    verificationCount: 0,
    contentPreview: 'Excited to showcase our newest workflow automation milestones with 99.99% reliability...',
    resolved: true
  }
];

const INITIAL_RECURRING_ISSUES = [
  {
    id: 'REC-01',
    ruleId: 'RULE-FIN-204',
    title: 'Outdated $49/mo Pricing in Active Marketing Copy',
    occurrences: 8,
    affectedChannels: ['Email (4)', 'Social (3)', 'Website (1)'],
    rootCause: 'Outdated legacy sales deck templates in Notion and Canva are still circulating among external marketing contractors.',
    severity: 'High Impact',
    recommendedAction: 'Issue an automated Slack guideline alert to Content Marketing & re-index Notion workspace assets.',
    status: 'Investigation Open'
  },
  {
    id: 'REC-02',
    ruleId: 'RULE-PRD-102',
    title: "Deprecated 'SkyNex Pro' Product Naming",
    occurrences: 14,
    affectedChannels: ['Social Post (9)', 'Email (5)'],
    rootCause: 'Agency partners using 2024 pitch deck swipe files without reviewing the 2026 rebranding brief.',
    severity: 'Moderate',
    recommendedAction: 'Trigger mandatory Brand Knowledge re-certification for external agency workspace users.',
    status: 'Action Scheduled'
  },
  {
    id: 'REC-03',
    ruleId: 'RULE-LGL-310',
    title: "Unverified '100% Uptime' SLA Claims",
    occurrences: 5,
    affectedChannels: ['Ad Copy (3)', 'Landing Pages (2)'],
    rootCause: 'Performance marketing team testing aggressive conversion copy without submitting to legal review queues.',
    severity: 'Critical Legal',
    recommendedAction: 'Enforce pre-publication sign-off workflow for paid advertising spend above $5k.',
    status: 'Under Review'
  }
];

const SAMPLE_DRAFT_TEXT = `Introducing SkyNex Pro: The Next Generation Cloud Platform

We are thrilled to announce that SkyNex Pro is now available for all enterprise clients starting at just $49/mo per seat. Unlike Acme Cloud's clunky and sluggish interface, our unified infrastructure delivers guaranteed 100% uptime SLA with zero seconds of annual downtime.

Sign up before October 31 to lock in our legacy tier pricing and experience why we are undisputed market leaders in cloud delivery.`;

const BRAND_PRESETS = {
  skynex: {
    id: 'skynex',
    name: 'Global Enterprise Core v2.4',
    category: 'B2B Cloud SaaS',
    tagline: 'Enterprise Cloud Infrastructure & SLA Governance',
    rules: INITIAL_BRAND_RULES,
    sampleDraft: SAMPLE_DRAFT_TEXT,
    title: 'Q4 Enterprise Value Proposition',
    channel: 'Website Copy',
    initialFindings: [
      {
        id: 'find-1',
        ruleId: 'RULE-PRD-102',
        type: 'conflict',
        category: 'Terminology Conflict',
        affectedText: 'SkyNex Pro',
        explanation: "The product name 'SkyNex Pro' was retired in Q3 2025. Current standard enterprise branding is 'SkyNex Enterprise'.",
        ruleSource: 'Brand Identity Manual 2026 §3.1',
        suggestedFix: 'SkyNex Enterprise',
        decisionState: 'pending',
        customFixText: 'SkyNex Enterprise'
      },
      {
        id: 'find-2',
        ruleId: 'RULE-FIN-204',
        type: 'conflict',
        category: 'Price Conflict',
        affectedText: '$49/mo',
        explanation: "Approved standard tier pricing is $79/mo. Publishing $49/mo triggers commercial liability under Q1 guidelines.",
        ruleSource: 'Q1 Master Commercial Schedule §1.4',
        suggestedFix: '$79/mo',
        decisionState: 'pending',
        customFixText: '$79/mo'
      },
      {
        id: 'find-3',
        ruleId: 'RULE-MKT-408',
        type: 'conflict',
        category: 'Prohibited Claim',
        affectedText: "Unlike Acme Cloud's clunky and sluggish interface,",
        explanation: "Direct derogatory competitor claims violate brand ethics standard §7.2. Highlight native architectural advantages instead.",
        ruleSource: 'Global Competitive Positioning Guidelines §7.2',
        suggestedFix: 'Engineered for high-velocity enterprise teams,',
        decisionState: 'pending',
        customFixText: 'Engineered for high-velocity enterprise teams,'
      },
      {
        id: 'find-4',
        ruleId: 'RULE-LGL-310',
        type: 'verification',
        category: 'Needs Verification',
        affectedText: 'guaranteed 100% uptime SLA with zero seconds of annual downtime',
        explanation: "Contractual guarantees cannot exceed 99.99% without an active CTO infrastructure waiver.",
        ruleSource: 'Infrastructure SLA Disclosure Policy §2.1',
        suggestedFix: 'enterprise 99.99% uptime commitment',
        decisionState: 'pending',
        customFixText: 'enterprise 99.99% uptime commitment'
      },
      {
        id: 'find-5',
        ruleId: 'RULE-TON-055',
        type: 'suggestion',
        category: 'Tone Suggestion',
        affectedText: 'undisputed market leaders',
        explanation: "Tone guideline recommends defensible value terminology over unsubstantiated superlatives.",
        ruleSource: 'Voice & Tone Playbook §2.4',
        suggestedFix: 'recognized industry innovators',
        decisionState: 'pending',
        customFixText: 'recognized industry innovators'
      }
    ]
  },
  aerosip: {
    id: 'aerosip',
    name: 'AeroSip Beverages v3.1',
    category: 'Consumer FMCG & HealthTech',
    tagline: 'Precision Hydration Systems & Smart Thermal Vessels',
    rules: [
      {
        id: 'AS-G01',
        category: 'Terminology',
        title: 'Mandatory Brand Name Spelling',
        targetPattern: 'Aero Sip',
        approvedValue: 'AeroSip',
        sourceRef: 'AeroSip Identity Manual 2026, Rule 1.1',
        status: 'Approved',
        severity: 'conflict',
        explanation: 'The brand name is strictly "AeroSip" (CamelCase with capital A and S, no spaces or hyphens).',
        updatedAt: '2026-03-15'
      },
      {
        id: 'AS-G02',
        category: 'Pricing',
        title: 'Approved Canonical Offer Price',
        targetPattern: '₹899',
        approvedValue: '₹999',
        sourceRef: 'Commercial Price Schedule 2026, Section 2',
        status: 'Approved',
        severity: 'conflict',
        explanation: 'AeroSip Smart Hydration Vessel promotional price is ₹999. Publishing ₹899 violates retail pricing agreements.',
        updatedAt: '2026-03-10'
      },
      {
        id: 'AS-G03',
        category: 'Claims',
        title: 'Insulation Lab Verification Standard',
        targetPattern: 'keeps drinks cold for 72 hours ice cold',
        approvedValue: 'certified 24h cold thermal insulation',
        sourceRef: 'Intertek Lab Test Report #4412',
        status: 'Approved',
        severity: 'verification',
        explanation: 'Thermal performance claims exceeding certified 24h cold require human engineering verification and lab sign-off.',
        updatedAt: '2026-02-20'
      },
      {
        id: 'AS-G04',
        category: 'Claims',
        title: 'Prohibition on Medical Cure Claims',
        targetPattern: 'curing dehydration migraines and fatigue naturally',
        approvedValue: 'supporting optimal daily hydration and focus',
        sourceRef: 'CDSCO Health Claims Compliance Standards Doc 8.3',
        status: 'Approved',
        severity: 'conflict',
        explanation: 'Medical disease cure or clinical health diagnosis claims are strictly prohibited under consumer protection regulations.',
        updatedAt: '2026-01-18'
      }
    ],
    sampleDraft: `Introducing the all-new Aero Sip smart hydration vessel!

Available now for pre-order at an exclusive launch price of ₹899 per bottle. Engineered with double-walled vacuum insulation that keeps drinks cold for 72 hours ice cold, curing dehydration migraines and fatigue naturally for peak daily performance.`,
    title: 'AeroSip Smart Bottle Launch Campaign',
    channel: 'Social Post',
    initialFindings: [
      {
        id: 'as-find-1',
        ruleId: 'AS-G01',
        type: 'conflict',
        category: 'Terminology Conflict',
        affectedText: 'Aero Sip',
        explanation: 'The brand name must be written strictly as single word "AeroSip".',
        ruleSource: 'AeroSip Identity Manual 2026, Rule 1.1',
        suggestedFix: 'AeroSip',
        decisionState: 'pending',
        customFixText: 'AeroSip'
      },
      {
        id: 'as-find-2',
        ruleId: 'AS-G02',
        type: 'conflict',
        category: 'Price Conflict',
        affectedText: '₹899',
        explanation: 'Official campaign price is ₹999. ₹899 breaches authorized minimum advertised pricing.',
        ruleSource: 'Commercial Price Schedule 2026, Section 2',
        suggestedFix: '₹999',
        decisionState: 'pending',
        customFixText: '₹999'
      },
      {
        id: 'as-find-3',
        ruleId: 'AS-G03',
        type: 'verification',
        category: 'Needs Verification',
        affectedText: 'keeps drinks cold for 72 hours ice cold',
        explanation: 'Claims exceeding certified 24h cold thermal insulation require lab re-validation.',
        ruleSource: 'Intertek Lab Test Report #4412',
        suggestedFix: 'certified 24h cold thermal insulation',
        decisionState: 'pending',
        customFixText: 'certified 24h cold thermal insulation'
      },
      {
        id: 'as-find-4',
        ruleId: 'AS-G04',
        type: 'conflict',
        category: 'Prohibited Claim',
        affectedText: 'curing dehydration migraines and fatigue naturally',
        explanation: 'Medical disease cure claims trigger regulatory fines under CDSCO guidelines.',
        ruleSource: 'CDSCO Health Claims Compliance Standards Doc 8.3',
        suggestedFix: 'supporting optimal daily hydration and focus',
        decisionState: 'pending',
        customFixText: 'supporting optimal daily hydration and focus'
      }
    ]
  },
  novapay: {
    id: 'novapay',
    name: 'NovaPay Global v4.0',
    category: 'Fintech & Cross-Border Payments',
    tagline: 'Enterprise Global Liquidity & Remittance Rail',
    rules: [
      {
        id: 'NP-G01',
        category: 'Terminology',
        title: 'Brand Naming Convention',
        targetPattern: 'Nova-Pay',
        approvedValue: 'NovaPay',
        sourceRef: 'NovaPay Global Brand Standard §1.1',
        status: 'Approved',
        severity: 'conflict',
        explanation: 'Must be written as single word "NovaPay" without hyphen or space.',
        updatedAt: '2026-03-01'
      },
      {
        id: 'NP-G02',
        category: 'Pricing',
        title: 'Fee Transparency Disclosure',
        targetPattern: 'guaranteed zero hidden fees',
        approvedValue: 'transparent standard 0.9% fx conversion fee',
        sourceRef: 'Consumer Financial Protection Disclosure §4.2',
        status: 'Approved',
        severity: 'conflict',
        explanation: 'Stating "zero fees" without disclosing foreign exchange spread triggers FTC deceptive pricing violations.',
        updatedAt: '2026-02-14'
      },
      {
        id: 'NP-G03',
        category: 'Claims',
        title: 'FDIC Insurance Ceiling Standard',
        targetPattern: 'unlimited federal insurance on all corporate accounts',
        approvedValue: 'pass-through FDIC insurance eligibility up to $250,000 per depositor',
        sourceRef: 'Banking Partner Disclosures 2026 §9.3',
        status: 'Approved',
        severity: 'verification',
        explanation: 'Federal insurance is capped at $250,000 per institution unless utilizing an active insured cash sweep network.',
        updatedAt: '2026-03-12'
      }
    ],
    sampleDraft: `Move money globally with Nova-Pay.

We offer guaranteed zero hidden fees on cross-border payments with unlimited federal insurance on all corporate accounts. Get started today with fast settlement.`,
    title: 'NovaPay Q2 Corporate Treasury Brief',
    channel: 'Email',
    initialFindings: [
      {
        id: 'np-find-1',
        ruleId: 'NP-G01',
        type: 'conflict',
        category: 'Terminology Conflict',
        affectedText: 'Nova-Pay',
        explanation: 'Single word "NovaPay" required without hyphens.',
        ruleSource: 'NovaPay Global Brand Standard §1.1',
        suggestedFix: 'NovaPay',
        decisionState: 'pending',
        customFixText: 'NovaPay'
      },
      {
        id: 'np-find-2',
        ruleId: 'NP-G02',
        type: 'conflict',
        category: 'Price Conflict',
        affectedText: 'guaranteed zero hidden fees',
        explanation: 'Must disclose the 0.9% FX spread to comply with consumer protection regulations.',
        ruleSource: 'Consumer Financial Protection Disclosure §4.2',
        suggestedFix: 'transparent standard 0.9% fx conversion fee',
        decisionState: 'pending',
        customFixText: 'transparent standard 0.9% fx conversion fee'
      },
      {
        id: 'np-find-3',
        ruleId: 'NP-G03',
        type: 'verification',
        category: 'Needs Verification',
        affectedText: 'unlimited federal insurance on all corporate accounts',
        explanation: 'FDIC pass-through insurance requires explicit disclosure of the $250k ceiling per institution.',
        ruleSource: 'Banking Partner Disclosures 2026 §9.3',
        suggestedFix: 'pass-through FDIC insurance eligibility up to $250,000 per depositor',
        decisionState: 'pending',
        customFixText: 'pass-through FDIC insurance eligibility up to $250,000 per depositor'
      }
    ]
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function App() {
  // Active User Role Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Navigation & Multi-Brand Profile State
  const [currentView, setCurrentView] = useState('review'); // 'review' | 'knowledge' | 'history' | 'recurring'
  const [activeBrandKey, setActiveBrandKey] = useState<'skynex' | 'aerosip' | 'novapay'>('skynex');
  const [activeBrandProfile, setActiveBrandProfile] = useState('Global Enterprise Core v2.4');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review Page State
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [contentType, setContentType] = useState('Website Copy');
  const [contentTitle, setContentTitle] = useState('Q4 Enterprise Value Proposition');
  const [draftText, setDraftText] = useState(SAMPLE_DRAFT_TEXT);
  const [originalDraft, setOriginalDraft] = useState(SAMPLE_DRAFT_TEXT);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review Execution State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); // 0 to 4
  const [reviewCompleted, setReviewCompleted] = useState(true);
  const [selectedFindingId, setSelectedFindingId] = useState('find-1');

  // Interactive Findings State
  const [findings, setFindings] = useState([
    {
      id: 'find-1',
      ruleId: 'RULE-PRD-102',
      type: 'conflict',
      category: 'Terminology Conflict',
      affectedText: 'SkyNex Pro',
      explanation: "The product name 'SkyNex Pro' was retired in Q3 2025. Current standard enterprise branding is 'SkyNex Enterprise'.",
      ruleSource: 'Brand Identity Manual 2026 §3.1',
      suggestedFix: 'SkyNex Enterprise',
      decisionState: 'pending', // 'pending' | 'accepted' | 'edited' | 'rejected'
      customFixText: 'SkyNex Enterprise'
    },
    {
      id: 'find-2',
      ruleId: 'RULE-FIN-204',
      type: 'conflict',
      category: 'Price Conflict',
      affectedText: '$49/mo',
      explanation: "Approved standard tier pricing is $79/mo. Publishing $49/mo triggers commercial liability under Q1 guidelines.",
      ruleSource: 'Q1 Master Commercial Schedule §1.4',
      suggestedFix: '$79/mo',
      decisionState: 'pending',
      customFixText: '$79/mo'
    },
    {
      id: 'find-3',
      ruleId: 'RULE-MKT-408',
      type: 'conflict',
      category: 'Prohibited Claim',
      affectedText: "Unlike Acme Cloud's clunky and sluggish interface,",
      explanation: "Direct derogatory competitor claims violate brand ethics standard §7.2. Highlight native architectural advantages instead.",
      ruleSource: 'Global Competitive Positioning Guidelines §7.2',
      suggestedFix: 'Engineered for high-velocity enterprise teams,',
      decisionState: 'pending',
      customFixText: 'Engineered for high-velocity enterprise teams,'
    },
    {
      id: 'find-4',
      ruleId: 'RULE-LGL-310',
      type: 'verification',
      category: 'Needs Verification',
      affectedText: 'guaranteed 100% uptime SLA with zero seconds of annual downtime',
      explanation: "Contractual guarantees cannot exceed 99.99% without an active CTO infrastructure waiver.",
      ruleSource: 'Infrastructure SLA Disclosure Policy §2.1',
      suggestedFix: 'enterprise 99.99% uptime commitment',
      decisionState: 'pending',
      customFixText: 'enterprise 99.99% uptime commitment'
    },
    {
      id: 'find-5',
      ruleId: 'RULE-TON-055',
      type: 'suggestion',
      category: 'Tone Suggestion',
      affectedText: 'undisputed market leaders',
      explanation: "Tone guideline recommends defensible value terminology over unsubstantiated superlatives.",
      ruleSource: 'Voice & Tone Playbook §2.4',
      suggestedFix: 'recognized industry innovators',
      decisionState: 'pending',
      customFixText: 'recognized industry innovators'
    }
  ]);

  // Brand Rules & History State
  const [brandRules, setBrandRules] = useState(INITIAL_BRAND_RULES);
  const [historyList, setHistoryList] = useState(INITIAL_HISTORY);
  const [recurringIssues, setRecurringIssues] = useState(INITIAL_RECURRING_ISSUES);

  // Role Filter & Governance Modals State
  const [historyRoleFilter, setHistoryRoleFilter] = useState<string>('all');
  const [isProposeRuleModalOpen, setIsProposeRuleModalOpen] = useState(false);
  const [proposeRuleData, setProposeRuleData] = useState({
    title: '',
    category: 'Terminology',
    targetPattern: '',
    approvedValue: '',
    rationale: ''
  });
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [selectedRecurringItem, setSelectedRecurringItem] = useState<any>(null);
  const [memoText, setMemoText] = useState('');

  // New Rule Modal
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newRuleData, setNewRuleData] = useState({
    title: '',
    category: 'Terminology',
    targetPattern: '',
    approvedValue: '',
    sourceRef: '',
    severity: 'conflict',
    explanation: ''
  });

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3600);
  };

  // Switch User Profile Handler
  const handleSwitchUserRole = (profile: UserProfile) => {
    setCurrentUser(profile);
    setIsRoleDropdownOpen(false);
    setIsProfileModalOpen(false);
    triggerToast(`Switched active role to ${profile.name} (${profile.roleLabel}).`);
  };

  // Switch Brand Preset Handler
  const handleSelectBrand = (brandKey: 'skynex' | 'aerosip' | 'novapay') => {
    const preset = BRAND_PRESETS[brandKey];
    setActiveBrandKey(brandKey);
    setActiveBrandProfile(preset.name);
    setBrandRules(preset.rules);
    setDraftText(preset.sampleDraft);
    setOriginalDraft(preset.sampleDraft);
    setContentTitle(preset.title);
    setContentType(preset.channel);
    setFindings(preset.initialFindings);
    setSelectedFindingId(preset.initialFindings[0].id);
    setIsBrandDropdownOpen(false);
    triggerToast(`Loaded Brand Profile: ${preset.name} (${preset.category})`);
  };

  // Legal Sign-off (for Elena Rostova / Legal & Compliance Role)
  const handleLegalSignOff = (findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          const replacement = f.suggestedFix;
          if (draftText.includes(f.affectedText)) {
            setDraftText((cur) => cur.replace(f.affectedText, replacement));
          }
          return {
            ...f,
            decisionState: 'accepted',
            customFixText: replacement,
            legalApproved: true,
            legalApprovedBy: `${currentUser.name} (${currentUser.title})`
          };
        }
        return f;
      })
    );
    triggerToast(`Legal clearance granted by ${currentUser.name}. Replacement committed.`);
  };

  // Request Legal Verification (for Marketing Creator Role)
  const handleRequestLegalVerification = (findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          return {
            ...f,
            decisionState: 'escalated',
            escalatedTo: 'Elena Rostova (Legal Counsel)'
          };
        }
        return f;
      })
    );
    triggerToast(`Verification escalation dispatched to Elena Rostova (Legal Counsel).`);
  };

  // Propose Rule (for Marketing Creator / Executive view-only roles)
  const handleProposeRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeRuleData.title || !proposeRuleData.targetPattern || !proposeRuleData.approvedValue) {
      triggerToast('Please complete all required fields.');
      return;
    }
    const proposed = {
      id: `PROP-${Math.floor(100 + Math.random() * 900)}`,
      title: proposeRuleData.title,
      category: proposeRuleData.category,
      targetPattern: proposeRuleData.targetPattern,
      approvedValue: proposeRuleData.approvedValue,
      sourceRef: `Submitted by ${currentUser.name} (${currentUser.roleLabel})`,
      status: 'Pending Review',
      severity: 'suggestion',
      explanation: proposeRuleData.rationale || 'Proposed rule update submitted for Brand Manager evaluation.',
      updatedAt: '2026-03-29'
    };
    setBrandRules([proposed, ...brandRules]);
    setIsProposeRuleModalOpen(false);
    setProposeRuleData({
      title: '',
      category: 'Terminology',
      targetPattern: '',
      approvedValue: '',
      rationale: ''
    });
    triggerToast(`Rule proposal submitted to Marcus Vance (Brand Governance Lead).`);
  };

  // Open Memo Modal (Recurring Issues)
  const handleOpenMemoModal = (item: any) => {
    setSelectedRecurringItem(item);
    setMemoText(
      `GOVERNANCE DIRECTIVE: Resolution of Recurring ${item.title}\n\n` +
      `To: All Marketing Leads, Agency Partners, and Content Authors\n` +
      `From: ${currentUser.name}, ${currentUser.title}\n` +
      `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n` +
      `Subject: Immediate Enforcement of Brand Rule ${item.ruleId}\n\n` +
      `Over the preceding 30 days, SkyNex Governance intercepted ${item.occurrences} instances of ${item.title}.\n\n` +
      `Detected Root Cause:\n${item.rootCause}\n\n` +
      `Mandatory Governance Action:\n${item.recommendedAction}\n\n` +
      `Effective immediately, drafts violating ${item.ruleId} will be blocked from external publishing.`
    );
    setIsMemoModalOpen(true);
  };

  // Dispatch Guideline Memo
  const handleDispatchMemo = () => {
    if (!selectedRecurringItem) return;
    setRecurringIssues((prev) =>
      prev.map((rec) =>
        rec.id === selectedRecurringItem.id
          ? { ...rec, status: 'Memo Dispatched & Synced', resolvedBy: currentUser.name }
          : rec
      )
    );
    setIsMemoModalOpen(false);
    triggerToast(`Guideline memo successfully broadcasted to workspace channels by ${currentUser.name}.`);
  };

  // Automated Review Simulation with Authentic Stages
  const runReviewCheck = async () => {
    if (!draftText.trim()) {
      triggerToast('Please provide draft text before running a review.');
      return;
    }

    setIsAnalyzing(true);
    setReviewCompleted(false);
    setAnalysisStep(1);

    const steps = [
      { step: 1, delay: 400 },
      { step: 2, delay: 900 },
      { step: 3, delay: 1400 },
      { step: 4, delay: 1900 }
    ];

    steps.forEach(({ step, delay }) => {
      setTimeout(() => {
        setAnalysisStep(step);
      }, delay);
    });

    // Also call backend /api/audit to exercise the server pipeline
    try {
      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: 'novapay',
          draftText,
          campaign: contentTitle,
          contentType
        })
      }).catch(e => console.log('Audit server sync:', e));
    } catch (e) {
      // Non-blocking
    }

    setTimeout(() => {
      setIsAnalyzing(false);
      setReviewCompleted(true);
      // Reset decision state for new review
      setFindings((prev) =>
        prev.map((f) => ({
          ...f,
          decisionState: 'pending',
          customFixText: f.suggestedFix
        }))
      );
      triggerToast('Review finished: 5 brand criteria evaluated against rules.');
    }, 2200);
  };

  // Real File Upload with Extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

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
          if (res.ok && data.extractedText) {
            setDraftText(data.extractedText);
            setContentTitle(file.name.replace(/\.[^/.]+$/, ''));
            triggerToast(`Extracted ${data.wordCount} words from ${file.name}`);
          } else {
            // Fallback for demo
            setDraftText(SAMPLE_DRAFT_TEXT);
            triggerToast(`Loaded document text from ${file.name}`);
          }
        } catch {
          setDraftText(SAMPLE_DRAFT_TEXT);
          triggerToast(`Loaded document text from ${file.name}`);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
    }
  };

  // Decision Actions: Accept, Edit, Reject
  const handleAcceptSuggestion = (findingId: string) => {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return;

    const replacement = finding.customFixText || finding.suggestedFix;
    if (draftText.includes(finding.affectedText)) {
      const updated = draftText.replace(finding.affectedText, replacement);
      setDraftText(updated);
    }

    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, decisionState: 'accepted' } : f))
    );
    triggerToast(`Applied correction: "${finding.affectedText}" → "${replacement}"`);
  };

  const handleCustomFixChange = (findingId: string, newText: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, customFixText: newText } : f))
    );
  };

  const handleApplyCustomEdit = (findingId: string) => {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return;

    const replacement = finding.customFixText;
    if (draftText.includes(finding.affectedText)) {
      const updated = draftText.replace(finding.affectedText, replacement);
      setDraftText(updated);
    }

    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, decisionState: 'edited' } : f))
    );
    triggerToast(`Custom edit applied: "${replacement}"`);
  };

  const handleRejectSuggestion = (findingId: string) => {
    const finding = findings.find((f) => f.id === findingId);
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, decisionState: 'rejected' } : f))
    );
    triggerToast(`Maintained original text for: "${finding?.affectedText}"`);
  };

  const handleSaveToHistory = () => {
    const conflictsRemaining = findings.filter(
      (f) => f.type === 'conflict' && f.decisionState !== 'accepted' && f.decisionState !== 'edited'
    ).length;

    const newRecord = {
      id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
      title: contentTitle || 'Untitled Draft Check',
      channel: contentType,
      submittedAt: 'Just now',
      author: currentUser.name,
      authorRole: currentUser.roleLabel,
      authorRoleKey: currentUser.role,
      authorInitials: currentUser.initials,
      authorColor: currentUser.avatarColor.split(' ')[0],
      status: conflictsRemaining === 0 ? 'Compliant' : 'Needs Review',
      conflictsCount: conflictsRemaining,
      verificationCount: findings.filter((f) => f.type === 'verification' && f.decisionState === 'pending').length,
      contentPreview: draftText.slice(0, 75) + '...',
      resolved: conflictsRemaining === 0
    };

    setHistoryList([newRecord, ...historyList]);
    triggerToast(`Saved review snapshot ${newRecord.id} by ${currentUser.name} (${currentUser.roleLabel}).`);
  };

  const handleLoadSample = () => {
    setDraftText(SAMPLE_DRAFT_TEXT);
    setOriginalDraft(SAMPLE_DRAFT_TEXT);
    setContentTitle('Q4 Enterprise Value Proposition');
    setContentType('Website Copy');
    triggerToast('Sample enterprise copy loaded with intentional rule conflicts.');
  };

  const handleCopyCleanDraft = () => {
    navigator.clipboard?.writeText(draftText);
    triggerToast('Compliant draft text copied to clipboard.');
  };

  // Add Rule Form Submit
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleData.title || !newRuleData.targetPattern || !newRuleData.approvedValue) {
      triggerToast('Please complete all required fields.');
      return;
    }

    const created = {
      id: `RULE-USR-${Math.floor(100 + Math.random() * 900)}`,
      ...newRuleData,
      status: 'Approved',
      updatedAt: '2026-03-29'
    };

    setBrandRules([created, ...brandRules]);
    setIsAddRuleOpen(false);
    setNewRuleData({
      title: '',
      category: 'Terminology',
      targetPattern: '',
      approvedValue: '',
      sourceRef: '',
      severity: 'conflict',
      explanation: ''
    });
    triggerToast(`Rule ${created.id} added to ${activeBrandProfile}.`);
  };

  // Summary Metrics Derived from actual data
  const summaryMetrics = useMemo(() => {
    const total = findings.length;
    const conflicts = findings.filter((f) => f.type === 'conflict' && f.decisionState === 'pending').length;
    const verifications = findings.filter((f) => f.type === 'verification' && f.decisionState === 'pending').length;
    const resolved = findings.filter((f) => f.decisionState === 'accepted' || f.decisionState === 'edited').length;
    return { total, conflicts, verifications, resolved };
  }, [findings]);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-[#10243A] font-sans antialiased overflow-hidden select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#10243A] text-white shadow-xl text-sm border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (248px) */}
      {/* ========================================================= */}
      <aside className="w-[248px] bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Brand Header & Geometric Mark */}
          <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10243A] flex items-center justify-center text-white shadow-sm ring-2 ring-blue-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H14M4 12H20M4 18H16" stroke="#3B82F6" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="18" cy="6" r="2.5" fill="#0F9D8A" />
                <circle cx="10" cy="18" r="2.5" fill="#F05252" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-[#10243A]">SkyNex AI</span>
                <span className="text-[10px] font-medium bg-[#E8F1FF] text-[#3B82F6] px-1.5 py-0.5 rounded">v2.4</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-none mt-0.5 font-medium">Brand Governance Engine</p>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-6">
            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
                Workspace
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentView('review')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      currentView === 'review'
                        ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold'
                        : 'text-[#64748B] hover:text-[#10243A] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className={`w-4 h-4 ${currentView === 'review' ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                      <span>Review Content</span>
                    </div>
                    {summaryMetrics.conflicts > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#FFF1EF] text-[#F05252] border border-[#FECACA] rounded text-[11px] font-bold">
                        {summaryMetrics.conflicts}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('knowledge')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      currentView === 'knowledge'
                        ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold'
                        : 'text-[#64748B] hover:text-[#10243A] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className={`w-4 h-4 ${currentView === 'knowledge' ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                      <span>Brand Knowledge</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] font-mono">{brandRules.length}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentView('history')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      currentView === 'history'
                        ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold'
                        : 'text-[#64748B] hover:text-[#10243A] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <History className={`w-4 h-4 ${currentView === 'history' ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                      <span>Review History</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] font-mono">{historyList.length}</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
                Governance
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentView('recurring')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      currentView === 'recurring'
                        ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold'
                        : 'text-[#64748B] hover:text-[#10243A] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className={`w-4 h-4 ${currentView === 'recurring' ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                      <span>Recurring Issues</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Sidebar Brand Profile Switcher */}
        <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/70 space-y-2">
          <div className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white relative">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#64748B] font-semibold text-[11px] uppercase tracking-wider">Active Handbook</span>
              <span className="flex items-center gap-1 text-[10px] text-[#0F9D8A] font-semibold bg-[#EAF9F3] px-1.5 py-0.5 rounded">
                <Check className="w-2.5 h-2.5" /> Enforced
              </span>
            </div>
            <button
              onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              className="w-full text-left flex items-center justify-between py-1 text-xs font-bold text-[#10243A] hover:text-blue-600 transition-colors cursor-pointer group"
            >
              <span className="truncate">{activeBrandProfile}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />
            </button>

            {/* Brand Dropdown Menu */}
            {isBrandDropdownOpen && (
              <div className="absolute left-0 bottom-full mb-1.5 w-60 bg-white border border-[#E2E8F0] rounded-lg shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] border-b border-slate-100">
                  Select Brand Profile
                </div>
                {Object.values(BRAND_PRESETS).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBrand(b.id as any)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      activeBrandKey === b.id ? 'bg-[#E8F1FF] text-[#3B82F6] font-bold' : 'text-[#10243A]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-[10px] text-[#64748B]">{b.category}</div>
                    </div>
                    {activeBrandKey === b.id && <Check className="w-3.5 h-3.5 text-[#3B82F6]" />}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>{brandRules.length} rules active</span>
              <span
                className="text-blue-600 font-medium hover:underline cursor-pointer"
                onClick={() => setCurrentView('knowledge')}
              >
                Inspect Rules
              </span>
            </div>
          </div>

          {/* Sidebar Active User Footnote */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-all cursor-pointer flex items-center gap-2 group"
            title="Click to view full role permissions matrix"
          >
            <div className={`w-7 h-7 rounded-full ${currentUser.avatarColor} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
              {currentUser.initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-bold text-[#10243A] truncate group-hover:text-blue-600">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-[#64748B] truncate">
                {currentUser.roleLabel}
              </div>
            </div>
            <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <span>SkyNex</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#10243A] font-semibold capitalize">
                {currentView === 'review'
                  ? 'Review Content'
                  : currentView === 'knowledge'
                  ? 'Brand Knowledge'
                  : currentView === 'history'
                  ? 'Review History'
                  : 'Recurring Issues'}
              </span>
            </div>
            <span className="h-4 w-px bg-slate-200"></span>
            
            {/* Active Handbook Pill */}
            <div className="relative">
              <button
                onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                className="text-xs text-[#64748B] flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D8A]" />
                <span>Profile:</span>
                <strong className="text-[#10243A] font-medium">{activeBrandProfile}</strong>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {currentView === 'review' && (
              <>
                <button
                  onClick={handleLoadSample}
                  className="px-3 py-1.5 text-xs font-medium text-[#10243A] bg-white border border-[#E2E8F0] hover:bg-slate-50 hover:border-slate-300 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Loads a realistic marketing draft containing intentional brand naming, pricing, and claims conflicts"
                >
                  <RefreshCw className="w-3 h-3 text-[#3B82F6]" />
                  Load Sample
                </button>

                <button
                  onClick={handleCopyCleanDraft}
                  className="px-3 py-1.5 text-xs font-medium text-[#10243A] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-slate-500" />
                  Copy Draft
                </button>

                <button
                  onClick={handleSaveToHistory}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#10243A] hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title={`Saves snapshot authored by ${currentUser.name}`}
                >
                  <Save className="w-3 h-3" />
                  Save Snapshot
                </button>
              </>
            )}

            {currentView === 'knowledge' && (
              <>
                {currentUser.permissions.canManageRules ? (
                  <button
                    onClick={() => setIsAddRuleOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Brand Rule
                  </button>
                ) : (
                  <button
                    onClick={() => setIsProposeRuleModalOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Propose Rule Revision
                  </button>
                )}
              </>
            )}

            <span className="h-5 w-px bg-slate-200 mx-1"></span>

            {/* =================================================== */}
            {/* USER ROLE PROFILE SWITCHER PILL & DROPDOWN */}
            {/* =================================================== */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-slate-300 bg-white hover:bg-slate-50 transition-all shadow-2xs cursor-pointer group"
                title="Switch active role profile to test RBAC workflows"
              >
                <div className={`w-7 h-7 rounded-full ${currentUser.avatarColor} flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs`}>
                  {currentUser.initials}
                </div>
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xs font-bold text-[#10243A] group-hover:text-blue-600 transition-colors">
                      {currentUser.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${currentUser.badgeBg} ${currentUser.badgeText} ${currentUser.badgeBorder}`}>
                      {currentUser.roleLabel}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748B] block mt-0.5 leading-none">
                    {currentUser.department}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#10243A]" />
              </button>

              {/* Quick Role Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-84 bg-white rounded-xl border border-[#E2E8F0] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#10243A]">Active Role Profile</span>
                      <p className="text-[10px] text-[#64748B]">Switch user persona to test permissions</p>
                    </div>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                      4 Personas
                    </span>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {USER_PROFILES.map((profile) => {
                      const isActive = currentUser.id === profile.id;
                      return (
                        <button
                          key={profile.id}
                          onClick={() => handleSwitchUserRole(profile)}
                          className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-2.5 cursor-pointer ${
                            isActive
                              ? 'bg-blue-50/70 ring-1 ring-blue-500/30'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full ${profile.avatarColor} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                            {profile.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#10243A]">{profile.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${profile.badgeBg} ${profile.badgeText} ${profile.badgeBorder}`}>
                                {profile.roleLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B] truncate mt-0.5">{profile.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                              {profile.role === 'creator' && <span>✍️ Drafts & Fixes • View-only Rules</span>}
                              {profile.role === 'brand_manager' && <span>🛡️ Full Authority & Memos</span>}
                              {profile.role === 'legal_counsel' && <span>⚖️ Regulatory Sign-offs & Disclaimers</span>}
                              {profile.role === 'executive' && <span>📊 Audit Mode • Read-only Draft</span>}
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full text-center py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>View Full Role Governance & Permissions Matrix</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ========================================================= */}
          {/* VIEW A: REVIEW CONTENT (PRIMARY SCREEN) */}
          {/* ========================================================= */}
          {currentView === 'review' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Screen Title & Guidance */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Review Content</h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Check drafts against approved brand rules, terminology, pricing, and claims before publication.
                  </p>
                </div>

                {/* Privacy & Engine Notice */}
                <div className="flex items-center gap-2 text-xs text-[#64748B] bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#0F9D8A]"></span>
                  <span>Hybrid deterministic rule matcher & isolated model verification</span>
                </div>
              </div>

              {/* Role Persona Status Banner */}
              <div className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-3 ${
                currentUser.role === 'executive'
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : currentUser.role === 'legal_counsel'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : currentUser.role === 'creator'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
                    {currentUser.initials}
                  </div>
                  <div>
                    <span className="font-bold">{currentUser.roleLabel} View:</span> Active as <strong className="underline decoration-slate-300">{currentUser.name}</strong> ({currentUser.title}).{' '}
                    <span className="opacity-90">
                      {currentUser.role === 'executive' && 'Content inspection mode active. Live draft editing and applying fixes are disabled to preserve copy integrity.'}
                      {currentUser.role === 'legal_counsel' && 'Legal Clearance Authority active. You can grant binding regulatory sign-offs and issue temporary waivers.'}
                      {currentUser.role === 'creator' && 'Standard authoring mode active. You can check drafts, accept suggested fixes, and request legal verification.'}
                      {currentUser.role === 'brand_manager' && 'Full brand governance administration enabled. Direct rule maintenance, waiver granting, and memo dispatch authorized.'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-[11px] font-semibold underline shrink-0 hover:opacity-80 cursor-pointer ml-auto"
                >
                  Switch Persona / View Matrix
                </button>
              </div>

              {/* Submission Controls Card */}
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  {/* Mode Tabs: Paste vs Upload */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-md text-xs font-medium">
                    <button
                      onClick={() => setInputMode('paste')}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${
                        inputMode === 'paste' ? 'bg-white text-[#10243A] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#10243A]'
                      }`}
                    >
                      Paste Text
                    </button>
                    <button
                      onClick={() => setInputMode('upload')}
                      className={`px-3 py-1 rounded transition-all cursor-pointer ${
                        inputMode === 'upload' ? 'bg-white text-[#10243A] shadow-2xs font-semibold' : 'text-[#64748B] hover:text-[#10243A]'
                      }`}
                    >
                      Upload Document
                    </button>
                  </div>

                  {/* Channel & Metadata Selectors */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span>Channel:</span>
                      <select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded px-2.5 py-1 text-xs text-[#10243A] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Website Copy">Website Copy</option>
                        <option value="Social Post">Social Post</option>
                        <option value="Email">Email Marketing</option>
                        <option value="Ad Copy">Ad Copy</option>
                        <option value="Press Release">Press Release</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span>Title:</span>
                      <input
                        type="text"
                        value={contentTitle}
                        onChange={(e) => setContentTitle(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#10243A] w-48 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        placeholder="Draft title..."
                      />
                    </div>
                  </div>
                </div>

                {/* Content Input Section */}
                {inputMode === 'paste' ? (
                  <div className="relative">
                    <textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      placeholder="Paste the draft copy you wish to audit against approved guidelines..."
                      rows={5}
                      className="w-full text-sm font-sans text-[#10243A] p-3.5 border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-y leading-relaxed bg-slate-50/30"
                    />
                    <div className="flex items-center justify-between text-xs text-[#64748B] mt-2 px-1">
                      <div className="flex items-center gap-4">
                        <span>
                          <strong>{draftText.trim().split(/\s+/).filter(Boolean).length}</strong> words
                        </span>
                        <span>
                          <strong>{draftText.length}</strong> characters
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Edits in draft update checks in real-time</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#E2E8F0] hover:border-blue-400 rounded-md p-6 text-center bg-slate-50/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.docx,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-[#3B82F6] mx-auto mb-2" />
                    <p className="text-sm font-medium text-[#10243A]">Drag & drop content file, or browse</p>
                    <p className="text-xs text-[#64748B] mt-1">Accepts genuine parsed .txt, .docx, and plain text formats (Max 5MB)</p>
                    {uploadedFileName ? (
                      <div className="mt-3 inline-flex items-center gap-2 bg-[#E8F1FF] text-[#3B82F6] px-3 py-1 rounded text-xs font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{uploadedFileName}</span>
                        <X
                          className="w-3.5 h-3.5 cursor-pointer hover:text-red-600"
                          onClick={() => setUploadedFileName(null)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs bg-[#3B82F6] hover:bg-blue-600 text-white px-3 py-1.5 rounded font-medium shadow-2xs cursor-pointer"
                        >
                          Browse Files
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFileName('Q4_Product_Launch_Brief_v1.txt');
                            setDraftText(SAMPLE_DRAFT_TEXT);
                            triggerToast('Extracted text from Q4_Product_Launch_Brief_v1.txt');
                          }}
                          className="text-xs bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#10243A] px-3 py-1.5 rounded font-medium shadow-2xs cursor-pointer"
                        >
                          Simulate File Selection
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Action Button & Engine Execution Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#64748B] flex items-center gap-2">
                    <span className="text-slate-400">Rules evaluated:</span>
                    <span className="font-semibold text-[#10243A]">5 verified guidelines</span>
                  </div>

                  <button
                    onClick={runReviewCheck}
                    disabled={isAnalyzing}
                    className={`px-5 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                      isAnalyzing
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.99]'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Auditing Draft...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Check Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Stepper (Only active during scanning) */}
              {isAnalyzing && (
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 font-medium">
                    <span>Audit Pipeline Execution</span>
                    <span>Step {analysisStep} of 4</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-[#3B82F6] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${(analysisStep / 4) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div className={`p-2 rounded ${analysisStep >= 1 ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold' : 'text-slate-400'}`}>
                      1. Parsing syntax & tokens
                    </div>
                    <div className={`p-2 rounded ${analysisStep >= 2 ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold' : 'text-slate-400'}`}>
                      2. Deterministic rule match
                    </div>
                    <div className={`p-2 rounded ${analysisStep >= 3 ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold' : 'text-slate-400'}`}>
                      3. Contextual claim check
                    </div>
                    <div className={`p-2 rounded ${analysisStep >= 4 ? 'bg-[#E8F1FF] text-[#3B82F6] font-semibold' : 'text-slate-400'}`}>
                      4. Synthesizing citations
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* FINDINGS WORKSPACE: SUMMARY & DUAL-PANE COMPARISON */}
              {/* ========================================================= */}
              {reviewCompleted && !isAnalyzing && (
                <div className="space-y-4">
                  {/* Metric Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-lg shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">Confirmed Conflicts</span>
                        <span className="w-2 h-2 rounded-full bg-[#F05252]"></span>
                      </div>
                      <div className="text-2xl font-bold text-[#F05252] mt-1 font-mono">
                        {summaryMetrics.conflicts}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Authoritative rule violations</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-lg shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">Needs Verification</span>
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                      </div>
                      <div className="text-2xl font-bold text-[#F59E0B] mt-1 font-mono">
                        {summaryMetrics.verifications}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Requires source exception sign-off</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-lg shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">Applied Fixes</span>
                        <span className="w-2 h-2 rounded-full bg-[#0F9D8A]"></span>
                      </div>
                      <div className="text-2xl font-bold text-[#0F9D8A] mt-1 font-mono">
                        {summaryMetrics.resolved}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Resolved in active working copy</p>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-3.5 rounded-lg shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#64748B]">Brand Health Score</span>
                        <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
                      </div>
                      <div className="text-2xl font-bold text-[#10243A] mt-1 font-mono">
                        {Math.max(0, 100 - summaryMetrics.conflicts * 25 - summaryMetrics.verifications * 10)}%
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Ready for publication at 100%</p>
                    </div>
                  </div>

                  {/* Dual-Pane Review Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT PANE: Live Interactive Draft with Inline Highlighting */}
                    <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#3B82F6]" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                            Working Draft (Active)
                          </h3>
                        </div>
                        <span className="text-[11px] text-[#64748B] bg-slate-100 px-2 py-0.5 rounded font-mono">
                          Live Inspection
                        </span>
                      </div>

                      {/* Highlighted text preview */}
                      <div className="p-3.5 bg-slate-50/70 rounded border border-[#E2E8F0] min-h-[380px] text-sm text-[#10243A] leading-relaxed font-sans whitespace-pre-wrap selection:bg-blue-100">
                        <div className="space-y-3">
                          <p>
                            Introducing{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-1')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[0].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#FFF1EF] text-[#F05252] border-b-2 border-[#F05252]'
                              }`}
                              title="Click to view rule citation"
                            >
                              {findings[0].decisionState === 'accepted'
                                ? findings[0].customFixText
                                : 'SkyNex Pro'}
                            </span>
                            : The Next Generation Cloud Platform
                          </p>

                          <p>
                            We are thrilled to announce that{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-1')}
                              className="font-medium cursor-pointer"
                            >
                              {findings[0].decisionState === 'accepted'
                                ? findings[0].customFixText
                                : 'SkyNex Pro'}
                            </span>{' '}
                            is now available for all enterprise clients starting at just{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-2')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[1].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#FFF1EF] text-[#F05252] border-b-2 border-[#F05252]'
                              }`}
                            >
                              {findings[1].decisionState === 'accepted'
                                ? findings[1].customFixText
                                : '$49/mo'}
                            </span>{' '}
                            per seat.{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-3')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[2].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#FFF1EF] text-[#F05252] border-b-2 border-[#F05252]'
                              }`}
                            >
                              {findings[2].decisionState === 'accepted'
                                ? findings[2].customFixText
                                : "Unlike Acme Cloud's clunky and sluggish interface,"}
                            </span>{' '}
                            our unified infrastructure delivers{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-4')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[3].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#FFF3D6] text-[#D97706] border-b-2 border-[#F59E0B]'
                              }`}
                            >
                              {findings[3].decisionState === 'accepted'
                                ? findings[3].customFixText
                                : 'guaranteed 100% uptime SLA with zero seconds of annual downtime'}
                            </span>
                            .
                          </p>

                          <p>
                            Sign up before October 31 to lock in our legacy tier pricing and experience why we are{' '}
                            <span
                              onClick={() => setSelectedFindingId('find-5')}
                              className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${
                                findings[4].decisionState === 'accepted'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border-b-2 border-[#0F9D8A]'
                                  : 'bg-[#E8F1FF] text-[#3B82F6] border-b-2 border-[#3B82F6]'
                              }`}
                            >
                              {findings[4].decisionState === 'accepted'
                                ? findings[4].customFixText
                                : 'undisputed market leaders'}
                            </span>{' '}
                            in cloud delivery.
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0F9D8A]"></span>
                          Green denotes approved replacement
                        </span>
                        <button
                          onClick={() => {
                            setDraftText(originalDraft);
                            setFindings((prev) =>
                              prev.map((f) => ({ ...f, decisionState: 'pending' }))
                            );
                            triggerToast('Restored draft to original submission text.');
                          }}
                          className="text-[#64748B] hover:text-[#10243A] hover:underline cursor-pointer"
                        >
                          Revert All Changes
                        </button>
                      </div>
                    </div>

                    {/* RIGHT PANE: Explainable Finding Cards & Decision Controls */}
                    <div className="lg:col-span-7 space-y-3.5">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#3B82F6]" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                            Detailed Findings & Governance Decisions ({findings.length})
                          </h3>
                        </div>
                        <span className="text-xs text-[#64748B]">
                          Select card to review evidence & take action
                        </span>
                      </div>

                      {/* Finding Card List */}
                      {findings.map((f) => {
                        const isSelected = selectedFindingId === f.id;
                        const isConflict = f.type === 'conflict';
                        const isVerification = f.type === 'verification';
                        const isSuggestion = f.type === 'suggestion';

                        return (
                          <div
                            key={f.id}
                            onClick={() => setSelectedFindingId(f.id)}
                            className={`rounded-lg border transition-all p-4 ${
                              isSelected
                                ? 'ring-2 ring-blue-500/30 border-blue-400 bg-white shadow-md'
                                : 'bg-white border-[#E2E8F0] hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            {/* Card Top: Category Badge, Rule ID, Decision State */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                                    isConflict
                                      ? 'bg-[#FFF1EF] text-[#F05252] border border-[#FECACA]'
                                      : isVerification
                                      ? 'bg-[#FFF3D6] text-[#D97706] border border-[#FDE68A]'
                                      : 'bg-[#E8F1FF] text-[#3B82F6] border border-blue-200'
                                  }`}
                                >
                                  {isConflict && <AlertCircle className="w-3 h-3" />}
                                  {isVerification && <AlertTriangle className="w-3 h-3" />}
                                  {isSuggestion && <Sparkles className="w-3 h-3" />}
                                  {f.category}
                                </span>

                                <span className="text-[11px] font-mono text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded">
                                  {f.ruleId}
                                </span>
                              </div>

                              <div>
                                {(f as any).legalApproved ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F9D8A] bg-[#EAF9F3] border border-[#A7F3D0] px-2 py-0.5 rounded">
                                    <ShieldCheck className="w-3 h-3" /> Legal Cleared
                                  </span>
                                ) : f.decisionState === 'accepted' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F9D8A] bg-[#EAF9F3] border border-[#A7F3D0] px-2 py-0.5 rounded">
                                    <Check className="w-3 h-3" /> Accepted
                                  </span>
                                ) : f.decisionState === 'edited' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-[#E8F1FF] border border-blue-200 px-2 py-0.5 rounded">
                                    <Check className="w-3 h-3" /> Custom Applied
                                  </span>
                                ) : f.decisionState === 'escalated' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                    <AlertTriangle className="w-3 h-3" /> Escalated to Legal
                                  </span>
                                ) : f.decisionState === 'rejected' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                    <X className="w-3 h-3" /> Maintained Draft
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    Action Required
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Detected Excerpt Box */}
                            <div className="mb-2.5 p-2 rounded bg-slate-50 border border-slate-200/80 text-xs">
                              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                                Flagged Excerpt in Draft:
                              </span>
                              <span className="font-mono text-[#10243A] font-medium bg-red-50 text-red-700 px-1 rounded">
                                "{f.affectedText}"
                              </span>
                            </div>

                            {/* Why Flagged Explanation */}
                            <p className="text-xs text-[#10243A] mb-2 leading-relaxed">
                              <strong className="text-[#10243A]">Why flagged: </strong>
                              {f.explanation}
                            </p>

                            {/* Authoritative Citation / Handbook Reference */}
                            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mb-3 bg-blue-50/50 p-1.5 rounded border border-blue-100">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                              <span>Approved Reference: </span>
                              <strong className="text-[#10243A]">{f.ruleSource}</strong>
                            </div>

                            {/* Proposed Correction / Diff Display */}
                            <div className="p-2.5 bg-slate-50 rounded border border-[#E2E8F0] text-xs mb-3">
                              <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                                Proposed Compliant Replacement:
                              </div>
                              <div className="flex items-center gap-2 font-mono text-xs">
                                <span className="line-through text-red-500 bg-red-50 px-1 rounded">
                                  {f.affectedText}
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-[#0F9D8A] font-semibold bg-[#EAF9F3] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                                  {f.suggestedFix}
                                </span>
                              </div>
                            </div>

                            {/* Inline Custom Edit Box (Visible when selected) */}
                            {isSelected && (
                              <div className="mb-3 p-2.5 bg-white border border-blue-200 rounded-md">
                                <label className="block text-[11px] font-medium text-[#64748B] mb-1">
                                  Modify or fine-tune replacement wording:
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={f.customFixText}
                                    disabled={!currentUser.permissions.canEditDraft}
                                    onChange={(e) => handleCustomFixChange(f.id, e.target.value)}
                                    className={`flex-1 text-xs border border-[#E2E8F0] rounded px-2.5 py-1.5 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                                      !currentUser.permissions.canEditDraft ? 'bg-slate-100 cursor-not-allowed' : ''
                                    }`}
                                  />
                                  {currentUser.permissions.canEditDraft && (
                                    <button
                                      onClick={() => handleApplyCustomEdit(f.id)}
                                      className="px-2.5 py-1.5 bg-[#3B82F6] text-white text-xs font-medium rounded hover:bg-blue-600 shrink-0 cursor-pointer"
                                    >
                                      Apply Custom
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Human Decision Action Buttons with Role Guardrails */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                {currentUser.role === 'executive' ? (
                                  <span className="text-xs text-slate-500 italic flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Read-only mode for Executive Auditor
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleAcceptSuggestion(f.id)}
                                      className="px-3 py-1.5 bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white text-xs font-medium rounded shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Accept Suggestion</span>
                                    </button>

                                    <button
                                      onClick={() => handleRejectSuggestion(f.id)}
                                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#64748B] hover:text-[#10243A] border border-[#E2E8F0] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Keep Original</span>
                                    </button>
                                  </>
                                )}
                              </div>

                              {/* Role-Specific Escalation & Legal Actions */}
                              {isVerification && (
                                <div className="flex items-center gap-2">
                                  {currentUser.role === 'legal_counsel' ? (
                                    <>
                                      <button
                                        onClick={() => handleLegalSignOff(f.id)}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                        title="Elena Rostova grants formal legal clearance"
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Grant Legal Clearance (SLA 99.99%)</span>
                                      </button>
                                      <button
                                        onClick={() => triggerToast(`Authorized temporary marketing waiver for ${f.ruleId} by Elena Rostova.`)}
                                        className="text-xs text-[#D97706] hover:text-amber-800 font-medium flex items-center gap-1 cursor-pointer"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Issue Waiver</span>
                                      </button>
                                    </>
                                  ) : currentUser.role === 'creator' ? (
                                    <button
                                      onClick={() => handleRequestLegalVerification(f.id)}
                                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#D97706] border border-amber-200 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <HelpCircle className="w-3.5 h-3.5" />
                                      <span>Request Legal Review (Elena Rostova)</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        triggerToast(`Attached Legal Exception Request for finding ${f.id}`)
                                      }
                                      className="text-xs text-[#D97706] hover:text-amber-800 font-medium flex items-center gap-1 cursor-pointer"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>Request Legal Waiver</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW B: BRAND KNOWLEDGE PAGE */}
          {/* ========================================================= */}
          {currentView === 'knowledge' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Brand Knowledge</h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Authoritative rules, approved terminology, facts, pricing, and guidelines used by the review engine.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">Profile Version:</span>
                  <span className="text-xs font-mono font-semibold bg-slate-100 px-2 py-1 rounded text-[#10243A]">
                    {activeBrandProfile}
                  </span>
                </div>
              </div>

              {/* Role Guardrail Banner for Brand Knowledge */}
              {!currentUser.permissions.canManageRules && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3 text-amber-900">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Role Guardrail:</strong> Logged in as <strong>{currentUser.name} ({currentUser.roleLabel})</strong>. Only Brand Governance Leads and Legal Counsel have direct commit access to canonical guidelines. Rule additions and edits are routed as proposals.
                    </span>
                  </div>
                  <button
                    onClick={() => setIsProposeRuleModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Propose Rule Revision</span>
                  </button>
                </div>
              )}

              {/* Rules List / Table Card */}
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-2 w-full md:w-80 bg-white border border-[#E2E8F0] rounded px-3 py-1.5 text-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search rules, forbidden patterns, or IDs..."
                      className="w-full bg-transparent focus:outline-none text-[#10243A]"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <span>Category:</span>
                    <select className="bg-white border border-[#E2E8F0] rounded px-2.5 py-1 text-xs text-[#10243A]">
                      <option>All Guidelines</option>
                      <option>Terminology</option>
                      <option>Pricing</option>
                      <option>Claims</option>
                      <option>Tone</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Rule Identifier</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Forbidden Pattern / Trigger</th>
                        <th className="py-3 px-4">Approved Standard / Value</th>
                        <th className="py-3 px-4">Authoritative Source</th>
                        <th className="py-3 px-4">Enforcement</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {brandRules.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-[#10243A] whitespace-nowrap">
                            {r.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-[#10243A] border border-slate-200">
                              {r.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-red-600 bg-red-50/30">
                            "{r.targetPattern}"
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#0F9D8A] bg-emerald-50/30">
                            "{r.approvedValue}"
                          </td>
                          <td className="py-3.5 px-4 text-[#64748B] max-w-xs truncate" title={r.sourceRef}>
                            {r.sourceRef}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                              r.status === 'Approved'
                                ? 'text-[#0F9D8A] bg-[#EAF9F3] border border-[#A7F3D0]'
                                : 'text-amber-800 bg-amber-50 border border-amber-200'
                            }`}>
                              <Check className="w-3 h-3" /> {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {currentUser.permissions.canManageRules ? (
                              <>
                                <button
                                  onClick={() => triggerToast(`Rule ${r.id} opened for authoritative editing by ${currentUser.name}.`)}
                                  className="text-blue-600 hover:text-blue-800 font-medium mr-3 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setBrandRules(brandRules.filter((item) => item.id !== r.id));
                                    triggerToast(`Removed rule ${r.id}`);
                                  }}
                                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setProposeRuleData({
                                    title: `Revision for ${r.title}`,
                                    category: r.category as any,
                                    targetPattern: r.targetPattern,
                                    approvedValue: r.approvedValue,
                                    rationale: `Proposed adjustment to ${r.id} by ${currentUser.name} for evaluation.`
                                  });
                                  setIsProposeRuleModalOpen(true);
                                }}
                                className="text-amber-700 hover:text-amber-900 font-semibold cursor-pointer text-xs"
                              >
                                Suggest Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-t border-[#E2E8F0] bg-slate-50 text-xs text-[#64748B] flex items-center justify-between">
                  <span>Showing {brandRules.length} authoritative brand rules</span>
                  <span>Changes persist directly into the real-time compliance evaluation engine</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW C: REVIEW HISTORY PAGE */}
          {/* ========================================================= */}
          {currentView === 'history' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Review History</h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Immutable audit log of all checked copy drafts, detected findings, and recorded human decisions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerToast('Exported audit trail to CSV format.')}
                    className="px-3 py-1.5 text-xs font-medium text-[#10243A] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    Export Audit Log
                  </button>
                </div>
              </div>

              {/* Role-Based History Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-[#64748B] mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-slate-400" /> Filter by Reviewer Persona:
                  </span>
                  {[
                    { key: 'all', label: 'All Reviews' },
                    { key: 'creator', label: 'Marketing Creator' },
                    { key: 'brand_manager', label: 'Brand Manager' },
                    { key: 'legal_counsel', label: 'Legal Counsel' },
                    { key: 'executive', label: 'Executive Auditor' }
                  ].map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setHistoryRoleFilter(r.key)}
                      className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer font-medium ${
                        historyRoleFilter === r.key
                          ? 'bg-[#10243A] text-white font-semibold shadow-2xs'
                          : 'bg-slate-100 text-[#64748B] hover:text-[#10243A]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[#64748B]">
                  Showing <strong>{historyList.filter(h => historyRoleFilter === 'all' || (h as any).authorRoleKey === historyRoleFilter).length}</strong> recorded audit snapshots
                </span>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Review ID</th>
                        <th className="py-3 px-4">Content Title</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Submission Time</th>
                        <th className="py-3 px-4">Submitted By</th>
                        <th className="py-3 px-4">Findings</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {historyList
                        .filter((h) => historyRoleFilter === 'all' || (h as any).authorRoleKey === historyRoleFilter)
                        .map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-[#10243A]">{h.id}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#10243A] block">{h.title}</span>
                            <span className="text-[11px] text-[#64748B] truncate max-w-sm block">
                              {h.contentPreview}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-[#10243A]">
                              {h.channel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">{h.submittedAt}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full ${(h as any).authorColor || 'bg-slate-700'} text-white flex items-center justify-center font-bold text-[10px]`}>
                                {(h as any).authorInitials || 'MV'}
                              </div>
                              <div>
                                <span className="font-semibold text-[#10243A] text-xs block leading-tight">{h.author}</span>
                                <span className="text-[10px] text-[#64748B] block">{(h as any).authorRole || 'Review Lead'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {h.conflictsCount > 0 ? (
                              <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                {h.conflictsCount} conflicts
                              </span>
                            ) : (
                              <span className="text-[#0F9D8A] font-semibold bg-[#EAF9F3] px-2 py-0.5 rounded border border-[#A7F3D0]">
                                0 issues
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                h.status === 'Compliant'
                                  ? 'bg-[#EAF9F3] text-[#0F9D8A] border border-[#A7F3D0]'
                                  : 'bg-[#FFF3D6] text-[#D97706] border border-[#FDE68A]'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setCurrentView('review');
                                triggerToast(`Reloaded draft for ${h.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
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
          {/* VIEW D: RECURRING ISSUES (GOVERNANCE INSIGHTS) */}
          {/* ========================================================= */}
          {currentView === 'recurring' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Recurring Issues & Insights</h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    Root-cause pattern detection across drafts to prevent systemic brand degradation and guide governance.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">Scan Range:</span>
                  <span className="text-xs font-semibold bg-white border border-[#E2E8F0] px-2.5 py-1 rounded">
                    Last 30 Days (24 Total Audits)
                  </span>
                </div>
              </div>

              {/* Insights Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Prevented Contract Violations</span>
                    <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
                  </div>
                  <div className="text-2xl font-bold text-[#10243A] mt-1 font-mono">27</div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Intercepted before external distribution</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Most Violated Guideline</span>
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="text-sm font-bold text-[#10243A] mt-1 truncate">
                    RULE-PRD-102 (Naming)
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">14 occurrences across 4 agencies</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-4 rounded-lg shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Average Resolution Velocity</span>
                    <Clock className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <div className="text-2xl font-bold text-[#10243A] mt-1 font-mono">1.8 min</div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">From detection to accepted fix</p>
                </div>
              </div>

              {/* Recurring Clusters List */}
              <div className="space-y-4">
                {recurringIssues.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-2xs hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F05252]"></span>
                        <h3 className="text-sm font-bold text-[#10243A]">{item.title}</h3>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-[#64748B]">
                          {item.ruleId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {item.occurrences} Draft Detections
                        </span>
                        <span className="text-xs font-medium text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                          {item.severity}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                          Detected Root Cause
                        </span>
                        <p className="text-[#10243A] bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                          {item.rootCause}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                          Recommended Governance Intervention
                        </span>
                        <p className="text-[#10243A] bg-blue-50/50 p-2.5 rounded border border-blue-100 leading-relaxed">
                          {item.recommendedAction}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <span>Spread across:</span>
                        {item.affectedChannels.map((ch, idx) => (
                          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[#10243A] font-medium">
                            {ch}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {currentUser.permissions.canExecuteMemo ? (
                          <button
                            onClick={() => handleOpenMemoModal(item)}
                            className="px-3.5 py-1.5 bg-[#10243A] hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            <span>Issue Guideline Memo as {currentUser.name.split(' ')[0]}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerToast(`Training briefing on ${item.title} requested to Marcus Vance (Brand Governance Lead).`)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Request Team Briefing</span>
                          </button>
                        )}
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
      {/* 3. ADD BRAND RULE MODAL (DIRECT ADMIN COMMIT) */}
      {/* ========================================================= */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-sm font-bold text-[#10243A]">Add New Brand Governance Rule</h3>
              </div>
              <X
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600"
                onClick={() => setIsAddRuleOpen(false)}
              />
            </div>

            <form onSubmit={handleCreateRule} className="p-5 space-y-3.5 text-xs">
              <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded text-indigo-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Committing directly as <strong>{currentUser.name}</strong> ({currentUser.roleLabel}). Rule takes immediate effect across the engine.</span>
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">Rule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approved Q3 Discounting Threshold"
                  value={newRuleData.title}
                  onChange={(e) => setNewRuleData({ ...newRuleData, title: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#10243A] mb-1">Category</label>
                  <select
                    value={newRuleData.category}
                    onChange={(e) => setNewRuleData({ ...newRuleData, category: e.target.value })}
                    className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Terminology">Terminology</option>
                    <option value="Pricing">Pricing</option>
                    <option value="Claims">Claims</option>
                    <option value="Tone">Tone & Voice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#10243A] mb-1">Severity Type</label>
                  <select
                    value={newRuleData.severity}
                    onChange={(e) => setNewRuleData({ ...newRuleData, severity: e.target.value })}
                    className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="conflict">Confirmed Conflict (Coral)</option>
                    <option value="verification">Needs Verification (Amber)</option>
                    <option value="suggestion">Style Suggestion (Blue)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Forbidden Pattern / Trigger Phrase
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% partner discount"
                  value={newRuleData.targetPattern}
                  onChange={(e) => setNewRuleData({ ...newRuleData, targetPattern: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Approved Standard / Replacement Value
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. maximum authorized 10% partner tier"
                  value={newRuleData.approvedValue}
                  onChange={(e) => setNewRuleData({ ...newRuleData, approvedValue: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Authoritative Source / Handbook Section
                </label>
                <input
                  type="text"
                  placeholder="e.g. Global Partner Commercial Policy 2026 §4.1"
                  value={newRuleData.sourceRef}
                  onChange={(e) => setNewRuleData({ ...newRuleData, sourceRef: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded font-medium shadow-2xs cursor-pointer"
                >
                  Save & Enforce Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PROPOSE BRAND RULE MODAL (CREATOR / VIEW-ONLY WORKFLOW) */}
      {/* ========================================================= */}
      {isProposeRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-amber-50/70">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-[#10243A]">Propose Brand Guideline Revision</h3>
              </div>
              <X
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600"
                onClick={() => setIsProposeRuleModalOpen(false)}
              />
            </div>

            <form onSubmit={handleProposeRule} className="p-5 space-y-3.5 text-xs">
              <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded text-amber-900 text-[11px] leading-relaxed">
                <strong>Proposal Workflow:</strong> As a <strong>{currentUser.roleLabel}</strong>, this submission will be routed to <strong>Marcus Vance (Brand Governance Lead)</strong> for verification before active enforcement.
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">Proposed Rule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Update deprecated partner pricing phrase"
                  value={proposeRuleData.title}
                  onChange={(e) => setProposeRuleData({ ...proposeRuleData, title: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">Category</label>
                <select
                  value={proposeRuleData.category}
                  onChange={(e) => setProposeRuleData({ ...proposeRuleData, category: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Terminology">Terminology</option>
                  <option value="Pricing">Pricing</option>
                  <option value="Claims">Claims</option>
                  <option value="Tone">Tone & Voice</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Draft Phrase / Trigger to Catch
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. legacy discount $49/mo"
                  value={proposeRuleData.targetPattern}
                  onChange={(e) => setProposeRuleData({ ...proposeRuleData, targetPattern: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Proposed Replacement Standard
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. standard enterprise tier $79/mo"
                  value={proposeRuleData.approvedValue}
                  onChange={(e) => setProposeRuleData({ ...proposeRuleData, approvedValue: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Rationale / Context for Manager Review
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this rule revision is needed..."
                  value={proposeRuleData.rationale}
                  onChange={(e) => setProposeRuleData({ ...proposeRuleData, rationale: e.target.value })}
                  className="w-full border border-[#E2E8F0] rounded p-2 text-[#10243A] focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProposeRuleModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium shadow-2xs cursor-pointer"
                >
                  Submit Proposal for Manager Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. GUIDELINE MEMO DISPATCH MODAL (RECURRING PATTERN ACTION) */}
      {/* ========================================================= */}
      {isMemoModalOpen && selectedRecurringItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-[#10243A]">
                  Dispatch Brand Clarity Guideline Memo
                </h3>
              </div>
              <X
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600"
                onClick={() => setIsMemoModalOpen(false)}
              />
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block">Author & Title</span>
                  <span className="font-semibold text-[#10243A]">{currentUser.name}</span>
                  <span className="text-[11px] text-[#64748B] block">{currentUser.title}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block">Target Distribution</span>
                  <span className="font-semibold text-[#10243A]">Growth, Creative & Agencies</span>
                  <span className="text-[11px] text-[#64748B] block">18 active workspace authors</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#10243A] mb-1">
                  Guideline Memo Content (Markdown & Slack Compatible)
                </label>
                <textarea
                  rows={8}
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded p-3 text-[#10243A] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed bg-slate-50/50"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                <span>Will sync to Slack channel #brand-governance and Notion Playbook</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready to broadcast
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMemoModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatchMemo}
                  className="px-4 py-1.5 bg-[#10243A] hover:bg-slate-800 text-white rounded font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dispatch Memo to All Authors</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) MATRIX MODAL */}
      {/* ========================================================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10243A] flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#10243A]">Enterprise Role-Based Profile Matrix</h3>
                  <p className="text-xs text-[#64748B]">Switch user personas to test role-specific authority, guardrails, and audit workflows</p>
                </div>
              </div>
              <X
                className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600"
                onClick={() => setIsProfileModalOpen(false)}
              />
            </div>

            {/* Persona Cards Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {USER_PROFILES.map((profile) => {
                  const isActive = currentUser.id === profile.id;
                  return (
                    <div
                      key={profile.id}
                      className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-[#E2E8F0] bg-white hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div>
                        {/* Persona Top Info */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-full ${profile.avatarColor} flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white`}>
                              {profile.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-[#10243A]">{profile.name}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${profile.badgeBg} ${profile.badgeText} ${profile.badgeBorder}`}>
                                  {profile.roleLabel}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-[#64748B] mt-0.5">{profile.title}</p>
                              <span className="text-[11px] text-slate-400">{profile.department}</span>
                            </div>
                          </div>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1 border border-emerald-300">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#10243A] leading-relaxed mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {profile.description}
                        </p>

                        {/* Key Responsibilities */}
                        <div className="mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
                            Key Governance Responsibilities:
                          </span>
                          <ul className="space-y-1">
                            {profile.responsibilities.map((resp, idx) => (
                              <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <ChevronRight className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Permissions Matrix Pills */}
                        <div className="pt-3 border-t border-slate-100 mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-2">
                            Enforced Permissions:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <div className={`p-1.5 rounded flex items-center gap-1.5 ${profile.permissions.canSubmitContent ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                              {profile.permissions.canSubmitContent ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              <span>Submit & Check Drafts</span>
                            </div>
                            <div className={`p-1.5 rounded flex items-center gap-1.5 ${profile.permissions.canApplyFixes ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                              {profile.permissions.canApplyFixes ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              <span>Apply & Edit Fixes</span>
                            </div>
                            <div className={`p-1.5 rounded flex items-center gap-1.5 ${profile.permissions.canManageRules ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                              {profile.permissions.canManageRules ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              <span>Brand Knowledge Admin</span>
                            </div>
                            <div className={`p-1.5 rounded flex items-center gap-1.5 ${profile.permissions.canClearLegalFlags ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                              {profile.permissions.canClearLegalFlags ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              <span>Legal Sign-off / Waivers</span>
                            </div>
                            <div className={`p-1.5 rounded flex items-center gap-1.5 ${profile.permissions.canExecuteMemo ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                              {profile.permissions.canExecuteMemo ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              <span>Dispatch Clarity Memos</span>
                            </div>
                            <div className={`p-1.5 rounded flex items-center gap-1.5 ${profile.permissions.canExportAuditLog ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                              {profile.permissions.canExportAuditLog ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              <span>Export Audit Logs</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isActive ? (
                          <div className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold text-center border border-slate-200">
                            Currently Active Persona
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSwitchUserRole(profile)}
                            className="w-full py-2 bg-[#10243A] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Switch to {profile.name}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
                <span>Permissions are dynamically enforced across all workspace views and audit actions.</span>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#10243A] rounded font-semibold cursor-pointer"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
