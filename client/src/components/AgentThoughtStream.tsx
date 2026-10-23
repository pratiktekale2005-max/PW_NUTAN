import type { AgentStep } from '../types/index.js';
import { 
  Eye, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  FileCheck, 
  MessageSquare,
  Clock
} from 'lucide-react';

interface AgentThoughtStreamProps {
  steps: AgentStep[];
  isStreaming: boolean;
  selectedIncidentTitle?: string;
}

export const AgentThoughtStream: React.FC<AgentThoughtStreamProps> = ({ 
  steps, 
  isStreaming,
  selectedIncidentTitle 
}) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'OBSERVE': return <Eye size={15} color="#06b6d4" />;
      case 'SECURITY_CHECK': return <ShieldCheck size={15} color="#ef4444" />;
      case 'PLAN': return <Compass size={15} color="#8b5cf6" />;
      case 'REASON': return <Sparkles size={15} color="#3b82f6" />;
      case 'TOOL_CALL': return <Wrench size={15} color="#f59e0b" />;
      case 'TOOL_RESULT': return <CheckCircle2 size={15} color="#10b981" />;
      case 'VERIFY': return <FileCheck size={15} color="#10b981" />;
      case 'AUDIT': return <LockIcon size={15} color="#ec4899" />;
      case 'RESPOND': return <MessageSquare size={15} color="#ffffff" />;
      default: return <Sparkles size={15} color="#6366f1" />;
    }
  };

  function LockIcon({ size, color }: { size: number; color: string }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    );
  }

  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Sparkles size={18} color="#6366f1" />
          <span>Autonomous Agent Cognitive Stream (ReAct Loop)</span>
        </div>
        {isStreaming && (
          <div className="status-pill" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <span className="pulse-dot" style={{ backgroundColor: '#818cf8', boxShadow: '0 0 8px #818cf8' }}></span>
            <span>REASONING IN PROGRESS</span>
          </div>
        )}
      </div>

      {selectedIncidentTitle && (
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--text-muted)', 
          marginBottom: '0.85rem', 
          padding: '0.45rem 0.75rem', 
          background: 'rgba(255, 255, 255, 0.02)', 
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          Currently Inspecting: <strong style={{ color: '#ffffff' }}>{selectedIncidentTitle}</strong>
        </div>
      )}

      {steps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Sparkles size={36} color="#64748b" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.6 }} />
          <p style={{ fontWeight: 600 }}>No cognitive steps recorded yet.</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Select an incident or trigger a scenario to watch the autonomous agent reason in real time.</p>
        </div>
      ) : (
        <div className="thought-stream">
          {steps.map((step) => (
            <div key={step.id} className={`thought-card stage-${step.stage}`}>
              <div className="thought-card-header">
                <div style={{ display: 'flex', alignSelf: 'center', alignItems: 'center', gap: '0.45rem' }}>
                  {getStageIcon(step.stage)}
                  <span className="thought-stage-tag">{step.stage}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {step.agentName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                    {Math.round(step.confidenceScore * 100)}% Conf
                  </span>
                  <span className="thought-latency">
                    <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                    {step.latencyMs}ms
                  </span>
                </div>
              </div>

              <div className="thought-body">{step.content}</div>

              {step.toolCall && (
                <div className="tool-payload-box">
                  <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>
                    Tool Invocation: {step.toolCall.name}()
                  </div>
                  <pre>{JSON.stringify(step.toolCall.args, null, 2)}</pre>
                </div>
              )}

              {step.toolResult && (
                <div className="tool-payload-box" style={{ color: '#a7f3d0', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontWeight: 600, color: '#34d399', marginBottom: '0.25rem' }}>
                    Tool Output Execution Verified:
                  </div>
                  <pre>{JSON.stringify(step.toolResult, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
