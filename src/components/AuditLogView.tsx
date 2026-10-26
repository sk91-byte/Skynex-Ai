import React, { useState, useEffect } from 'react';
import { AuditReport } from '../types.ts';
import { History, FileText, Check, X, Edit2, Download, ExternalLink, Calendar } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [history, setHistory] = useState<AuditReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (res.ok && data.history) {
        setHistory(data.history);
        if (data.history.length > 0 && !selectedReport) {
          setSelectedReport(data.history[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch audit history:', e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const exportJSON = () => {
    if (!selectedReport) return;
    const blob = new Blob([JSON.stringify(selectedReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${selectedReport.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-800" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Traceable Governance & Audit Log
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Every content submission, automated rule check, and human decision is immutably logged for regulatory auditability and compliance sign-off.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            {history.length} Record{history.length === 1 ? '' : 's'} Logged
          </span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No Audits Completed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Run your first compliance check in the Audit Studio to generate a verifiable revision history record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* History list */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-900 uppercase tracking-wider">
              Audit Records
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {history.map(rep => {
                const isSelected = selectedReport?.id === rep.id;
                const acceptedCount = rep.findings.filter(f => f.decision === 'accepted').length;
                const rejectedCount = rep.findings.filter(f => f.decision === 'rejected').length;

                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'hover:bg-slate-50 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-mono font-bold uppercase ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {rep.brandId}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold truncate mb-1">
                      {rep.campaign} · {rep.contentType}
                    </h4>

                    <p className={`text-[11px] truncate mb-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      "{rep.originalText}"
                    </p>

                    <div className="flex items-center gap-2 text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono ${
                          rep.overallStatus === 'no_issues_detected' || rep.overallStatus === 'changes_applied'
                            ? 'bg-emerald-100 text-emerald-800'
                            : isSelected
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rep.findings.length} findings
                      </span>
                      {acceptedCount > 0 && (
                        <span className="text-emerald-500 font-semibold">
                          ✓ {acceptedCount} applied
                        </span>
                      )}
                      {rejectedCount > 0 && (
                        <span className="text-rose-400 font-semibold">
                          ✕ {rejectedCount} rejected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Record Detail Pane */}
          {selectedReport && (
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    Report ID: {selectedReport.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedReport.campaign} ({selectedReport.contentType})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={exportJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Original Draft vs Final Approved Text */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                    Original Submitted Draft:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-sans">{selectedReport.originalText}</p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
                  <span className="block text-[10px] font-mono font-bold text-emerald-800 uppercase mb-1">
                    Current Version (Human Decisions Applied):
                  </span>
                  <p className="text-emerald-950 font-medium leading-relaxed font-sans">
                    {selectedReport.currentText}
                  </p>
                </div>
              </div>

              {/* Findings & Human Decision Audit Trail */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Human Decision Audit Trail ({selectedReport.findings.length} findings)
                </span>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedReport.findings.map((f, i) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          #{i + 1} {f.conflictText}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            f.decision === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : f.decision === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : f.decision === 'edited'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {f.decision}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono">
                        Rule: {f.approvedRuleCitation}
                      </div>

                      <div className="text-[11px] text-slate-600">
                        {f.decision === 'accepted' && (
                          <span className="text-emerald-700">✓ Accepted AI suggestion: "{f.suggestedReplacement}"</span>
                        )}
                        {f.decision === 'edited' && (
                          <span className="text-blue-700">✎ Customized replacement: "{f.editedReplacement}"</span>
                        )}
                        {f.decision === 'rejected' && (
                          <span className="text-rose-700">✕ Rejected by reviewer{f.rejectionReason ? ` (${f.rejectionReason})` : ''}</span>
                        )}
                        {f.decision === 'pending' && (
                          <span className="text-amber-700">Pending review</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
