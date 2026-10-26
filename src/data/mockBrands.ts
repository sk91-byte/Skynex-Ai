import { BrandProfile, BenchmarkScenario, RecurringPattern } from '../types.ts';

export const BRANDS: Record<string, BrandProfile> = {
  aerosip: {
    id: 'aerosip',
    name: 'AeroSip',
    tagline: 'Precision Hydration Systems & Smart Thermal Vessels',
    industry: 'Consumer Hardware & HealthTech',
    primaryColor: '#0284C7',
    guidelines: [
      {
        id: 'AS-G01',
        category: 'Terminology',
        title: 'Mandatory Brand Name Spelling',
        rule: 'The brand name is strictly "AeroSip" (CamelCase with capital A and S, no spaces or hyphens).',
        rationale: 'Prevent brand confusion with generic aerators or water bottles. Never use "Aero Sip" or "Aerosip".',
        severity: 'critical',
        citation: 'AeroSip Identity Manual 2026, Rule 1.1',
        sourceLabel: 'AeroSip Identity Manual 2026 v3.1',
        status: 'active',
        version: '3.1'
      },
      {
        id: 'AS-G02',
        category: 'Pricing & Facts',
        title: 'Approved Canonical Offer Price',
        rule: 'AeroSip Smart Hydration Vessel promotional campaign price is ₹999. AeroSip Pro flagship is ₹4,499.',
        rationale: 'Quoting ₹899 or below-MAP rates violates commercial retail agreements and truth-in-advertising guidelines.',
        severity: 'critical',
        citation: 'Commercial Price Schedule 2026, Section 2',
        sourceLabel: 'Rate Card 2026 Q3',
        status: 'active',
        version: '2.0'
      },
      {
        id: 'AS-G03',
        category: 'Performance Claims',
        title: 'Thermal Insulation Verification Standard',
        rule: 'Thermal performance claims exceeding lab certification (certified for 24h cold / 12h hot) require human verification.',
        rationale: 'Claims such as "keeps drinks cold for 48 hours" or "72 hours ice cold" lack CDSCO lab backing and are unverified.',
        severity: 'warning',
        citation: 'Technical Specifications & Lab Certifications, Doc TS-04',
        sourceLabel: 'Intertek Lab Test Report #4412',
        status: 'active',
        version: '1.4'
      },
      {
        id: 'AS-G04',
        category: 'Regulatory & Claims',
        title: 'Prohibition on Medical Cure Claims',
        rule: 'Medical disease cure or clinical health diagnosis claims are strictly prohibited.',
        rationale: 'AeroSip is an everyday lifestyle tracker, not a certified medical device. Cannot claim to cure dehydration migraines or guarantee weight loss.',
        severity: 'critical',
        citation: 'Health Claims Compliance & CDSCO Standards, Doc 8.3',
        sourceLabel: 'CDSCO Regulatory Notice',
        status: 'active',
        version: '2.2'
      },
      {
        id: 'AS-G05',
        category: 'Tone of Voice',
        title: 'Evidence-Grounded Wellness Voice',
        rule: 'Tone should be invigorating, mindful, and evidence-grounded. Avoid pseudoscientific buzzwords like "cellular detox".',
        rationale: 'Ground claims in measurable hydration biology rather than sensational wellness fads.',
        severity: 'warning',
        citation: 'Editorial Voice Styleguide, Section 2',
        sourceLabel: 'Brand Tone Matrix',
        status: 'active',
        version: '1.2'
      }
    ],
    facts: [
      { id: 'AS-F01', key: 'Promotional Launch Offer', approvedValue: '₹999', unit: 'INR', context: 'Standard retail promotion for smart hydration vessel' },
      { id: 'AS-F02', key: 'AeroSip Pro Flagship', approvedValue: '₹4,499', unit: 'INR', context: 'MSRP for premium stainless steel model' },
      { id: 'AS-F03', key: 'Certified Cold Retention', approvedValue: '24 hours', context: 'Lab certified cold duration (do not claim 48 hours without add-on sleeve)' },
      { id: 'AS-F04', key: 'Battery Duration', approvedValue: '14 days', context: 'Average usage with daily sensor polling' }
    ],
    prohibitedTerms: [
      { term: 'cures dehydration migraines', category: 'Regulatory', explanation: 'FDA/CDSCO bans claiming disease cure for consumer bottles.', suggestedAlternative: 'helps maintain optimal daily hydration levels', severity: 'critical' },
      { term: 'guaranteed weight loss', category: 'Regulatory', explanation: 'Unsubstantiated metabolic claim.', suggestedAlternative: 'supports an active, balanced daily wellness routine', severity: 'critical' },
      { term: 'cellular detox', category: 'Tone', explanation: 'Pseudoscience buzzword; kidneys and liver detoxify, not water bottles.', suggestedAlternative: 'clean hydration with calibrated mineral monitoring', severity: 'warning' },
      { term: 'infinite battery', category: 'Pricing & Facts', explanation: 'Misleading battery life claim.', suggestedAlternative: 'extended 14-day battery endurance', severity: 'warning' }
    ],
    approvedTerms: [
      { term: 'AeroSip', context: 'Standard brand name' },
      { term: 'Smart Hydration Vessel', context: 'Approved product category definition' },
      { term: 'H2O Tracker App', context: 'Companion iOS and Android app' }
    ],
    requiredDisclaimers: [
      {
        triggerKeyword: 'health',
        disclaimerText: 'AeroSip is a lifestyle wellness accessory and is not intended to diagnose, treat, or cure any medical condition.',
        reason: 'Consumer health tech disclaimer'
      }
    ]
  },

  novapay: {
    id: 'novapay',
    name: 'NovaPay',
    tagline: 'Enterprise Financial Infrastructure & Payment Orchestration',
    industry: 'Fintech & B2B SaaS',
    primaryColor: '#0F172A',
    guidelines: [
      {
        id: 'NP-G01',
        category: 'Terminology',
        title: 'Brand Wordmark Integrity',
        rule: 'The brand name is strictly "NovaPay" (single camel-cased word).',
        rationale: 'Avoid brand dilution and trademark infringement. Never spell as "Nova Pay", "Nova-pay", or "novapay".',
        severity: 'critical',
        citation: 'Brand Guidelines 2026 Q3, Rule 1.1 (Brand Identity)',
        sourceLabel: 'NovaPay Trademark Manual',
        status: 'active',
        version: '3.0'
      },
      {
        id: 'NP-G02',
        category: 'Pricing & Facts',
        title: 'Standard Subscription Rate',
        rule: 'NovaPay Standard Plan pricing is ₹999/month. Starter plan is ₹1,499 billed quarterly (not ₹499/mo).',
        rationale: 'Misrepresenting monthly subscription rates breaches financial consumer protection and ASA regulations.',
        severity: 'critical',
        citation: 'Commercial Rate Card v3.4, Section 2 (Pricing Integrity)',
        sourceLabel: 'Rate Card v3.4',
        status: 'active',
        version: '3.4'
      },
      {
        id: 'NP-G03',
        category: 'Regulatory & Claims',
        title: 'Strict Ban on Profit Guarantees',
        rule: 'Absolute return or profit guarantees are strictly prohibited.',
        rationale: 'RBI and financial market regulations strictly ban claims like "risk-free profits", "guaranteed returns", or "100% loss-proof".',
        severity: 'critical',
        citation: 'Regulatory Compliance Directive 4.2 (Anti-Deceptive Marketing)',
        sourceLabel: 'RBI Compliance Directive 4.2',
        status: 'active',
        version: '4.2'
      },
      {
        id: 'NP-G04',
        category: 'Tone of Voice',
        title: 'Institutional Clarity and Composure',
        rule: 'Maintain objective, measured, enterprise-grade clarity. Avoid aggressive hype or get-rich-quick sensationalism.',
        rationale: 'Enterprise buyers value operational uptime (99.99%), resilience, and regulatory transparency.',
        severity: 'warning',
        citation: 'Voice & Tone Guidelines, Section 3.1',
        sourceLabel: 'Corporate Communications Guide',
        status: 'active',
        version: '2.1'
      }
    ],
    facts: [
      { id: 'NP-F01', key: 'Standard Subscription', approvedValue: '₹999', unit: '/month', context: 'Standard business tier with up to 100k API calls' },
      { id: 'NP-F02', key: 'Platform SLA', approvedValue: '99.99%', context: 'Guaranteed uptime SLA backed by enterprise contract' }
    ],
    prohibitedTerms: [
      { term: 'risk-free profits', category: 'Regulatory', explanation: 'Guarantees of profit violate financial regulations.', suggestedAlternative: 'predictable cash flow and transparent fees', severity: 'critical' },
      { term: 'guaranteed returns', category: 'Regulatory', explanation: 'Financial products cannot guarantee trading returns.', suggestedAlternative: 'reliable transaction reconciliation', severity: 'critical' },
      { term: '100% loss-proof', category: 'Regulatory', explanation: 'Sensational claim prohibited by advertising standards.', suggestedAlternative: 'robust fraud monitoring and enterprise risk controls', severity: 'critical' },
      { term: 'instant riches', category: 'Tone', explanation: 'Consumer get-rich terminology degrades enterprise trust.', suggestedAlternative: 'accelerated merchant revenue cycles', severity: 'warning' }
    ],
    approvedTerms: [
      { term: 'NovaPay', context: 'Official company and product brand name' },
      { term: 'Payment Orchestration', context: 'Core functional descriptor' }
    ],
    requiredDisclaimers: [
      {
        triggerKeyword: 'settlement',
        disclaimerText: 'Settlement times are subject to banking hours and compliance verification.',
        reason: 'Statutory disclaimer for payment processing'
      }
    ]
  }
};

export const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
  {
    id: 'aerosip-canonical-prddemo',
    brandId: 'aerosip',
    title: 'PRD Canonical Demo (AeroSip)',
    badge: 'Canonical PRD Test',
    campaign: 'Product Launch Summer',
    contentType: 'Advertisement',
    text: 'Discover Aero Sip for just ₹899. Keeps drinks cold for 48 hours!',
    expectedIssuesDescription: '1. "Aero Sip" violates approved name "AeroSip". 2. "₹899" conflicts with approved price ₹999. 3. "Keeps drinks cold for 48 hours" flagged as unverified performance claim (not automatically false).'
  },
  {
    id: 'aerosip-medical-blast',
    brandId: 'aerosip',
    title: 'AeroSip HealthTech Violation',
    badge: 'Regulatory Risk',
    campaign: 'Summer Hydration Kickoff',
    contentType: 'Social Ad Copy',
    text: 'The revolutionary Aero Sip bottle cures dehydration migraines and guarantees weight loss! Order your smart vessel today for only ₹2,499.',
    expectedIssuesDescription: 'Flags name spacing, prohibited medical cure claim, prohibited metabolic claim, and below-MAP pricing.'
  },
  {
    id: 'aerosip-compliant-post',
    brandId: 'aerosip',
    title: 'AeroSip 100% Compliant Draft',
    badge: '100% Compliant',
    campaign: 'Wellness Editorial',
    contentType: 'Website/Product page',
    text: 'Discover AeroSip for just ₹999. Keeps drinks cold for 24 hours with precision thermal vacuum insulation.',
    expectedIssuesDescription: 'Demonstrates green "No issues detected by checks that ran" state.'
  },
  {
    id: 'novapay-codex-deck',
    brandId: 'novapay',
    title: 'NovaPay Codex 48 Deck Demo',
    badge: 'Fintech Violation',
    campaign: 'Q4 Festive Merchant Growth',
    contentType: 'Social Ad Copy',
    text: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month and scale your payment processing effortlessly!',
    expectedIssuesDescription: 'Flags "Nova Pay" spacing, "₹499/month" pricing conflict vs ₹999, and "risk-free profits" banned regulatory claim.'
  },
  {
    id: 'novapay-compliant',
    brandId: 'novapay',
    title: 'NovaPay Verified Compliant',
    badge: '100% Compliant',
    campaign: 'Product Update Q4',
    contentType: 'Email',
    text: 'NovaPay delivers resilient payment orchestration for modern high-growth merchants. With a verified 99.99% SLA and transparent pricing at ₹999/month, explore our merchant portal today.',
    expectedIssuesDescription: 'Zero violations detected.'
  }
];

export const INITIAL_RECURRING_PATTERNS: RecurringPattern[] = [
  {
    id: 'pat-001',
    brandId: 'aerosip',
    category: 'Terminology',
    ruleCitation: 'AeroSip Identity Manual 2026, Rule 1.1',
    ruleId: 'AS-G01',
    conflictSummary: 'Unapproved brand name spacing ("Aero Sip" instead of "AeroSip")',
    occurrenceCount: 5,
    distinctDraftCount: 3,
    creatorsInvolved: ['Liam O. (Social)', 'Maya K. (Agency)', 'Rohan S. (Copy)'],
    campaignsInvolved: ['Product Launch Summer', 'Wellness Editorial', 'Athlete Collab'],
    firstSeen: '2026-10-18',
    lastSeen: '2026-10-25',
    status: 'alert_active',
    rootCause: 'unclear_rule',
    rootCauseNotes: 'External creative agencies received legacy slide deck with space in logo text.',
    correctiveActionTaken: 'Reissued Vector Brand Kit v3.1 with automated pre-submission hook.'
  },
  {
    id: 'pat-002',
    brandId: 'aerosip',
    category: 'Pricing & Facts',
    ruleCitation: 'Commercial Price Schedule 2026, Section 2',
    ruleId: 'AS-G02',
    conflictSummary: 'Launch offer quoted at ₹899 instead of approved ₹999 promotional rate',
    occurrenceCount: 4,
    distinctDraftCount: 2,
    creatorsInvolved: ['Performance Marketing Team', 'Influencer Briefing'],
    campaignsInvolved: ['Product Launch Summer', 'Flash Sale Test'],
    firstSeen: '2026-10-20',
    lastSeen: '2026-10-25',
    status: 'investigating',
    rootCause: 'outdated_reference',
    rootCauseNotes: 'Marketing agency was referencing obsolete draft proposal rate.'
  },
  {
    id: 'pat-003',
    brandId: 'novapay',
    category: 'Terminology',
    ruleCitation: 'Brand Guidelines 2026 Q3, Rule 1.1 (Brand Identity)',
    ruleId: 'NP-G01',
    conflictSummary: 'Unapproved brand name spacing ("Nova Pay" instead of "NovaPay")',
    occurrenceCount: 6,
    distinctDraftCount: 3,
    creatorsInvolved: ['Sarah K. (Agency)', 'Alex Chen (Growth)'],
    campaignsInvolved: ['Q4 Festive Merchant Growth', 'Holiday Promo 2026'],
    firstSeen: '2026-10-12',
    lastSeen: '2026-10-24',
    status: 'alert_active',
    rootCause: 'unclear_rule',
    rootCauseNotes: 'Briefing deck slide had non-standard wordmark lockup.',
    correctiveActionTaken: 'Reissued updated Vector Brand Kit v3.0.'
  }
];
