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

export interface HITLAction {
  id: string;
  incidentId: string;
  tier: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  toolName?: string;
  parameters: Record<string, any>;
  requiredRole: 'CLINICIAN' | 'LOGISTICS_OFFICER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  decisionAt?: string;
  decidedBy?: string;
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
  autonomousResolutionRate: number;
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
  category: string;
  address: string;
  lat: number;
  lng: number;
  availableCapacityLiters: number;
  icuBedsAvailable: number;
  coldChainTier: string;
  contactRadio: string;
}

export interface SystemStatusResponse {
  success: boolean;
  gemini: {
    status: 'LIVE' | 'UNAVAILABLE' | 'SIMULATED';
    model: string;
    verified: boolean;
    apiKeyPresent: boolean;
    tier: string;
  };
  firestore: {
    status: 'LIVE' | 'UNAVAILABLE' | 'SIMULATED';
    mode: string;
    projectId: string;
    region: string;
    database: string;
    collections: string[];
    pendingConfig: string | null;
  };
  authentication: {
    status: string;
    mode: string;
    tokenExpiryHours: number;
    supportedRoles: string[];
  };
  agentWorkflow: {
    status: string;
    cognitiveStages: string[];
    reactEngineActive: boolean;
  };
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

export interface TriggerIncidentPayload {
  type: Incident['type'];
  title: string;
  priority: Incident['priority'];
  source: string;
  payload: Record<string, unknown>;
  rawInputText?: string;
}

export interface SecurityScanResponse {
  success: boolean;
  assessment: SecurityAssessment;
}

export interface BenchmarkResponse {
  success: boolean;
  benchmark: {
    traditionalWorkflow: {
      method: string;
      stepsCount: number;
      estimatedTimeMinutes: number;
      spoilageRiskPercentage: number;
      costEstimateUsd: number;
      complianceAudit: string;
    };
    aegisPulseAutonomous: {
      method: string;
      stepsCount: number;
      measuredTimeSeconds: string;
      spoilageRiskPercentage: number;
      costEstimateUsd: number;
      complianceAudit: string;
    };
    measuredImprovement: {
      timeReductionFactor: string;
      laborCostReduction: string;
      spoilagePreventedAssetValue: string;
    };
  };
  incident: Incident;
}

export interface BigQueryExportResponse {
  success: boolean;
  tableDDL: string;
  rowCount: number;
  rows: Record<string, unknown>[];
}

export interface FirestoreExportResponse {
  success: boolean;
  firestoreRules: string;
  collectionsConfigured: string[];
  status?: Record<string, unknown>;
}

export interface GeminiEvaluationResult {
  framework: string;
  schemaConformanceRate: string;
  promptInjectionDefense: string;
  rateLimiterStatus: string;
  totalTokensConsumed: number;
  measuredLatencyMs: {
    proCausalReasoningMs: number;
    flashExtractionMs: number;
    totalEvaluationMs: number;
  };
  structuredOutputVerified: {
    medTestAssessmentLength: number;
    coldTestToolsCount: number;
  };
}

export interface GeminiEvaluationResponse {
  success: boolean;
  evaluation: GeminiEvaluationResult;
}
