import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import mammoth from 'mammoth';
import {
  BRANDS,
  INITIAL_AUDIT_HISTORY,
  DEFAULT_RECURRENCE_CONFIG
} from './src/data/mockBrands.ts';
import {
  AuditFinding,
  AuditReport,
  BrandProfile,
  BrandRule,
  RecurringPattern,
  RecurrenceThresholdConfig,
  ReviewStatusOutcome,
  DraftVersion,
  DecisionStatus,
  ContentApprovalStatus,
  AffectedDraftRef
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));

// Persistent JSON Store Path so state survives reloads & server restarts
const DATA_FILE_PATH = path.resolve(__dirname, '.skynex-persistent-store.json');

interface SavedInvestigation {
  status: 'monitoring' | 'alert_active' | 'investigating' | 'resolved';
  rootCause?: 'unclear_guidelines' | 'outdated_approved_info' | 'training_need';
  rootCauseNotes?: string;
  correctiveActionTaken?: string;
  investigatedBy?: string;
  actionDate?: string;
}

interface PersistentState {
  brands: Record<string, BrandProfile>;
  auditHistory: AuditReport[];
  investigations: Record<string, SavedInvestigation>;
  recurrenceConfig: RecurrenceThresholdConfig;
}

function getInitialState(): PersistentState {
  return {
    brands: JSON.parse(JSON.stringify(BRANDS)),
    auditHistory: JSON.parse(JSON.stringify(INITIAL_AUDIT_HISTORY)),
    investigations: {},
    recurrenceConfig: { ...DEFAULT_RECURRENCE_CONFIG }
  };
}

function loadPersistentState(): PersistentState {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.brands && Array.isArray(parsed.auditHistory)) {
        return {
          brands: parsed.brands,
          auditHistory: parsed.auditHistory,
          investigations: parsed.investigations || {},
          recurrenceConfig: parsed.recurrenceConfig || { ...DEFAULT_RECURRENCE_CONFIG }
        };
      }
    }
  } catch (err) {
    console.warn('[SkyNex AI] Could not load persistent state from disk, using canonical defaults:', err);
  }
  return getInitialState();
}

function savePersistentState(state: PersistentState) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[SkyNex AI] Failed to write persistent state to disk:', err);
  }
}

let store: PersistentState = loadPersistentState();
savePersistentState(store);

// Gemini Client initialization (Server-side only with required User-Agent header)
let genAiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 1. DETERMINISTIC RULES ENGINE
// Strictly evaluates ONLY rules where status === 'Approved'
// ---------------------------------------------------------------------------
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function runDeterministicAudit(brand: BrandProfile, draftText: string): {
  findings: AuditFinding[];
  approvedRulesCount: number;
} {
  // CRITICAL REQUIREMENT: Only Approved rules may be treated as authoritative.
  // Draft or unverified rules must NEVER silently become approved information.
  const approvedRules = brand.rules.filter(r => r.status === 'Approved');
  const rawFindings: AuditFinding[] = [];

  for (const rule of approvedRules) {
    // 1. Check explicit targetPatterns defined on the rule (longest patterns first to prevent partial overlap)
    const sortedPatterns = [...rule.targetPatterns]
      .map(p => p.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    for (const pattern of sortedPatterns) {
      const escaped = escapeRegExp(pattern);
      // Use boundary-aware regex if pattern starts/ends with word chars, otherwise substring regex
      const startsWithWord = /^\w/.test(pattern);
      const endsWithWord = /\w$/.test(pattern);
      const regexStr = `${startsWithWord ? '\\b' : ''}${escaped}${endsWithWord ? '\\b' : ''}`;
      const regex = new RegExp(regexStr, 'gi');

      let match: RegExpExecArray | null;
      while ((match = regex.exec(draftText)) !== null) {
        const matchedText = match[0];
        // If it's a Terminology rule and the matched text is already identical in case/spelling to approvedValue, skip
        if (rule.category === 'Terminology' && matchedText === rule.approvedValue) {
          continue;
        }

        const startIndex = match.index;
        const endIndex = startIndex + matchedText.length;

        // Check if this span overlaps an existing finding for the same rule or another deterministic match
        const overlaps = rawFindings.some(
          existing => !(endIndex <= existing.startIndex || startIndex >= existing.endIndex)
        );
        if (overlaps) continue;

        let conflictLabel = `Conflicts with approved rule "${rule.title}"`;
        if (rule.category === 'Terminology') {
          conflictLabel = `Terminology conflict: "${matchedText}" differs from the approved product name "${rule.approvedValue}".`;
        } else if (rule.category === 'Pricing & Facts') {
          conflictLabel = `Price conflict: "${matchedText}" conflicts with the approved price of ${rule.approvedValue}.`;
        } else if (rule.category === 'Prohibited Claim') {
          conflictLabel = `Prohibited claim: "${matchedText}" conflicts with the explicitly prohibited rule.`;
        } else if (rule.category === 'Performance & Claims') {
          conflictLabel = `Unsupported claim: "${matchedText}" lacks approved supporting evidence and requires human verification.`;
        } else {
          conflictLabel = `Tone & style suggestion: "${matchedText}" departs from "${rule.title}".`;
        }

        rawFindings.push({
          id: `det-${rule.id}-${startIndex}-${rawFindings.length + 1}`,
          classification: rule.classification,
          category: rule.category,
          severity: rule.severity,
          originalSpan: matchedText,
          startIndex,
          endIndex,
          conflictText: conflictLabel,
          ruleId: rule.id,
          ruleTitle: rule.title,
          approvedRuleCitation: rule.sourceRef,
          sourceReference: rule.sourceRef,
          explanation: rule.explanation,
          suggestedReplacement: rule.approvedValue,
          requiresHumanReview:
            rule.classification === 'unsupported_claim' ||
            rule.classification === 'needs_human_verification',
          engine: 'deterministic',
          decision: 'pending',
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. Smart Structured Price & Fact Check for any Pricing & Facts rule
    // Detects novel wrong prices (e.g. ₹399/month, ₹599 per month, $59/mo) even if not listed in targetPatterns
    if (rule.category === 'Pricing & Facts') {
      const approvedNumMatch = rule.approvedValue.match(/(\d[\d,]*)/);
      const approvedNumber = approvedNumMatch ? parseInt(approvedNumMatch[1].replace(/,/g, ''), 10) : null;

      if (approvedNumber !== null) {
        const priceRegex = /(?:₹|INR\s*|Rs\.?\s*|\$)(\d[\d,]*)(?:\s*(?:\/\s*(?:month|mo)|per\s+month))?/gi;
        let pMatch: RegExpExecArray | null;
        while ((pMatch = priceRegex.exec(draftText)) !== null) {
          const matchedSpan = pMatch[0];
          const foundNum = parseInt(pMatch[1].replace(/,/g, ''), 10);
          const startIndex = pMatch.index;
          const endIndex = startIndex + matchedSpan.length;

          if (foundNum !== approvedNumber) {
            const overlaps = rawFindings.some(
              existing => !(endIndex <= existing.startIndex || startIndex >= existing.endIndex)
            );
            if (!overlaps) {
              rawFindings.push({
                id: `det-price-${rule.id}-${startIndex}-${rawFindings.length + 1}`,
                classification: 'approved_fact_conflict',
                category: 'Pricing & Facts',
                severity: 'critical',
                originalSpan: matchedSpan,
                startIndex,
                endIndex,
                conflictText: `Price conflict: "${matchedSpan}" conflicts with the approved price of ${rule.approvedValue}.`,
                ruleId: rule.id,
                ruleTitle: rule.title,
                approvedRuleCitation: rule.sourceRef,
                sourceReference: rule.sourceRef,
                explanation: rule.explanation,
                suggestedReplacement: rule.approvedValue,
                requiresHumanReview: false,
                engine: 'deterministic',
                decision: 'pending',
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
    }

    // 3. Smart Unverified Cold-Retention Hours Check for AeroSip (AS-RULE-03)
    if (rule.id === 'AS-RULE-03') {
      const hoursRegex = /\b(?:keeps?\s+drinks?\s+cold\s+for\s+(\d+)\s*hours?|cold\s+for\s+(\d+)\s*hours?)\b/gi;
      let hMatch: RegExpExecArray | null;
      while ((hMatch = hoursRegex.exec(draftText)) !== null) {
        const hours = parseInt(hMatch[1] || hMatch[2], 10);
        if (hours > 24) {
          const matchedSpan = hMatch[0];
          const startIndex = hMatch.index;
          const endIndex = startIndex + matchedSpan.length;
          const overlaps = rawFindings.some(
            existing => !(endIndex <= existing.startIndex || startIndex >= existing.endIndex)
          );
          if (!overlaps) {
            rawFindings.push({
              id: `det-claim-${rule.id}-${startIndex}-${rawFindings.length + 1}`,
              classification: 'unsupported_claim',
              category: 'Performance & Claims',
              severity: 'warning',
              originalSpan: matchedSpan,
              startIndex,
              endIndex,
              conflictText: `Unsupported claim: "${matchedSpan}" exceeds certified 24-hour specification and requires human verification.`,
              ruleId: rule.id,
              ruleTitle: rule.title,
              approvedRuleCitation: rule.sourceRef,
              sourceReference: rule.sourceRef,
              explanation: `${rule.explanation} (Stated ${hours} hours vs certified 24 hours; missing supporting evidence does not automatically prove the claim is false, but requires human verification).`,
              suggestedReplacement: rule.approvedValue,
              requiresHumanReview: true,
              engine: 'deterministic',
              decision: 'pending',
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
  }

  // Sort findings by appearance order in the text
  rawFindings.sort((a, b) => a.startIndex - b.startIndex);

  return {
    findings: rawFindings,
    approvedRulesCount: approvedRules.length
  };
}

// ---------------------------------------------------------------------------
// 2. AI-ASSISTED CONTEXTUAL REVIEW ENGINE (Zod-Validated & Rule-Verified)
// ---------------------------------------------------------------------------
const GeminiContextualIssueSchema = z.object({
  matchedSpan: z.string(),
  classification: z.enum(['unsupported_claim', 'style_tone_suggestion', 'needs_human_verification']).optional(),
  category: z.string().optional(),
  ruleId: z.string().optional(),
  explanation: z.string(),
  suggestedReplacement: z.string().optional(),
  requiresHumanReview: z.boolean().optional()
});

const GeminiResponseSchema = z.object({
  toneSummary: z.string(),
  contextualIssues: z.array(GeminiContextualIssueSchema)
});

interface GeminiAuditResult {
  additionalFindings: AuditFinding[];
  toneSummary: string;
  success: boolean;
  errorMsg?: string;
}

async function runGeminiContextualAudit(
  brand: BrandProfile,
  draftText: string,
  deterministicFindings: AuditFinding[],
  simulateAiUnavailable = false
): Promise<GeminiAuditResult> {
  if (simulateAiUnavailable) {
    return {
      additionalFindings: [],
      toneSummary: 'Contextual AI service was unavailable (simulated outage). Deterministic checks ran completely; contextual review is marked incomplete.',
      success: false,
      errorMsg: 'AI service unavailable — contextual review marked incomplete while deterministic checks succeeded.'
    };
  }

  if (!genAiClient) {
    return {
      additionalFindings: [],
      toneSummary: 'Gemini API key not configured on server. Deterministic rules evaluated; contextual AI review marked incomplete.',
      success: false,
      errorMsg: 'Contextual AI service not configured; deterministic checks completed.'
    };
  }

  // Only pass Approved rules to the AI so it never uses Draft or Unverified rules
  const approvedRules = brand.rules.filter(r => r.status === 'Approved');
  const approvedRuleMap = new Map<string, BrandRule>(approvedRules.map(r => [r.id, r]));

  try {
    const prompt = `You are SkyNex AI, an enterprise brand-governance contextual reviewer for the brand "${brand.name}" (${brand.industry}).
Your job is to review the submitted draft ONLY against the APPROVED brand rules listed below.

APPROVED BRAND RULES (Authoritative Knowledge Base):
${approvedRules
  .map(
    r =>
      `- Rule ID: ${r.id} | Category: ${r.category} | Title: ${r.title}\n  Statement: ${r.ruleStatement}\n  Approved Value: "${r.approvedValue}"\n  Source Reference: ${r.sourceRef}`
  )
  .join('\n')}

DETERMINISTIC FINDINGS ALREADY DETECTED (DO NOT DUPLICATE THESE SPANS):
${
  deterministicFindings.length > 0
    ? deterministicFindings.map(d => `- Span "${d.originalSpan}" flagged under ${d.ruleId}: ${d.conflictText}`).join('\n')
    : 'None'
}

SUBMITTED DRAFT TO REVIEW:
"""
${draftText}
"""

STRICT INSTRUCTIONS:
1. NEVER invent approved facts, supporting evidence, source citations, or rule IDs. Every ruleId you cite MUST be one of: ${approvedRules.map(r => r.id).join(', ')}.
2. Do NOT duplicate any span already listed in DETERMINISTIC FINDINGS ALREADY DETECTED.
3. Look ONLY for additional contextual issues in the draft (such as unsupported promotional/performance claims that require supporting evidence, or clear tone/messaging conflicts) that were missed by exact keyword matching.
4. Remember: A missing supporting source does not automatically prove a claim is false; classify unsupported promotional claims as "unsupported_claim" with requiresHumanReview: true.
5. If all issues in the draft are already covered by the deterministic findings (or if the draft is clean), return an empty array [] for contextualIssues.
6. Provide a concise 1-sentence toneSummary evaluating the draft's overall tone and brand alignment.`;

    const callGeminiWithTimeout = async (modelName: string) => {
      const aiPromise = genAiClient.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              toneSummary: { type: Type.STRING },
              contextualIssues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    matchedSpan: { type: Type.STRING },
                    classification: { type: Type.STRING },
                    category: { type: Type.STRING },
                    ruleId: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    suggestedReplacement: { type: Type.STRING },
                    requiresHumanReview: { type: Type.BOOLEAN }
                  },
                  required: ['matchedSpan', 'explanation']
                }
              }
            },
            required: ['toneSummary', 'contextualIssues']
          }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Contextual AI review timed out (8s limit on ${modelName})`));
        }, 8000);
        if (typeof timer.unref === 'function') timer.unref();
      });

      return await Promise.race([aiPromise, timeoutPromise]);
    };

    let response: any;
    try {
      response = await callGeminiWithTimeout('gemini-3.8-flash');
    } catch (primaryErr: any) {
      console.warn('[SkyNex AI] gemini-3.8-flash unavailable, attempting gemini-3.1-flash-lite fallback:', primaryErr?.message || primaryErr);
      response = await callGeminiWithTimeout('gemini-3.1-flash-lite');
    }

    const rawJson = JSON.parse(response.text || '{}');
    const validated = GeminiResponseSchema.safeParse(rawJson);

    if (!validated.success) {
      return {
        additionalFindings: [],
        toneSummary: 'Contextual AI response failed schema validation; deterministic checks completed.',
        success: false,
        errorMsg: 'Contextual AI response validation failed.'
      };
    }

    const additionalFindings: AuditFinding[] = [];
    for (const issue of validated.data.contextualIssues) {
      const span = issue.matchedSpan?.trim();
      if (!span) continue;

      // Verify the span actually exists in draftText (never allow hallucinated excerpts)
      const startIndex = draftText.indexOf(span);
      if (startIndex === -1) continue;
      const endIndex = startIndex + span.length;

      // Deduplicate against deterministic findings and previous contextual findings
      const overlaps = [...deterministicFindings, ...additionalFindings].some(
        existing =>
          existing.originalSpan.toLowerCase() === span.toLowerCase() ||
          !(endIndex <= existing.startIndex || startIndex >= existing.endIndex)
      );
      if (overlaps) continue;

      // Confirm that the cited ruleId exists in the approved knowledge base!
      const verifiedRule = issue.ruleId ? approvedRuleMap.get(issue.ruleId) : undefined;
      const fallbackRule =
        verifiedRule ||
        approvedRules.find(r => r.category === 'Performance & Claims') ||
        approvedRules.find(r => r.category === 'Tone & Style') ||
        approvedRules[0];

      const isUnsupported =
        issue.classification === 'unsupported_claim' ||
        issue.classification === 'needs_human_verification' ||
        Boolean(issue.requiresHumanReview);

      additionalFindings.push({
        id: `ai-${Date.now()}-${additionalFindings.length + 1}`,
        classification: isUnsupported ? 'unsupported_claim' : 'style_tone_suggestion',
        category: verifiedRule?.category || issue.category || 'Performance & Claims',
        severity: isUnsupported ? 'warning' : 'info',
        originalSpan: span,
        startIndex,
        endIndex,
        conflictText: isUnsupported
          ? `Contextual claim check: "${span}" lacks approved supporting evidence and requires human verification.`
          : `Contextual tone & messaging suggestion for "${span}"`,
        ruleId: verifiedRule ? verifiedRule.id : fallbackRule?.id,
        ruleTitle: verifiedRule ? verifiedRule.title : fallbackRule?.title,
        approvedRuleCitation: verifiedRule
          ? verifiedRule.sourceRef
          : fallbackRule?.sourceRef || 'Approved Brand Knowledge Base',
        sourceReference: verifiedRule ? verifiedRule.sourceRef : fallbackRule?.sourceRef,
        explanation: issue.explanation,
        suggestedReplacement: issue.suggestedReplacement || verifiedRule?.approvedValue || undefined,
        requiresHumanReview: isUnsupported,
        engine: 'gemini',
        decision: 'pending',
        timestamp: new Date().toISOString()
      });
    }

    return {
      additionalFindings,
      toneSummary: validated.data.toneSummary,
      success: true
    };
  } catch (err: any) {
    console.error('[SkyNex AI] Gemini contextual review error:', err);
    return {
      additionalFindings: [],
      toneSummary: 'Contextual AI service encountered an error. Deterministic rule checks completed reliably; contextual review is marked incomplete.',
      success: false,
      errorMsg: err?.message || 'External AI service unavailable'
    };
  }
}

// ---------------------------------------------------------------------------
// 3. RECURRING ISSUES ENGINE (Rule-ID Matched, Configurable 7-Day Window)
// ---------------------------------------------------------------------------
function computeRecurringPatterns(): RecurringPattern[] {
  const { minOccurrences, minDistinctDrafts, windowDays } = store.recurrenceConfig;
  const cutoffMs = Date.now() - windowDays * 24 * 60 * 60 * 1000;

  // Group deterministic findings by (brandId + ruleId) within the time window.
  // Requirement: "Deterministic findings can be matched using the same approved rule identifier.
  // Contextual findings should not be grouped merely because their categories are similar."
  const ruleGroups = new Map<
    string,
    {
      brandId: string;
      brandName: string;
      ruleId: string;
      ruleTitle: string;
      category: string;
      ruleCitation: string;
      conflictSummary: string;
      occurrences: number;
      draftMap: Map<string, AffectedDraftRef>;
      channels: Set<string>;
      firstSeen: string;
      lastSeen: string;
    }
  >();

  // Walk history from oldest to newest
  const chronological = [...store.auditHistory].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const report of chronological) {
    const reportTime = new Date(report.createdAt).getTime();
    if (reportTime < cutoffMs) continue;

    for (const finding of report.findings) {
      // Only group deterministic findings with a verified approved ruleId
      if (finding.engine !== 'deterministic' || !finding.ruleId) continue;

      const key = `${report.brandId}::${finding.ruleId}`;
      const existing = ruleGroups.get(key);
      const dateStr = report.createdAt.split('T')[0];

      // Look up canonical rule title if available
      const brandObj = store.brands[report.brandId];
      const canonicalRule = brandObj?.rules.find(r => r.id === finding.ruleId);

      if (!existing) {
        const draftMap = new Map<string, AffectedDraftRef>();
        draftMap.set(report.id, {
          reportId: report.id,
          title: report.title,
          contentType: report.contentType,
          submittedAt: report.createdAt,
          matchedSpan: finding.originalSpan
        });

        ruleGroups.set(key, {
          brandId: report.brandId,
          brandName: report.brandName || brandObj?.name || report.brandId,
          ruleId: finding.ruleId,
          ruleTitle: canonicalRule?.title || finding.ruleTitle || finding.ruleId,
          category: canonicalRule?.category || finding.category,
          ruleCitation: canonicalRule?.sourceRef || finding.approvedRuleCitation,
          conflictSummary: finding.conflictText,
          occurrences: 1,
          draftMap,
          channels: new Set([report.contentType]),
          firstSeen: dateStr,
          lastSeen: dateStr
        });
      } else {
        existing.occurrences += 1;
        existing.lastSeen = dateStr;
        existing.channels.add(report.contentType);
        if (!existing.draftMap.has(report.id)) {
          existing.draftMap.set(report.id, {
            reportId: report.id,
            title: report.title,
            contentType: report.contentType,
            submittedAt: report.createdAt,
            matchedSpan: finding.originalSpan
          });
        }
      }
    }
  }

  const results: RecurringPattern[] = [];
  for (const [key, group] of ruleGroups.entries()) {
    const distinctDraftCount = group.draftMap.size;
    const thresholdTriggered =
      group.occurrences >= minOccurrences && distinctDraftCount >= minDistinctDrafts;

    const savedInv = store.investigations[key];
    let status: RecurringPattern['status'] = thresholdTriggered ? 'alert_active' : 'monitoring';
    if (savedInv?.status && (savedInv.status === 'investigating' || savedInv.status === 'resolved')) {
      status = savedInv.status;
    }

    results.push({
      id: key,
      brandId: group.brandId as any,
      brandName: group.brandName,
      category: group.category,
      ruleId: group.ruleId,
      ruleTitle: group.ruleTitle,
      ruleCitation: group.ruleCitation,
      conflictSummary: group.conflictSummary,
      occurrenceCount: group.occurrences,
      distinctDraftCount,
      affectedDrafts: Array.from(group.draftMap.values()).reverse(),
      affectedChannels: Array.from(group.channels),
      firstSeen: group.firstSeen,
      lastSeen: group.lastSeen,
      thresholdTriggered,
      status,
      rootCause: savedInv?.rootCause,
      rootCauseNotes: savedInv?.rootCauseNotes,
      correctiveActionTaken: savedInv?.correctiveActionTaken,
      investigatedBy: savedInv?.investigatedBy,
      actionDate: savedInv?.actionDate
    });
  }

  // Sort triggered alerts first, then by occurrence count descending
  results.sort((a, b) => {
    if (a.thresholdTriggered !== b.thresholdTriggered) {
      return a.thresholdTriggered ? -1 : 1;
    }
    return b.occurrenceCount - a.occurrenceCount;
  });

  return results;
}

// ---------------------------------------------------------------------------
// 4. API ENDPOINTS
// ---------------------------------------------------------------------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(genAiClient),
    timestamp: new Date().toISOString()
  });
});

// Unified state loader for frontend initialization & reload persistence
app.get('/api/state', (_req: Request, res: Response) => {
  const recurringPatterns = computeRecurringPatterns();
  res.json({
    brands: store.brands,
    auditHistory: store.auditHistory,
    recurringPatterns,
    recurrenceConfig: store.recurrenceConfig,
    geminiAvailable: Boolean(genAiClient)
  });
});

// Create a Brand Rule
app.post('/api/brands/:brandId/rules', (req: Request, res: Response) => {
  const { brandId } = req.params;
  const brand = store.brands[brandId];
  if (!brand) {
    return res.status(404).json({ error: `Brand profile "${brandId}" not found.` });
  }

  const {
    title,
    category,
    ruleStatement,
    targetPatterns,
    approvedValue,
    sourceRef,
    status,
    classification,
    severity,
    explanation
  } = req.body;

  if (!title?.trim() || !approvedValue?.trim()) {
    return res.status(400).json({ error: 'Rule title and approved content/value are required.' });
  }

  const prefix = brandId === 'novapay' ? 'NP' : brandId === 'aerosip' ? 'AS' : 'SN';
  const nextNum = brand.rules.length + 1;
  const ruleId = `${prefix}-RULE-${String(nextNum).padStart(2, '0')}`;

  const parsedPatterns: string[] = Array.isArray(targetPatterns)
    ? targetPatterns.map((p: string) => p.trim()).filter(Boolean)
    : typeof targetPatterns === 'string'
    ? targetPatterns
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
    : [];

  const newRule: BrandRule = {
    id: ruleId,
    brandId: brand.id,
    category: category || 'Terminology',
    title: title.trim(),
    ruleStatement: ruleStatement?.trim() || `Enforce "${approvedValue.trim()}" instead of ${parsedPatterns.join(', ') || 'unapproved variants'}.`,
    targetPatterns: parsedPatterns,
    approvedValue: approvedValue.trim(),
    sourceRef: sourceRef?.trim() || `${brand.name} Governance Standard 2026`,
    status: status === 'Approved' ? 'Approved' : status === 'Unverified' ? 'Unverified' : 'Draft',
    classification:
      classification ||
      (category === 'Pricing & Facts'
        ? 'approved_fact_conflict'
        : category === 'Prohibited Claim'
        ? 'prohibited_claim'
        : category === 'Performance & Claims'
        ? 'unsupported_claim'
        : category === 'Tone & Style'
        ? 'style_tone_suggestion'
        : 'confirmed_rule_conflict'),
    severity: severity || 'critical',
    explanation:
      explanation?.trim() ||
      `Flagged under ${ruleId} (${title.trim()}). Approved value is "${approvedValue.trim()}".`,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  brand.rules.unshift(newRule);
  savePersistentState(store);

  res.json({
    success: true,
    rule: newRule,
    brand
  });
});

// Update / Edit or Change Approval Status of an existing Brand Rule
app.put('/api/brands/:brandId/rules/:ruleId', (req: Request, res: Response) => {
  const { brandId, ruleId } = req.params;
  const brand = store.brands[brandId];
  if (!brand) {
    return res.status(404).json({ error: `Brand profile "${brandId}" not found.` });
  }

  const ruleIndex = brand.rules.findIndex(r => r.id === ruleId);
  if (ruleIndex === -1) {
    return res.status(404).json({ error: `Rule "${ruleId}" not found.` });
  }

  const existing = brand.rules[ruleIndex];
  const {
    title,
    category,
    ruleStatement,
    targetPatterns,
    approvedValue,
    sourceRef,
    status,
    classification,
    severity,
    explanation
  } = req.body;

  const parsedPatterns: string[] =
    targetPatterns !== undefined
      ? Array.isArray(targetPatterns)
        ? targetPatterns.map((p: string) => p.trim()).filter(Boolean)
        : String(targetPatterns)
            .split(',')
            .map(p => p.trim())
            .filter(Boolean)
      : existing.targetPatterns;

  const updatedRule: BrandRule = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    category: category !== undefined ? category : existing.category,
    ruleStatement: ruleStatement !== undefined ? ruleStatement.trim() : existing.ruleStatement,
    targetPatterns: parsedPatterns,
    approvedValue: approvedValue !== undefined ? approvedValue.trim() : existing.approvedValue,
    sourceRef: sourceRef !== undefined ? sourceRef.trim() : existing.sourceRef,
    status: status !== undefined ? status : existing.status,
    classification: classification !== undefined ? classification : existing.classification,
    severity: severity !== undefined ? severity : existing.severity,
    explanation: explanation !== undefined ? explanation.trim() : existing.explanation,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  brand.rules[ruleIndex] = updatedRule;
  savePersistentState(store);

  res.json({
    success: true,
    rule: updatedRule,
    brand
  });
});

// Delete a Brand Rule
app.delete('/api/brands/:brandId/rules/:ruleId', (req: Request, res: Response) => {
  const { brandId, ruleId } = req.params;
  const brand = store.brands[brandId];
  if (!brand) {
    return res.status(404).json({ error: `Brand profile "${brandId}" not found.` });
  }

  brand.rules = brand.rules.filter(r => r.id !== ruleId);
  savePersistentState(store);

  res.json({
    success: true,
    brand
  });
});

// Document Text Extraction (.txt, .md, .docx, .pdf)
app.post('/api/extract-text', async (req: Request, res: Response) => {
  try {
    const { filename, base64Content } = req.body;
    if (!filename || !base64Content) {
      return res.status(400).json({
        error: 'Both filename and file content are required. Please select a valid file or paste text directly.'
      });
    }

    const buffer = Buffer.from(base64Content, 'base64');
    const fileSizeMB = buffer.length / (1024 * 1024);
    if (fileSizeMB > 10) {
      return res.status(400).json({
        error: `File size (${fileSizeMB.toFixed(1)} MB) exceeds the 10 MB limit. Please upload a smaller file or paste the text directly.`
      });
    }

    const ext = path.extname(filename).toLowerCase();
    let extractedText = '';

    if (ext === '.txt' || ext === '.md') {
      extractedText = buffer.toString('utf-8');
    } else if (ext === '.docx') {
      const docxResult = await mammoth.extractRawText({ buffer });
      extractedText = docxResult.value;
    } else if (ext === '.pdf') {
      try {
        const pdfModule = await import('pdf-parse');
        const pdfFunc = (pdfModule as any).default || pdfModule;
        const pdfData = await pdfFunc(buffer);
        extractedText = pdfData.text;
      } catch (pdfErr: any) {
        return res.status(422).json({
          error: `Could not extract text from PDF "${filename}" (${pdfErr?.message || 'unreadable PDF structure'}). Please paste your text directly into the editor.`
        });
      }
    } else {
      return res.status(400).json({
        error: `Unsupported file format "${ext || 'unknown'}". SkyNex AI supports text extraction from .txt, .md, .docx, and text-based .pdf files. Please use the Paste Text editor instead.`
      });
    }

    const cleanText = extractedText.trim();
    if (!cleanText) {
      return res.status(422).json({
        error: `No extractable text was found inside "${filename}" (it may be an empty file or a scanned image without text). Please paste your text directly into the editor.`
      });
    }

    res.json({
      success: true,
      filename,
      extractedText: cleanText,
      charCount: cleanText.length,
      wordCount: cleanText.split(/\s+/).filter(Boolean).length
    });
  } catch (err: any) {
    console.error('[SkyNex AI] Document extraction error:', err);
    res.status(500).json({
      error: `Document extraction failed: ${err?.message || 'Unreadable file'}. Please paste your text directly into the editor.`
    });
  }
});

// Main Review & Audit Endpoint
app.post('/api/audit', async (req: Request, res: Response) => {
  const {
    brandId,
    draftText,
    contentType = 'Advertisement',
    title = 'Submitted Content Draft',
    sourceFilename,
    enableGemini = true,
    simulateAiFailure = false,
    submittedBy = 'Marcus Vance',
    submittedByRole = 'Brand Governance Lead',
    submittedByRoleKey = 'brand_manager'
  } = req.body;

  if (!draftText || !String(draftText).trim()) {
    return res.status(400).json({ error: 'Draft content cannot be empty. Please enter or upload text to review.' });
  }

  const brand = store.brands[brandId];
  if (!brand) {
    return res.status(404).json({ error: `Brand profile "${brandId}" not found.` });
  }

  const cleanDraft = String(draftText);

  // Step 1: Run Deterministic Rules Engine against ONLY Approved rules
  const { findings: deterministicFindings, approvedRulesCount } = runDeterministicAudit(brand, cleanDraft);

  // Step 2: Run AI-Assisted Contextual Review if enabled
  let geminiResult: GeminiAuditResult = {
    additionalFindings: [],
    toneSummary: 'Contextual AI check was disabled by user. Deterministic checks ran against all approved rules.',
    success: false,
    errorMsg: undefined
  };

  if (enableGemini) {
    geminiResult = await runGeminiContextualAudit(
      brand,
      cleanDraft,
      deterministicFindings,
      Boolean(simulateAiFailure)
    );
  }

  const allFindings = [...deterministicFindings, ...geminiResult.additionalFindings].sort(
    (a, b) => a.startIndex - b.startIndex
  );

  // Determine overall status honestly (Requirement 8: Never use absence of detected issues or AI failure to claim full compliance)
  let overallStatus: ReviewStatusOutcome = 'no_issues_detected';
  if (allFindings.length > 0) {
    const onlyVerificationOrStyle = allFindings.every(
      f =>
        f.classification === 'unsupported_claim' ||
        f.classification === 'needs_human_verification'
    );
    overallStatus = onlyVerificationOrStyle ? 'needs_human_verification' : 'issues_found';
  } else if (enableGemini && !geminiResult.success) {
    overallStatus = 'partial_review_ai_unavailable';
  }

  const reportId = `REV-2026-${Math.floor(104 + store.auditHistory.length + Math.random() * 890)}`;
  const nowIso = new Date().toISOString();

  const initialVersion: DraftVersion = {
    versionNumber: 1,
    contentText: cleanDraft,
    changeSummary: 'Original submitted draft (preserved)',
    createdBy: submittedBy,
    createdByRole: submittedByRole,
    createdAt: nowIso
  };

  const report: AuditReport = {
    id: reportId,
    brandId: brand.id,
    brandName: brand.name,
    campaign: title,
    contentType,
    title,
    sourceFilename,
    originalText: cleanDraft,
    currentText: cleanDraft,
    versions: [initialVersion],
    findings: allFindings,
    toneSummary: geminiResult.toneSummary,
    checksExecuted: {
      deterministic: true,
      deterministicRulesChecked: approvedRulesCount,
      geminiContextual: Boolean(enableGemini),
      geminiSuccess: geminiResult.success,
      geminiError: geminiResult.errorMsg
    },
    overallStatus,
    contentApprovalStatus: 'pending_review',
    submittedBy,
    submittedByRole,
    submittedByRoleKey,
    createdAt: nowIso
  };

  store.auditHistory.unshift(report);
  savePersistentState(store);

  const recurringPatterns = computeRecurringPatterns();

  res.json({
    success: true,
    report,
    recurringPatterns
  });
});

// Human Decision on an Individual Finding (Accept, Edit, Reject, Request Verification, or Revert)
app.post('/api/history/:reportId/decision', (req: Request, res: Response) => {
  const { reportId } = req.params;
  const {
    findingId,
    decision,
    editedReplacement,
    rejectionReason,
    reviewerComment,
    decidedBy = 'Marcus Vance',
    decidedByRole = 'Brand Governance Lead'
  } = req.body;

  const report = store.auditHistory.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: `Review record "${reportId}" could not be found. Saving decision failed.` });
  }

  const finding = report.findings.find(f => f.id === findingId);
  if (!finding) {
    return res.status(404).json({ error: `Finding "${findingId}" not found in review "${reportId}".` });
  }

  finding.decision = decision as DecisionStatus;
  finding.editedReplacement = editedReplacement;
  finding.rejectionReason = rejectionReason;
  finding.reviewerComment = reviewerComment;
  finding.decidedBy = decidedBy;
  finding.decidedAt = new Date().toISOString();

  // Recompute working draft cleanly from originalText by applying all accepted/edited findings in reverse offset order
  // so that originalText is NEVER lost and toggling decisions is 100% deterministic and reversible!
  let workingText = report.originalText;
  const appliedFindings = report.findings
    .filter(f => (f.decision === 'accepted' || f.decision === 'edited') && f.originalSpan)
    .sort((a, b) => b.startIndex - a.startIndex);

  for (const af of appliedFindings) {
    const replacement =
      af.decision === 'edited' && af.editedReplacement !== undefined
        ? af.editedReplacement
        : af.suggestedReplacement || af.originalSpan;

    if (
      af.startIndex >= 0 &&
      af.endIndex <= workingText.length &&
      workingText.slice(af.startIndex, af.endIndex).toLowerCase() === af.originalSpan.toLowerCase()
    ) {
      workingText =
        workingText.slice(0, af.startIndex) + replacement + workingText.slice(af.endIndex);
    } else if (workingText.includes(af.originalSpan)) {
      workingText = workingText.replace(af.originalSpan, replacement);
    }
  }

  report.currentText = workingText;

  // Record a new version in report.versions
  const actionLabel =
    decision === 'accepted'
      ? `Accepted suggestion for "${finding.originalSpan}" → "${finding.suggestedReplacement}"`
      : decision === 'edited'
      ? `Edited suggestion for "${finding.originalSpan}" → "${editedReplacement}"`
      : decision === 'rejected'
      ? `Rejected suggestion for "${finding.originalSpan}" (preserved original wording${rejectionReason ? `: ${rejectionReason}` : ''})`
      : decision === 'verification_requested'
      ? `Requested human verification for "${finding.originalSpan}"`
      : `Reset decision for "${finding.originalSpan}" to pending`;

  report.versions.push({
    versionNumber: report.versions.length + 1,
    contentText: workingText,
    changeSummary: actionLabel,
    createdBy: decidedBy,
    createdByRole: decidedByRole,
    createdAt: new Date().toISOString()
  });

  // Update overall finding resolution status (kept distinct from final content approval!)
  const pendingCount = report.findings.filter(f => f.decision === 'pending').length;
  if (report.findings.length > 0 && pendingCount === 0) {
    report.overallStatus = 'changes_applied';
  } else if (report.findings.length > 0) {
    const onlyVerification = report.findings.every(
      f => f.classification === 'unsupported_claim' || f.classification === 'needs_human_verification'
    );
    report.overallStatus = onlyVerification ? 'needs_human_verification' : 'issues_found';
  }

  savePersistentState(store);

  res.json({
    success: true,
    report
  });
});

// Separate Final Content Approval Decision (Step 5: "The final approval of an entire content item must remain separate from decisions about individual suggestions")
app.post('/api/history/:reportId/approval', (req: Request, res: Response) => {
  const { reportId } = req.params;
  const {
    contentApprovalStatus,
    contentApprovedBy = 'Marcus Vance',
    contentApprovalNotes
  } = req.body;

  const report = store.auditHistory.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: `Review record "${reportId}" not found.` });
  }

  report.contentApprovalStatus = contentApprovalStatus as ContentApprovalStatus;
  report.contentApprovedBy = contentApprovedBy;
  report.contentApprovedAt = new Date().toISOString();
  if (contentApprovalNotes !== undefined) {
    report.contentApprovalNotes = contentApprovalNotes;
  }
  if (contentApprovalStatus === 'approved_for_publication') {
    report.completedAt = new Date().toISOString();
  }

  savePersistentState(store);

  res.json({
    success: true,
    report
  });
});

// Manager Investigation & Corrective Action on Recurring Issue
app.post('/api/clarity-loop/action', (req: Request, res: Response) => {
  const {
    patternId,
    rootCause,
    rootCauseNotes,
    correctiveAction,
    newStatus,
    investigatedBy = 'Marcus Vance'
  } = req.body;

  if (!patternId) {
    return res.status(400).json({ error: 'patternId is required.' });
  }

  store.investigations[patternId] = {
    status: newStatus || 'investigating',
    rootCause,
    rootCauseNotes,
    correctiveActionTaken: correctiveAction,
    investigatedBy,
    actionDate: new Date().toISOString().split('T')[0]
  };

  savePersistentState(store);
  const recurringPatterns = computeRecurringPatterns();

  res.json({
    success: true,
    recurringPatterns
  });
});

// Update Configurable Recurrence Threshold
app.post('/api/clarity-loop/config', (req: Request, res: Response) => {
  const { minOccurrences, minDistinctDrafts, windowDays } = req.body;
  store.recurrenceConfig = {
    minOccurrences: Math.max(1, Number(minOccurrences) || 3),
    minDistinctDrafts: Math.max(1, Number(minDistinctDrafts) || 2),
    windowDays: Math.max(1, Number(windowDays) || 7)
  };
  savePersistentState(store);
  const recurringPatterns = computeRecurringPatterns();

  res.json({
    success: true,
    recurrenceConfig: store.recurrenceConfig,
    recurringPatterns
  });
});

// Reset Demo State to Canonical Seed
app.post('/api/demo/reset', (_req: Request, res: Response) => {
  store = getInitialState();
  savePersistentState(store);
  const recurringPatterns = computeRecurringPatterns();

  res.json({
    success: true,
    brands: store.brands,
    auditHistory: store.auditHistory,
    recurringPatterns,
    recurrenceConfig: store.recurrenceConfig
  });
});

// ---------------------------------------------------------------------------
// Vite Server Integration
// ---------------------------------------------------------------------------
async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkyNex AI] Server running on port ${PORT}`);
  });

  const gracefulShutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer().catch(err => {
  console.error('[SkyNex AI] Failed to start server:', err);
  process.exit(1);
});
