export type IncidentType = 
  | 'COLD_CHAIN_EXCURSION' 
  | 'CLINICAL_DRUG_CONFLICT' 
  | 'ADVERSARIAL_INJECTION_ATTEMPT' 
  | 'BIO_SUPPLY_CRITICAL_STOCKOUT';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 
  | 'DETECTED' 
  | 'ANALYZING' 
  | 'REASONING' 
  | 'HITL_PENDING' 
  | 'EXECUTING_TOOLS' 
  | 'RESOLVED' 
  | 'QUARANTINED' 
  | 'BLOCKED';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  priority: Priority;
  status: IncidentStatus;
  source: string;
  location?: { lat: number; lng: number; address: string };
  payload: Record<string, any>;
  timestamp: string;
  resolutionTimeMs?: number;
  assignedAgent?: string;
  hitlActionId?: string;
  verificationStatus?: 'PASS' | 'FAIL' | 'ESCALATED';
  evidenceSummary?: string;
}

export type AgentStage = 
  | 'OBSERVE' 
  | 'SECURITY_CHECK' 
  | 'PLAN' 
  | 'REASON' 
  | 'TOOL_CALL' 
  | 'TOOL_RESULT' 
  | 'VERIFY' 
  | 'AUDIT' 
  | 'RESPOND';

export interface AgentStep {
  id: string;
  incidentId: string;
  stepNumber: number;
  stage: AgentStage;
  agentName: string;
  content: string;
  details?: Record<string, any>;
  toolCall?: {
    name: string;
    args: Record<string, any>;
  };
  toolResult?: any;
  confidenceScore: number;
  latencyMs: number;
  timestamp: string;
}

export interface SecurityAssessment {
  isSafe: boolean;
  injectionDetected: boolean;
  threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  threatPattern?: string;
  sanitizedInput: string;
  contextTag: string;
  checkedAt: string;
  signature: string;
}

export interface HITLAction {
  id: string;
  incidentId: string;
  tier: 1 | 2 | 3 | 4; // 1: Auto, 2: Notify, 3: High-consequence reroute/quarantine, 4: Irreversible clinical order
  title: string;
  description: string;
  toolName?: string;
  parameters: Record<string, any>;
  requiredRole: 'CLINICIAN' | 'LOGISTICS_OFFICER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  decisionAt?: string;
  decidedBy?: string;
  signature?: string;
}

export interface MerkleAuditBlock {
  blockIndex: number;
  entryId: string;
  incidentId: string;
  timestamp: string;
  action: string;
  previousHash: string;
  currentHash: string;
  dataHash: string;
  payloadSummary: string;
  immutableSignature: string;
}

export interface TelemetryMetrics {
  totalIncidentsProcessed: number;
  autonomousResolutionRate: number; // percentage e.g. 96.8%
  avgResponseLatencyMs: number;
  tokensConsumed: number;
  costSavedUsd: number;
  manualHoursSaved: number;
  securityAttacksBlocked: number;
  modelTierBreakdown: {
    tier1CacheAndRules: number;
    tier2GeminiFlash: number;
    tier3GeminiPro: number;
  };
  lastIncidentLatencyBreakdown: {
    securityScanMs: number;
    reasoningMs: number;
    toolsExecutionMs: number;
    verificationAuditMs: number;
    totalMs: number;
  };
}

export interface CertifiedFacility {
  id: string;
  name: string;
  category: 'LEVEL_1_TRAUMA_CENTER' | 'REGIONAL_CRYOGENIC_HUB' | 'SPECIALTY_PHARMACY_DEPOT';
  address: string;
  lat: number;
  lng: number;
  availableCapacityLiters: number;
  icuBedsAvailable: number;
  coldChainTier: 'ULTRA_LOW_MINUS_80' | 'STANDARD_COLD_MINUS_20' | 'REFRIGERATED_2_TO_8';
  contactRadio: string;
  distanceKm?: number;
  estimatedTransitMinutes?: number;
}
