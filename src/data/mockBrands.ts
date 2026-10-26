import {
  BrandProfile,
  AuditReport,
  RecurringPattern,
  RecurrenceThresholdConfig
} from '../types.ts';

export const DEFAULT_RECURRENCE_CONFIG: RecurrenceThresholdConfig = {
  minOccurrences: 3,
  minDistinctDrafts: 2,
  windowDays: 7
};

export const BRANDS: Record<string, BrandProfile> = {
  novapay: {
    id: 'novapay',
    name: 'NovaPay',
    fictionalLabel: 'Fictional Demo Brand — Fintech & Subscriptions',
    tagline: 'Modern Payment Processing & Business Subscription Infrastructure',
    industry: 'Fintech & B2B SaaS (Fictional Demo)',
    primaryColor: '#0F172A',
    rules: [
      {
        id: 'NP-RULE-01',
        brandId: 'novapay',
        category: 'Terminology',
        title: 'Official Product Name (NovaPay)',
        ruleStatement: 'The official product and brand name must be written strictly as single-word CamelCase "NovaPay" (never "Nova Pay", "Nova-Pay", or "novapay").',
        targetPatterns: ['Nova Pay', 'Nova-Pay', 'nova pay', 'nova-pay'],
        approvedValue: 'NovaPay',
        sourceRef: 'NovaPay Brand Identity Manual 2026 §1.1 (Nomenclature)',
        status: 'Approved',
        classification: 'confirmed_rule_conflict',
        severity: 'critical',
        explanation: 'Terminology conflict: "Nova Pay" differs from the approved single-word product name "NovaPay". Spaced or hyphenated variants dilute trademark consistency.',
        updatedAt: '2026-10-15'
      },
      {
        id: 'NP-RULE-02',
        brandId: 'novapay',
        category: 'Pricing & Facts',
        title: 'Approved Subscription Price (₹999 per month)',
        ruleStatement: 'The approved standard subscription price for NovaPay is ₹999 per month (₹999/month). Any other monthly subscription figure (such as ₹499/month) conflicts with approved pricing.',
        targetPatterns: ['₹499/month', '₹499 per month', '₹499/mo', 'Rs. 499/month', 'INR 499/month', '₹499'],
        approvedValue: '₹999/month',
        sourceRef: 'NovaPay Commercial Rate Schedule 2026 §2.1 (Approved Pricing)',
        status: 'Approved',
        classification: 'approved_fact_conflict',
        severity: 'critical',
        explanation: 'Price conflict: The stated subscription price conflicts with the approved NovaPay subscription price of ₹999 per month.',
        updatedAt: '2026-10-18'
      },
      {
        id: 'NP-RULE-03',
        brandId: 'novapay',
        category: 'Prohibited Claim',
        title: 'Prohibited Promotional Claim: Risk-Free Profits',
        ruleStatement: 'Promotional claims stating "guarantees risk-free profits", "risk-free profits", or "guaranteed returns" are strictly prohibited.',
        targetPatterns: [
          'guarantees risk-free profits',
          'risk-free profits',
          'guaranteed risk-free profits',
          'guaranteed returns',
          '100% loss-proof'
        ],
        approvedValue: 'delivers reliable, transparent payment processing',
        sourceRef: 'NovaPay Financial Promotions Compliance Directive §4.2',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        explanation: 'Prohibited claim: "guarantees risk-free profits" conflicts with the explicitly prohibited financial promotions rule banning profit or return guarantees.',
        updatedAt: '2026-10-12'
      },
      {
        id: 'NP-RULE-04',
        brandId: 'novapay',
        category: 'Performance & Claims',
        title: 'Performance Claims Require Approved Supporting Evidence',
        ruleStatement: 'All quantitative performance, speed, or uptime claims exceeding verified benchmarks (99.99% SLA uptime) require approved supporting evidence before publication.',
        targetPatterns: [
          '100% uptime',
          'zero downtime',
          'doubles merchant revenue in 7 days',
          '300% checkout conversion boost',
          'instant zero-second global clearing'
        ],
        approvedValue: 'backed by a verified 99.99% platform uptime SLA',
        sourceRef: 'NovaPay Product Claims Verification Standard §3.1',
        status: 'Approved',
        classification: 'unsupported_claim',
        severity: 'warning',
        explanation: 'Unsupported performance claim: Performance claims require approved supporting evidence. Note: A missing supporting source does not automatically prove that a claim is false, but requires human verification.',
        updatedAt: '2026-10-20'
      },
      {
        id: 'NP-RULE-05',
        brandId: 'novapay',
        category: 'Tone & Style',
        title: 'Trustworthy Enterprise Financial Tone',
        ruleStatement: 'Communications must remain clear, accurate, and measured. Avoid sensationalist hype phrases such as "get rich overnight" or "crush competitors".',
        targetPatterns: ['get rich overnight', 'instant riches', 'crush your competitors'],
        approvedValue: 'streamline your business financial operations',
        sourceRef: 'NovaPay Voice & Tone Playbook §2.3',
        status: 'Approved',
        classification: 'style_tone_suggestion',
        severity: 'info',
        explanation: 'Writing-style suggestion: Sensationalist phrasing departs from NovaPay’s trustworthy, measured brand voice.',
        updatedAt: '2026-10-10'
      },
      {
        id: 'NP-RULE-06',
        brandId: 'novapay',
        category: 'Terminology',
        title: 'Proposed Q4 Treasury Module Naming (Draft)',
        ruleStatement: 'Refer to the upcoming treasury add-on as "NovaPay Treasury Core" instead of "NovaPay Smart Wallet".',
        targetPatterns: ['NovaPay Smart Wallet'],
        approvedValue: 'NovaPay Treasury Core',
        sourceRef: 'Q4 Product Marketing Proposal Draft (Unverified)',
        status: 'Draft',
        classification: 'confirmed_rule_conflict',
        severity: 'info',
        explanation: 'Draft rule awaiting brand administrator approval. Draft or unverified rules are never enforced as authoritative until approved.',
        updatedAt: '2026-10-24'
      }
    ],
    sampleScenarios: [
      {
        id: 'novapay-canonical-ad',
        brandId: 'novapay',
        title: 'NovaPay Promotional Ad (Canonical Demo)',
        badge: '3 Core Findings',
        contentType: 'Advertisement',
        text: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
        description: 'Canonical Round 2 scenario: detects "Nova Pay" terminology conflict, "₹499/month" price conflict vs ₹999/month, and "guarantees risk-free profits" prohibited claim.'
      },
      {
        id: 'novapay-unverified-claim',
        brandId: 'novapay',
        title: 'NovaPay Merchant Email (With Unsupported Claim)',
        badge: 'Needs Verification',
        contentType: 'Email',
        text: 'Upgrade to Nova Pay today for ₹499/month! Our payment gateway doubles merchant revenue in 7 days with 100% uptime.',
        description: 'Tests both deterministic conflicts ("Nova Pay", "₹499/month") and unverified performance claims ("doubles merchant revenue in 7 days", "100% uptime") requiring human verification.'
      },
      {
        id: 'novapay-clean-copy',
        brandId: 'novapay',
        title: 'NovaPay Compliant Website Copy',
        badge: 'No Issues Detected',
        contentType: 'Website Copy',
        text: 'NovaPay delivers reliable, transparent payment processing for growing businesses. Subscribe today for ₹999/month, backed by a verified 99.99% platform uptime SLA.',
        description: 'Demonstrates a clean draft that passes all approved deterministic and contextual rules.'
      }
    ]
  },

  aerosip: {
    id: 'aerosip',
    name: 'AeroSip',
    fictionalLabel: 'Fictional Demo Brand — Smart Consumer Hardware',
    tagline: 'Precision Hydration Systems & Smart Thermal Vessels',
    industry: 'Consumer Hardware & Wellness (Fictional Demo)',
    primaryColor: '#0284C7',
    rules: [
      {
        id: 'AS-RULE-01',
        brandId: 'aerosip',
        category: 'Terminology',
        title: 'Mandatory Brand Spelling (AeroSip)',
        ruleStatement: 'The brand name is strictly "AeroSip" (CamelCase with capital A and S, no spaces or hyphens). Never write "Aero Sip" or "Aero-Sip".',
        targetPatterns: ['Aero Sip', 'Aero-Sip', 'aero sip'],
        approvedValue: 'AeroSip',
        sourceRef: 'AeroSip Identity Manual 2026 §1.1',
        status: 'Approved',
        classification: 'confirmed_rule_conflict',
        severity: 'critical',
        explanation: 'Terminology conflict: "Aero Sip" violates the approved single-word brand name "AeroSip".',
        updatedAt: '2026-10-14'
      },
      {
        id: 'AS-RULE-02',
        brandId: 'aerosip',
        category: 'Pricing & Facts',
        title: 'Approved Promotional Launch Price (₹999)',
        ruleStatement: 'The approved promotional offer price for the AeroSip Smart Hydration Vessel is ₹999. Quoting ₹899 or other unapproved promotional prices conflicts with the commercial rate card.',
        targetPatterns: ['₹899', 'Rs. 899', 'INR 899'],
        approvedValue: '₹999',
        sourceRef: 'AeroSip Commercial Price Schedule 2026 §2.0',
        status: 'Approved',
        classification: 'approved_fact_conflict',
        severity: 'critical',
        explanation: 'Price conflict: The stated price conflicts with the approved AeroSip promotional price of ₹999.',
        updatedAt: '2026-10-16'
      },
      {
        id: 'AS-RULE-03',
        brandId: 'aerosip',
        category: 'Performance & Claims',
        title: 'Thermal Insulation Duration (Certified 24 Hours)',
        ruleStatement: 'Intertek Lab Report #4412 certifies 24-hour cold retention. Claims exceeding 24 hours (e.g., "keeps drinks cold for 48 hours" or "72 hours") lack approved supporting evidence and require human verification.',
        targetPatterns: [
          'keeps drinks cold for 48 hours',
          'Keeps drinks cold for 48 hours',
          'keeps drinks cold for 72 hours',
          'cold for 48 hours',
          'cold for 72 hours'
        ],
        approvedValue: 'keeps drinks cold for 24 hours',
        sourceRef: 'Intertek Lab Test Report #4412 & Tech Spec TS-04',
        status: 'Approved',
        classification: 'unsupported_claim',
        severity: 'warning',
        explanation: 'Unsupported performance claim: Lab certification supports 24-hour cold retention. A 48-hour claim lacks supporting evidence in the approved knowledge base (not automatically false, but requires human verification).',
        updatedAt: '2026-10-19'
      },
      {
        id: 'AS-RULE-04',
        brandId: 'aerosip',
        category: 'Prohibited Claim',
        title: 'Prohibition on Medical Cure Claims',
        ruleStatement: 'AeroSip is a wellness hydration vessel, not a medical device. Claims that it "cures dehydration migraines" or "guarantees weight loss" are strictly prohibited.',
        targetPatterns: ['cures dehydration migraines', 'curing dehydration migraines', 'guarantees weight loss'],
        approvedValue: 'supports optimal daily hydration habits',
        sourceRef: 'Consumer Wellness Advertising Standards §8.3',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        explanation: 'Prohibited claim: Medical cure claims are prohibited for consumer hydration products.',
        updatedAt: '2026-10-11'
      }
    ],
    sampleScenarios: [
      {
        id: 'aerosip-canonical',
        brandId: 'aerosip',
        title: 'AeroSip Summer Launch Ad',
        badge: '2 Conflicts + 1 Unverified',
        contentType: 'Advertisement',
        text: 'Discover Aero Sip for just ₹899. Keeps drinks cold for 48 hours!',
        description: 'Flags "Aero Sip" name conflict, "₹899" price conflict vs ₹999, and "Keeps drinks cold for 48 hours" as an unsupported claim requiring human verification.'
      },
      {
        id: 'aerosip-social',
        brandId: 'aerosip',
        title: 'AeroSip Social Wellness Post',
        badge: 'Prohibited Medical Claim',
        contentType: 'Social Post',
        text: 'Stay refreshed with Aero Sip! Grab yours for ₹899 today — it cures dehydration migraines and keeps drinks cold for 48 hours.',
        description: 'Tests prohibited medical claim detection alongside pricing and terminology rules.'
      }
    ]
  },

  skynex: {
    id: 'skynex',
    name: 'SkyNex Cloud',
    fictionalLabel: 'Fictional Demo Brand — Enterprise Cloud SaaS',
    tagline: 'Enterprise Workflow Automation & Cloud Infrastructure',
    industry: 'B2B Enterprise SaaS (Fictional Demo)',
    primaryColor: '#1E3A8A',
    rules: [
      {
        id: 'SN-RULE-01',
        brandId: 'skynex',
        category: 'Terminology',
        title: 'Enterprise Tier Naming Convention',
        ruleStatement: 'The legacy tier name "SkyNex Pro" was retired in Q3 2025. All offerings above Starter must be designated "SkyNex Enterprise".',
        targetPatterns: ['SkyNex Pro', 'Skynex Pro'],
        approvedValue: 'SkyNex Enterprise',
        sourceRef: 'Brand Identity Manual 2026 §3.1 (Nomenclature)',
        status: 'Approved',
        classification: 'confirmed_rule_conflict',
        severity: 'critical',
        explanation: 'Terminology conflict: "SkyNex Pro" is deprecated. Use the approved product tier name "SkyNex Enterprise".',
        updatedAt: '2026-10-10'
      },
      {
        id: 'SN-RULE-02',
        brandId: 'skynex',
        category: 'Pricing & Facts',
        title: 'Approved Enterprise Seat Price ($79/mo)',
        ruleStatement: 'Standard enterprise seat licensing is $79/mo. Publishing legacy $49/mo pricing conflicts with the approved commercial schedule.',
        targetPatterns: ['$49/mo', '$49/month', '$49 per month'],
        approvedValue: '$79/mo',
        sourceRef: 'Q4 Master Commercial Schedule §1.4',
        status: 'Approved',
        classification: 'approved_fact_conflict',
        severity: 'critical',
        explanation: 'Price conflict: $49/mo contradicts the approved enterprise seat licensing price of $79/mo.',
        updatedAt: '2026-10-12'
      },
      {
        id: 'SN-RULE-03',
        brandId: 'skynex',
        category: 'Prohibited Claim',
        title: 'Competitor Disparagement Prohibition',
        ruleStatement: 'Direct derogatory naming of competitors (such as "Acme Cloud\'s clunky and sluggish interface") is prohibited.',
        targetPatterns: ["Unlike Acme Cloud's clunky and sluggish interface,", "Acme Cloud's clunky and sluggish interface"],
        approvedValue: 'Engineered for high-velocity enterprise teams,',
        sourceRef: 'Global Competitive Positioning Guidelines §7.2',
        status: 'Approved',
        classification: 'prohibited_claim',
        severity: 'critical',
        explanation: 'Prohibited claim: Direct disparagement of named competitors violates fair advertising guidelines.',
        updatedAt: '2026-10-08'
      },
      {
        id: 'SN-RULE-04',
        brandId: 'skynex',
        category: 'Performance & Claims',
        title: 'SLA Uptime Commitment Standard (99.99%)',
        ruleStatement: 'Approved SLA commitment is 99.99% uptime. Claims of "guaranteed 100% uptime SLA with zero seconds of annual downtime" lack supporting evidence and require verification.',
        targetPatterns: ['guaranteed 100% uptime SLA with zero seconds of annual downtime', '100% uptime SLA'],
        approvedValue: 'enterprise 99.99% uptime commitment',
        sourceRef: 'Infrastructure SLA Disclosure Policy §2.1',
        status: 'Approved',
        classification: 'unsupported_claim',
        severity: 'warning',
        explanation: 'Unsupported claim: Absolute 100% uptime claims are not supported by standard engineering SLA certificates and require human verification.',
        updatedAt: '2026-10-15'
      },
      {
        id: 'SN-RULE-05',
        brandId: 'skynex',
        category: 'Tone & Style',
        title: 'Defensible Market Positioning Tone',
        ruleStatement: 'Prefer defensible positioning ("recognized industry innovators") over unsubstantiated superlatives ("undisputed market leaders").',
        targetPatterns: ['undisputed market leaders'],
        approvedValue: 'recognized industry innovators',
        sourceRef: 'Voice & Tone Playbook §2.4',
        status: 'Approved',
        classification: 'style_tone_suggestion',
        severity: 'info',
        explanation: 'Writing-style suggestion: Replace unsubstantiated superlative with defensible positioning.',
        updatedAt: '2026-10-14'
      }
    ],
    sampleScenarios: [
      {
        id: 'skynex-enterprise-launch',
        brandId: 'skynex',
        title: 'Q4 Enterprise Cloud Launch Copy',
        badge: '5 Findings',
        contentType: 'Website Copy',
        text: `Introducing SkyNex Pro: The Next Generation Cloud Platform\n\nWe are thrilled to announce that SkyNex Pro is now available for all enterprise clients starting at just $49/mo per seat. Unlike Acme Cloud's clunky and sluggish interface, our unified infrastructure delivers guaranteed 100% uptime SLA with zero seconds of annual downtime.\n\nSign up before October 31 to lock in our legacy tier pricing and experience why we are undisputed market leaders in cloud delivery.`,
        description: 'Comprehensive enterprise test draft with terminology, pricing, competitor disparagement, unverified SLA, and tone findings.'
      }
    ]
  }
};

// Pre-populated historical reviews within the last 7 days so Review History and Recurring Issues
// work immediately out of the box and link directly to real rule IDs and real drafts.
const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

export const INITIAL_AUDIT_HISTORY: AuditReport[] = [
  {
    id: 'REV-2026-101',
    brandId: 'novapay',
    brandName: 'NovaPay',
    campaign: 'Diwali Merchant Acquiring Promo',
    contentType: 'Social Post',
    title: 'Diwali Merchant Acquiring Promo — Social Ad #1',
    originalText: 'Switch to Nova Pay this festive season! Subscribe for ₹499/month where every account guarantees risk-free profits.',
    currentText: 'Switch to NovaPay this festive season! Subscribe for ₹999/month where every account delivers reliable, transparent payment processing.',
    versions: [
      {
        versionNumber: 1,
        contentText: 'Switch to Nova Pay this festive season! Subscribe for ₹499/month where every account guarantees risk-free profits.',
        changeSummary: 'Original submitted draft',
        createdBy: 'Sarah Lin',
        createdByRole: 'Marketing Creator',
        createdAt: new Date(now - 2 * dayMs).toISOString()
      },
      {
        versionNumber: 2,
        contentText: 'Switch to NovaPay this festive season! Subscribe for ₹999/month where every account delivers reliable, transparent payment processing.',
        changeSummary: 'Accepted 3 rule-backed corrections (NP-RULE-01, NP-RULE-02, NP-RULE-03)',
        createdBy: 'Sarah Lin',
        createdByRole: 'Marketing Creator',
        createdAt: new Date(now - 2 * dayMs + 300000).toISOString()
      }
    ],
    findings: [
      {
        id: 'hist-np-1',
        classification: 'confirmed_rule_conflict',
        category: 'Terminology',
        severity: 'critical',
        originalSpan: 'Nova Pay',
        startIndex: 10,
        endIndex: 18,
        conflictText: 'Terminology conflict: "Nova Pay" differs from the approved product name "NovaPay".',
        ruleId: 'NP-RULE-01',
        ruleTitle: 'Official Product Name (NovaPay)',
        approvedRuleCitation: 'NovaPay Brand Identity Manual 2026 §1.1 (Nomenclature)',
        sourceReference: 'NovaPay Brand Identity Manual 2026 §1.1 (Nomenclature)',
        explanation: 'Terminology conflict: "Nova Pay" differs from the approved single-word product name "NovaPay".',
        suggestedReplacement: 'NovaPay',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'accepted',
        decidedBy: 'Sarah Lin',
        decidedAt: new Date(now - 2 * dayMs + 300000).toISOString(),
        timestamp: new Date(now - 2 * dayMs).toISOString()
      },
      {
        id: 'hist-np-2',
        classification: 'approved_fact_conflict',
        category: 'Pricing & Facts',
        severity: 'critical',
        originalSpan: '₹499/month',
        startIndex: 54,
        endIndex: 64,
        conflictText: 'Price conflict: "₹499/month" conflicts with the approved price of ₹999 per month.',
        ruleId: 'NP-RULE-02',
        ruleTitle: 'Approved Subscription Price (₹999 per month)',
        approvedRuleCitation: 'NovaPay Commercial Rate Schedule 2026 §2.1 (Approved Pricing)',
        sourceReference: 'NovaPay Commercial Rate Schedule 2026 §2.1 (Approved Pricing)',
        explanation: 'Price conflict: The stated subscription price conflicts with the approved NovaPay subscription price of ₹999 per month.',
        suggestedReplacement: '₹999/month',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'accepted',
        decidedBy: 'Sarah Lin',
        decidedAt: new Date(now - 2 * dayMs + 300000).toISOString(),
        timestamp: new Date(now - 2 * dayMs).toISOString()
      },
      {
        id: 'hist-np-3',
        classification: 'prohibited_claim',
        category: 'Prohibited Claim',
        severity: 'critical',
        originalSpan: 'guarantees risk-free profits',
        startIndex: 86,
        endIndex: 114,
        conflictText: 'Prohibited claim: "guarantees risk-free profits" conflicts with the explicitly prohibited rule.',
        ruleId: 'NP-RULE-03',
        ruleTitle: 'Prohibited Promotional Claim: Risk-Free Profits',
        approvedRuleCitation: 'NovaPay Financial Promotions Compliance Directive §4.2',
        sourceReference: 'NovaPay Financial Promotions Compliance Directive §4.2',
        explanation: 'Prohibited claim: "guarantees risk-free profits" conflicts with the explicitly prohibited financial promotions rule banning profit or return guarantees.',
        suggestedReplacement: 'delivers reliable, transparent payment processing',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'accepted',
        decidedBy: 'Sarah Lin',
        decidedAt: new Date(now - 2 * dayMs + 300000).toISOString(),
        timestamp: new Date(now - 2 * dayMs).toISOString()
      }
    ],
    toneSummary: 'All deterministic conflicts resolved; revised copy aligns with NovaPay financial promotion standards.',
    checksExecuted: {
      deterministic: true,
      deterministicRulesChecked: 5,
      geminiContextual: true,
      geminiSuccess: true
    },
    overallStatus: 'changes_applied',
    contentApprovalStatus: 'approved_for_publication',
    contentApprovedBy: 'Marcus Vance (Brand Governance Lead)',
    contentApprovedAt: new Date(now - 2 * dayMs + 600000).toISOString(),
    submittedBy: 'Sarah Lin',
    submittedByRole: 'Marketing Creator',
    submittedByRoleKey: 'creator',
    createdAt: new Date(now - 2 * dayMs).toISOString(),
    completedAt: new Date(now - 2 * dayMs + 600000).toISOString()
  },
  {
    id: 'REV-2026-102',
    brandId: 'novapay',
    brandName: 'NovaPay',
    campaign: 'Q4 SMB Email Outreach',
    contentType: 'Email',
    title: 'Q4 SMB Founders Cold Email Sequence',
    originalText: 'Hi Founder, Nova Pay is offering early-bird access at ₹499/month. Join Nova Pay today!',
    currentText: 'Hi Founder, NovaPay is offering early-bird access at ₹999/month. Join NovaPay today!',
    versions: [
      {
        versionNumber: 1,
        contentText: 'Hi Founder, Nova Pay is offering early-bird access at ₹499/month. Join Nova Pay today!',
        changeSummary: 'Original submitted draft',
        createdBy: 'Marcus Vance',
        createdByRole: 'Brand Governance Lead',
        createdAt: new Date(now - 1 * dayMs).toISOString()
      },
      {
        versionNumber: 2,
        contentText: 'Hi Founder, NovaPay is offering early-bird access at ₹999/month. Join NovaPay today!',
        changeSummary: 'Applied official product naming and ₹999/month rate correction',
        createdBy: 'Marcus Vance',
        createdByRole: 'Brand Governance Lead',
        createdAt: new Date(now - 1 * dayMs + 180000).toISOString()
      }
    ],
    findings: [
      {
        id: 'hist-np-4',
        classification: 'confirmed_rule_conflict',
        category: 'Terminology',
        severity: 'critical',
        originalSpan: 'Nova Pay',
        startIndex: 12,
        endIndex: 20,
        conflictText: 'Terminology conflict: "Nova Pay" differs from the approved product name "NovaPay".',
        ruleId: 'NP-RULE-01',
        ruleTitle: 'Official Product Name (NovaPay)',
        approvedRuleCitation: 'NovaPay Brand Identity Manual 2026 §1.1 (Nomenclature)',
        sourceReference: 'NovaPay Brand Identity Manual 2026 §1.1 (Nomenclature)',
        explanation: 'Terminology conflict: "Nova Pay" differs from the approved single-word product name "NovaPay".',
        suggestedReplacement: 'NovaPay',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'accepted',
        decidedBy: 'Marcus Vance',
        decidedAt: new Date(now - 1 * dayMs + 180000).toISOString(),
        timestamp: new Date(now - 1 * dayMs).toISOString()
      },
      {
        id: 'hist-np-5',
        classification: 'approved_fact_conflict',
        category: 'Pricing & Facts',
        severity: 'critical',
        originalSpan: '₹499/month',
        startIndex: 54,
        endIndex: 64,
        conflictText: 'Price conflict: "₹499/month" conflicts with the approved price of ₹999 per month.',
        ruleId: 'NP-RULE-02',
        ruleTitle: 'Approved Subscription Price (₹999 per month)',
        approvedRuleCitation: 'NovaPay Commercial Rate Schedule 2026 §2.1 (Approved Pricing)',
        sourceReference: 'NovaPay Commercial Rate Schedule 2026 §2.1 (Approved Pricing)',
        explanation: 'Price conflict: The stated subscription price conflicts with the approved NovaPay subscription price of ₹999 per month.',
        suggestedReplacement: '₹999/month',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'accepted',
        decidedBy: 'Marcus Vance',
        decidedAt: new Date(now - 1 * dayMs + 180000).toISOString(),
        timestamp: new Date(now - 1 * dayMs).toISOString()
      }
    ],
    toneSummary: 'Professional B2B outreach tone verified.',
    checksExecuted: {
      deterministic: true,
      deterministicRulesChecked: 5,
      geminiContextual: true,
      geminiSuccess: true
    },
    overallStatus: 'changes_applied',
    contentApprovalStatus: 'approved_for_publication',
    contentApprovedBy: 'Marcus Vance (Brand Governance Lead)',
    contentApprovedAt: new Date(now - 1 * dayMs + 240000).toISOString(),
    submittedBy: 'Marcus Vance',
    submittedByRole: 'Brand Governance Lead',
    submittedByRoleKey: 'brand_manager',
    createdAt: new Date(now - 1 * dayMs).toISOString(),
    completedAt: new Date(now - 1 * dayMs + 240000).toISOString()
  },
  {
    id: 'REV-2026-103',
    brandId: 'novapay',
    brandName: 'NovaPay',
    campaign: 'Partner Agency Landing Page Draft',
    contentType: 'Website Copy',
    title: 'External Agency Partner Landing Page Banner',
    originalText: 'Scale faster with Nova Pay! Lock in our special ₹499/month plan that guarantees risk-free profits for every merchant.',
    currentText: 'Scale faster with NovaPay! Lock in our special ₹999/month plan that delivers reliable, transparent payment processing for every merchant.',
    versions: [
      {
        versionNumber: 1,
        contentText: 'Scale faster with Nova Pay! Lock in our special ₹499/month plan that guarantees risk-free profits for every merchant.',
        changeSummary: 'Original submitted draft',
        createdBy: 'Sarah Lin',
        createdByRole: 'Marketing Creator',
        createdAt: new Date(now - 12 * 3600 * 1000).toISOString()
      }
    ],
    findings: [
      {
        id: 'hist-np-6',
        classification: 'confirmed_rule_conflict',
        category: 'Terminology',
        severity: 'critical',
        originalSpan: 'Nova Pay',
        startIndex: 18,
        endIndex: 26,
        conflictText: 'Terminology conflict: "Nova Pay" differs from the approved product name "NovaPay".',
        ruleId: 'NP-RULE-01',
        ruleTitle: 'Official Product Name (NovaPay)',
        approvedRuleCitation: 'NovaPay Brand Identity Manual 2026 §1.1 (Nomenclature)',
        sourceReference: 'NovaPay Brand Identity Manual 2026 §1.1 (Nomenclature)',
        explanation: 'Terminology conflict: "Nova Pay" differs from the approved single-word product name "NovaPay".',
        suggestedReplacement: 'NovaPay',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'pending',
        timestamp: new Date(now - 12 * 3600 * 1000).toISOString()
      },
      {
        id: 'hist-np-7',
        classification: 'approved_fact_conflict',
        category: 'Pricing & Facts',
        severity: 'critical',
        originalSpan: '₹499/month',
        startIndex: 48,
        endIndex: 58,
        conflictText: 'Price conflict: "₹499/month" conflicts with the approved price of ₹999 per month.',
        ruleId: 'NP-RULE-02',
        ruleTitle: 'Approved Subscription Price (₹999 per month)',
        approvedRuleCitation: 'NovaPay Commercial Rate Schedule 2026 §2.1 (Approved Pricing)',
        sourceReference: 'NovaPay Commercial Rate Schedule 2026 §2.1 (Approved Pricing)',
        explanation: 'Price conflict: The stated subscription price conflicts with the approved NovaPay subscription price of ₹999 per month.',
        suggestedReplacement: '₹999/month',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'pending',
        timestamp: new Date(now - 12 * 3600 * 1000).toISOString()
      },
      {
        id: 'hist-np-8',
        classification: 'prohibited_claim',
        category: 'Prohibited Claim',
        severity: 'critical',
        originalSpan: 'guarantees risk-free profits',
        startIndex: 69,
        endIndex: 97,
        conflictText: 'Prohibited claim: "guarantees risk-free profits" conflicts with the explicitly prohibited rule.',
        ruleId: 'NP-RULE-03',
        ruleTitle: 'Prohibited Promotional Claim: Risk-Free Profits',
        approvedRuleCitation: 'NovaPay Financial Promotions Compliance Directive §4.2',
        sourceReference: 'NovaPay Financial Promotions Compliance Directive §4.2',
        explanation: 'Prohibited claim: "guarantees risk-free profits" conflicts with the explicitly prohibited financial promotions rule banning profit or return guarantees.',
        suggestedReplacement: 'delivers reliable, transparent payment processing',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'pending',
        timestamp: new Date(now - 12 * 3600 * 1000).toISOString()
      }
    ],
    toneSummary: 'Draft contains 3 critical rule conflicts awaiting creator decision.',
    checksExecuted: {
      deterministic: true,
      deterministicRulesChecked: 5,
      geminiContextual: true,
      geminiSuccess: true
    },
    overallStatus: 'issues_found',
    contentApprovalStatus: 'pending_review',
    submittedBy: 'Sarah Lin',
    submittedByRole: 'Marketing Creator',
    submittedByRoleKey: 'creator',
    createdAt: new Date(now - 12 * 3600 * 1000).toISOString()
  }
];

// Pre-built realistic multi-document import bundle so judges can test all 10 Acceptance Tests
// (multi-page manual with page refs, multi-doc categories, duplicate merging, conflicting prices,
// structured CSV product catalogue with valid + zero + malformed rows, and style guidelines)
// with 1 click OR by uploading their own files from disk.
export const SAMPLE_IMPORT_BUNDLE = [
  {
    filename: 'NovaPay_Official_Brand_Manual_2026.pdf',
    fileType: 'pdf',
    isApprovedExample: false,
    content: `--- Page 1: Brand Identity & Nomenclature ---
Section 1.1: Official Brand & Product Naming
The corporate brand name is strictly "NovaPay" written as a single CamelCase word. Do not use spaced or hyphenated variants such as "Nova Pay" or "Nova-Pay".
Our flagship enterprise module is officially named "NovaPay Pulse". Never refer to it as "NovaPay Pulse Pro" or "Nova Pulse" in customer-facing communications.

--- Page 2: Brand Voice, Tone & Channel Guidelines ---
Section 2.1: Voice and Writing Style
Use a confident, helpful, and transparent tone. Avoid exaggerated promises or get-rich-quick language. Keep social captions concise (under 240 characters) and prefer plain language over dense banking jargon.
Section 2.2: Channel-Specific Requirements
For Email campaigns: Always include a clear product tier reference in the footer.
For Social Media posts: Avoid all-caps headlines and use at most 2 hashtags per post.

--- Page 3: Commercial Pricing & Claims Policy ---
Section 3.1: Subscription Pricing (Effective Jan 2026)
 Product: NovaPay Pulse
Approved Subscription Price: ₹2,499/month (INR, billed monthly, India Enterprise Market, Effective: 2026-01-01).
Section 3.2: Claims & Supporting Evidence
Approved Claim: "Processes domestic UPI & card settlements with 99.99% platform uptime" (Supported by Audit Report #NP-SLA-2026).
Prohibited Claim: Never claim "zero chargeback risk" or "100% fraud-immune transactions".

--- Page 4: Accessibility & Inclusive Communication ---
Section 4.1: Accessibility Requirements
All promotional graphics and product screenshots shared on social media or landing pages must include descriptive alt-text and maintain at least 4.5:1 text contrast.
[Unreadable Legacy Appendix Scan on Page 5 — Missing OCR Layer]`
  },
  {
    filename: 'NovaPay_Q4_Regional_Pricing_Addendum.docx',
    fileType: 'docx',
    isApprovedExample: false,
    content: `# Section 1: Brand Nomenclature Confirmation
The enterprise module name is "NovaPay Pulse" (avoid "NovaPay Pulse Pro" or "Nova Pulse").

# Section 2: Updated Enterprise Pricing Schedule (Effective Oct 2026)
Product: NovaPay Pulse
Approved Subscription Price: ₹2,999/month (INR, billed monthly, Revised Q4 Enterprise Rate Card, Effective: 2026-10-01).
Note: This document states ₹2,999/month for NovaPay Pulse, conflicting with the ₹2,499/month price listed in the January 2026 Brand Manual.`
  },
  {
    filename: 'NovaPay_Product_Catalogue_2026.csv',
    fileType: 'csv',
    isApprovedExample: false,
    content: `Product Name,SKU,Approved Description,Price,Currency,Billing Period,Approved Claims,Supporting Source
NovaPay Sandbox,NP-FREE-00,Developer testing gateway for staging integrations,0,INR,month,Free developer sandbox with unlimited test API calls,Developer Portal Spec v2.1
NovaPay Growth,NP-GRW-01,Multi-currency checkout suite for scaling D2C brands,1499,INR,month,Supports 35+ international currencies with transparent FX,Commercial Rate Card 2026 §2.2
NovaPay Global,NP-GLB-02,Cross-border treasury and automated reconciliation rail,4999,INR,month,Automated T+1 cross-border reconciliation for verified exporters,Commercial Rate Card 2026 §2.4
,NP-ERR-99,Malformed catalogue row missing product name and invalid price,TBD,INR,month,Unverified draft entry,Draft Sheet`
  },
  {
    filename: 'NovaPay_Approved_Campaign_Examples.txt',
    fileType: 'txt',
    isApprovedExample: true,
    content: `# Approved Marketing Copy Examples (Reference Only)
Example 1 (LinkedIn Announcement):
"Scale your checkout reliability with NovaPay Pulse. Built for modern finance teams that value clear fees and predictable reconciliation."
Suggested Style Pattern: Open product announcements with a direct customer outcome verb ("Scale...", "Streamline...") and highlight fee transparency.`
  }
];

