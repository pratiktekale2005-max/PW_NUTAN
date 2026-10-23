import React from 'react';
import type { HITLAction } from '../types/index.js';
import { UserCheck, AlertOctagon, XCircle } from 'lucide-react';

interface HITLModalProps {
  pendingActions: HITLAction[];
  onApprove: (actionId: string, approvedBy: string, role: string) => void;
  onReject?: (actionId: string, role: string, reason?: string) => void;
  onDismiss: () => void;
}

export const HITLModal: React.FC<HITLModalProps> = ({ 
  pendingActions, 
  onApprove, 
  onReject, 
  onDismiss 
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onDismiss]);

  if (pendingActions.length === 0) return null;

  const currentAction = pendingActions[0];

  const handleApproveClick = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onApprove(currentAction.id, 'Dr. Sarah Connor, Chief Resident', currentAction.requiredRole);
  };

  const handleRejectClick = () => {
    if (isSubmitting || !onReject) return;
    setIsSubmitting(true);
    onReject(currentAction.id, currentAction.requiredRole, 'Operator clinical override');
  };

  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="hitl-modal-title"
    >
      <div className="modal-dialog">
        <h3 className="modal-title" id="hitl-modal-title">
          <AlertOctagon size={24} color="#f43f5e" aria-hidden="true" />
          <span>Human-In-The-Loop (HITL) Authorization Required</span>
        </h3>

        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: '#fb7185', marginBottom: '0.2rem' }}>
            Risk Tier {currentAction.tier} — Consequential Autonomous Action Suspended
          </div>
          <div style={{ fontSize: '0.85rem', color: '#fecdd3' }}>
            AegisPulse policy mandates verified human sign-off before irreversible clinical orders or fleet rerouting.
          </div>
        </div>

        <div className="modal-body">
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            {currentAction.title}
          </div>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            {currentAction.description}
          </p>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Target Parameters & Execution Arguments:
          </div>
          <div className="tool-payload-box" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <pre>{JSON.stringify(currentAction.parameters, null, 2)}</pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Required Role: <strong style={{ color: '#ffffff' }}>{currentAction.requiredRole}</strong></span>
            <span>Requested At: <strong>{new Date(currentAction.requestedAt).toLocaleTimeString()}</strong></span>
          </div>
        </div>

        <div className="modal-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            className="btn-secondary" 
            onClick={onDismiss} 
            disabled={isSubmitting}
            aria-label="Defer and close approval dialog"
          >
            Defer / Close
          </button>
          {onReject && (
            <button 
              id="btn-hitl-deny"
              className="btn-secondary" 
              style={{ color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.4)' }}
              onClick={handleRejectClick}
              disabled={isSubmitting}
              aria-label="Deny and quarantine this autonomous action"
            >
              <XCircle size={16} aria-hidden="true" />
              <span>{isSubmitting ? 'Processing...' : 'Deny / Quarantine'}</span>
            </button>
          )}
          <button 
            id="btn-hitl-authorize-sign"
            className="btn-hitl-sign" 
            onClick={handleApproveClick}
            disabled={isSubmitting}
            aria-label="Cryptographically sign and execute order"
          >
            <UserCheck size={16} aria-hidden="true" />
            <span>{isSubmitting ? 'Signing Order...' : 'Cryptographically Sign & Execute Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
