import React, { useState } from 'react';
import { Database, Copy, Check, Download, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';

interface BigQueryExportProps {
  bigQueryData: { tableDDL: string; rowCount: number; rows: any[] } | null;
  firestoreData: { firestoreRules: string; collectionsConfigured: string[]; status?: any } | null;
}

export const BigQueryExportModal: React.FC<BigQueryExportProps> = ({ bigQueryData, firestoreData }) => {
  const [copiedDDL, setCopiedDDL] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [evaluatingGemini, setEvaluatingGemini] = useState(false);
  const [geminiEvalResult, setGeminiEvalResult] = useState<any>(null);

  const copyToClipboard = (text: string, type: 'DDL' | 'RULES') => {
    navigator.clipboard.writeText(text);
    if (type === 'DDL') {
      setCopiedDDL(true);
      setTimeout(() => setCopiedDDL(false), 2000);
    } else {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2000);
    }
  };

  const downloadJSON = () => {
    if (!bigQueryData?.rows) return;
    const blob = new Blob([JSON.stringify(bigQueryData.rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegispulse_bigquery_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runGeminiEvaluation = async () => {
    setEvaluatingGemini(true);
    try {
      const res = await api.evaluateGemini();
      setGeminiEvalResult(res.evaluation);
    } catch (err) {
      console.error('Gemini evaluation failed:', err);
    } finally {
      setEvaluatingGemini(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
      {/* BigQuery DDL & Stream Export */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Database size={18} color="#38bdf8" />
            <span>Google BigQuery Telemetry & Audit Data Warehouse</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              id="btn-copy-ddl"
              className="btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              onClick={() => copyToClipboard(bigQueryData?.tableDDL || '', 'DDL')}
            >
              {copiedDDL ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span style={{ marginLeft: '4px' }}>{copiedDDL ? 'Copied' : 'Copy DDL'}</span>
            </button>
            <button 
              id="btn-download-bigquery-json"
              className="btn-primary" 
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              onClick={downloadJSON}
            >
              <Download size={12} />
              <span style={{ marginLeft: '4px' }}>Export NDJSON</span>
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Production schema configured with partitioned daily ingestion and clustering for high-throughput enterprise healthcare & supply chain intelligence.
        </p>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Production BigQuery DDL (Partitioned & Clustered):
        </div>
        <div className="tool-payload-box" style={{ maxHeight: '220px', overflowY: 'auto' }}>
          <pre>{bigQueryData?.tableDDL || 'Loading DDL...'}</pre>
        </div>

        {/* Gemini AI Measurable Evaluation Runner */}
        <div style={{ marginTop: '1.5rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#c7d2fe', fontSize: '0.88rem' }}>
              <Sparkles size={16} color="#818cf8" />
              <span>Google Gemini AI Measurable Evaluation</span>
            </div>
            <button 
              id="btn-evaluate-gemini"
              className="btn-primary" 
              style={{ fontSize: '0.74rem', padding: '0.35rem 0.75rem' }}
              onClick={runGeminiEvaluation}
              disabled={evaluatingGemini}
            >
              {evaluatingGemini ? 'Evaluating...' : 'Run Live AI Benchmark'}
            </button>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Executes real-time schema validation, prompt injection isolation, and token efficiency tests on Gemini Pro and Flash.
          </div>

          {geminiEvalResult && (
            <div className="tool-payload-box" style={{ marginTop: '0.75rem', maxHeight: '180px', color: '#a7f3d0' }}>
              <pre>{JSON.stringify(geminiEvalResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Firebase Firestore Security Rules & Collection Schema */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <ShieldCheck size={18} color="#f59e0b" />
            <span>Firebase Firestore Reactive Architecture</span>
          </div>
          <button 
            id="btn-copy-firestore-rules"
            className="btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => copyToClipboard(firestoreData?.firestoreRules || '', 'RULES')}
          >
            {copiedRules ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            <span style={{ marginLeft: '4px' }}>{copiedRules ? 'Copied' : 'Copy Rules'}</span>
          </button>
        </div>

        {/* Live Project Info Badge */}
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.75rem 1rem', 
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>
              Firebase Project: pw-nutan
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Cloud Firestore (default) • Region: asia-south1 (Mumbai)
            </div>
          </div>
          <span className="badge badge-resolved" style={{ fontSize: '0.7rem' }}>
            <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
            Connected
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Role-Based Access Control (RBAC) rules enforcing cryptographic immutability on audit ledgers and restricting clinical interventions to certified roles.
        </p>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Active Document Collections:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(firestoreData?.collectionsConfigured || ['incidents', 'audit_ledger', 'hitl_actions', 'facilities', 'telemetry_metrics']).map((col) => (
            <span key={col} className="badge badge-resolved" style={{ fontSize: '0.72rem' }}>
              /{col}
            </span>
          ))}
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Production Firebase Security Rules (`firestore.rules`):
        </div>
        <div className="tool-payload-box" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          <pre>{firestoreData?.firestoreRules || 'Loading Firestore security rules...'}</pre>
        </div>
      </div>
    </div>
  );
};
