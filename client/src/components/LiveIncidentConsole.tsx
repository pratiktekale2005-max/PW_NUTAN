import React, { useState } from 'react';
import type { Incident } from '../types/index.js';
import { 
  AlertTriangle, 
  ThermometerSnowflake, 
  Pill, 
  ShieldAlert, 
  PlusCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface LiveIncidentConsoleProps {
  incidents: Incident[];
  selectedIncidentId?: string;
  onSelectIncident: (id: string) => void;
  onTriggerScenario: (scenarioType: 'COLD_CHAIN' | 'CLINICAL_DRUG' | 'ADVERSARIAL_INJECTION' | 'CUSTOM', customData?: Record<string, unknown>) => void;
  isLoading: boolean;
}

export const LiveIncidentConsole: React.FC<LiveIncidentConsoleProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onTriggerScenario,
  isLoading
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState<Incident['type']>('COLD_CHAIN_EXCURSION');
  const [customPriority, setCustomPriority] = useState<Incident['priority']>('CRITICAL');
  const [customPayloadText, setCustomPayloadText] = useState('{\n  "bioItem": "Emergency Cryo-Plasma Units",\n  "currentTempC": -4.2,\n  "durationAboveMaxMinutes": 35\n}');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedPayload = JSON.parse(customPayloadText);
      onTriggerScenario('CUSTOM', {
        title: customTitle || 'Custom Operator Incident Event',
        type: customType,
        priority: customPriority,
        source: 'OPERATOR_MANUAL_TERMINAL',
        payload: parsedPayload,
        rawInputText: customPayloadText
      });
      setShowCustomModal(false);
    } catch {
      alert('Invalid JSON in payload. Please verify format.');
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-high';
      default: return 'badge-resolved';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="badge badge-resolved"><CheckCircle2 size={11} /> Resolved</span>;
      case 'HITL_PENDING':
        return <span className="badge badge-hitl"><Clock size={11} /> HITL Required</span>;
      case 'BLOCKED':
        return <span className="badge badge-critical"><ShieldAlert size={11} /> Blocked</span>;
      default:
        return <span className="badge badge-high"><AlertTriangle size={11} /> {status}</span>;
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <AlertTriangle size={18} color="#f59e0b" />
          <span>Live Resiliency Command Console</span>
        </div>
        <button 
          id="btn-custom-incident"
          className="btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
          onClick={() => setShowCustomModal(true)}
        >
          <PlusCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
          Custom Trigger
        </button>
      </div>

      <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Quick Live Scenario Triggers (For Hackathon Judges):
      </div>

      <div className="scenario-bar" role="toolbar" aria-label="Incident scenario triggers">
        <button 
          id="btn-scenario-cold-chain"
          type="button"
          aria-label="Trigger Cold-Chain Excursion Scenario"
          className="scenario-btn critical" 
          onClick={() => onTriggerScenario('COLD_CHAIN')}
          disabled={isLoading}
        >
          <ThermometerSnowflake size={15} color="#06b6d4" aria-hidden="true" />
          <span>Cold-Chain Excursion</span>
        </button>

        <button 
          id="btn-scenario-clinical-drug"
          type="button"
          aria-label="Trigger ICU Drug Contraindication Scenario"
          className="scenario-btn" 
          onClick={() => onTriggerScenario('CLINICAL_DRUG')}
          disabled={isLoading}
        >
          <Pill size={15} color="#ec4899" aria-hidden="true" />
          <span>ICU Drug Contraindication</span>
        </button>

        <button 
          id="btn-scenario-adversarial"
          type="button"
          aria-label="Trigger Adversarial Prompt Attack Scenario"
          className="scenario-btn" 
          onClick={() => onTriggerScenario('ADVERSARIAL_INJECTION')}
          disabled={isLoading}
        >
          <ShieldAlert size={15} color="#ef4444" aria-hidden="true" />
          <span>Adversarial Prompt Attack</span>
        </button>
      </div>

      <div style={{ margin: '0.75rem 0 0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Recorded Incidents ({incidents.length})</span>
        <span>Click or press Enter to view reasoning trace</span>
      </div>

      <div className="incident-list" role="listbox" aria-label="Incident History">
        {incidents.map((inc) => (
          <div 
            key={inc.id}
            id={`incident-item-${inc.id}`}
            role="option"
            tabIndex={0}
            aria-selected={selectedIncidentId === inc.id}
            className={`incident-card ${selectedIncidentId === inc.id ? 'active' : ''}`}
            onClick={() => onSelectIncident(inc.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectIncident(inc.id);
              }
            }}
          >
            <div className="incident-card-top">
              <span className={`badge ${getPriorityBadgeClass(inc.priority)}`}>
                {inc.priority}
              </span>
              {getStatusBadge(inc.status)}
            </div>

            <div className="incident-title">{inc.title}</div>

            <div className="incident-meta">
              <span>Src: {inc.source}</span>
              <span>
                {inc.resolutionTimeMs ? `${inc.resolutionTimeMs}ms` : 'Processing...'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showCustomModal && (
        <div 
          className="modal-overlay" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="custom-incident-dialog-title"
        >
          <div className="modal-dialog">
            <h3 className="modal-title" id="custom-incident-dialog-title">
              <PlusCircle size={20} color="#6366f1" aria-hidden="true" />
              <span>Simulate Custom Healthcare / Bio-Logistics Incident</span>
            </h3>

            <form onSubmit={handleCustomSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label 
                  htmlFor="custom-title-input" 
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
                >
                  Incident Title / Headline
                </label>
                <input 
                  id="custom-title-input"
                  type="text" 
                  value={customTitle} 
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. ICU Dialysis Unit Acute Hyperkalemia Alert"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label 
                    htmlFor="custom-type-select" 
                    style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
                  >
                    Incident Type
                  </label>
                  <select 
                    id="custom-type-select"
                    value={customType} 
                    onChange={(e) => setCustomType(e.target.value as Incident['type'])}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', background: '#0e1424', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff' }}
                  >
                    <option value="COLD_CHAIN_EXCURSION">Cold-Chain Excursion</option>
                    <option value="CLINICAL_DRUG_CONFLICT">Clinical Drug Conflict</option>
                    <option value="BIO_SUPPLY_CRITICAL_STOCKOUT">Critical Bio-Supply Stockout</option>
                    <option value="ADVERSARIAL_INJECTION_ATTEMPT">Adversarial Injection Attack</option>
                  </select>
                </div>

                <div>
                  <label 
                    htmlFor="custom-priority-select" 
                    style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
                  >
                    Priority Acuity Tier
                  </label>
                  <select 
                    id="custom-priority-select"
                    value={customPriority} 
                    onChange={(e) => setCustomPriority(e.target.value as Incident['priority'])}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', background: '#0e1424', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#ffffff' }}
                  >
                    <option value="CRITICAL">CRITICAL (Emergency Siren)</option>
                    <option value="HIGH">HIGH (Urgent Care)</option>
                    <option value="MEDIUM">MEDIUM (Standard Care)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label 
                  htmlFor="custom-payload-textarea" 
                  style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}
                >
                  Telemetry / Clinical Payload (JSON)
                </label>
                <textarea 
                  id="custom-payload-textarea"
                  rows={5}
                  value={customPayloadText}
                  onChange={(e) => setCustomPayloadText(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#7dd3fc', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCustomModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Dispatch to Autonomous Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
