import type { 
  Incident, 
  AgentStep, 
  HITLAction, 
  MerkleAuditBlock, 
  TelemetryMetrics, 
  CertifiedFacility,
  SystemStatusResponse,
  SecurityScanResponse,
  BenchmarkResponse,
  TriggerIncidentPayload,
  BigQueryExportResponse,
  FirestoreExportResponse
} from '../types/index.js';

const API_BASE = '/api';

export const api = {
  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_BASE}/incidents`);
    const data = await res.json();
    return data.incidents || [];
  },

  async getIncidentDetails(id: string): Promise<{ incident: Incident; steps: AgentStep[] }> {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    const data = await res.json();
    return { incident: data.incident, steps: data.steps || [] };
  },

  async triggerIncident(payload: TriggerIncidentPayload): Promise<{ incident: Incident; hitlRequired: boolean }> {
    const res = await fetch(`${API_BASE}/incidents/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // In-memory token cache for authenticated RBAC personas
  _tokenCache: null as Record<string, string> | null,

  async getAuthTokens(): Promise<Record<string, string>> {
    if (this._tokenCache) return this._tokenCache;
    try {
      const res = await fetch(`${API_BASE}/auth/tokens`);
      const data = await res.json();
      if (data.success && data.tokens) {
        this._tokenCache = data.tokens;
        return data.tokens;
      }
    } catch (err) {
      console.warn('Failed to fetch auth tokens from server:', err);
    }
    return {};
  },

  async getSystemStatus(): Promise<SystemStatusResponse> {
    const res = await fetch(`${API_BASE}/system/status`);
    return await res.json();
  },

  async getPendingHITLActions(): Promise<HITLAction[]> {
    const res = await fetch(`${API_BASE}/hitl/pending`);
    const data = await res.json();
    return data.actions || [];
  },

  async approveHITL(actionId: string, approvedBy: string, role: string): Promise<boolean> {
    const tokens = await this.getAuthTokens();
    const token = tokens[role] || tokens['CLINICIAN'] || '';
    
    const res = await fetch(`${API_BASE}/hitl/approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ actionId, approvedBy })
    });
    const data = await res.json();
    return data.success;
  },

  async rejectHITL(actionId: string, role: string, reason?: string): Promise<boolean> {
    const tokens = await this.getAuthTokens();
    const token = tokens[role] || tokens['CLINICIAN'] || '';
    
    const res = await fetch(`${API_BASE}/hitl/reject`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ actionId, reason: reason || 'Operator manual override' })
    });
    const data = await res.json();
    return data.success;
  },

  async getAuditLedger(): Promise<{ integrity: { isValid: boolean; message: string; totalBlocksVerified?: number }; blocks: MerkleAuditBlock[] }> {
    const res = await fetch(`${API_BASE}/security/audit`);
    const data = await res.json();
    return { integrity: data.integrity, blocks: data.blocks || [] };
  },

  async testSecurityFirewall(input: string): Promise<SecurityScanResponse> {
    const res = await fetch(`${API_BASE}/security/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    return await res.json();
  },

  async getTelemetryMetrics(): Promise<TelemetryMetrics> {
    const res = await fetch(`${API_BASE}/telemetry/metrics`);
    const data = await res.json();
    return data.metrics;
  },

  async runBenchmark(): Promise<BenchmarkResponse> {
    const res = await fetch(`${API_BASE}/benchmark/run`, {
      method: 'POST'
    });
    return await res.json();
  },

  async getBigQueryExport(): Promise<BigQueryExportResponse> {
    const res = await fetch(`${API_BASE}/export/bigquery`);
    return await res.json();
  },

  async getFirestoreExport(): Promise<FirestoreExportResponse> {
    const res = await fetch(`${API_BASE}/export/firestore`);
    return await res.json();
  },

  async getFacilities(): Promise<CertifiedFacility[]> {
    const res = await fetch(`${API_BASE}/facilities`);
    const data = await res.json();
    return data.facilities || [];
  },

  async getFirebaseStatus(): Promise<{ success: boolean; firestore: Record<string, unknown> }> {
    const res = await fetch(`${API_BASE}/firebase/status`);
    return await res.json();
  },

  async evaluateGemini(): Promise<{ success: boolean; evaluation: Record<string, unknown> }> {
    const res = await fetch(`${API_BASE}/gemini/evaluate`, {
      method: 'POST'
    });
    return await res.json();
  },

  subscribeToThoughtStream(onStep: (step: AgentStep) => void): () => void {
    const eventSource = new EventSource(`${API_BASE}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const step = JSON.parse(event.data);
        if (step && step.stage && step.stage !== 'CONNECT') {
          onStep(step);
        }
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }
};
