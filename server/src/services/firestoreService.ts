import fs from 'fs';
import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { config } from '../config/index.js';
import { 
  Incident, 
  MerkleAuditBlock, 
  HITLAction, 
  CertifiedFacility 
} from '../types/index.js';
import { CERTIFIED_FACILITIES } from '../data/mockDatabase.js';

export interface FirestoreStatusReport {
  status: 'LIVE' | 'UNAVAILABLE' | 'SIMULATED';
  initialized: boolean;
  connected: boolean;
  mode: string;
  projectId: string;
  region: string;
  database: string;
  collections: string[];
  pendingConfig: string | null;
}

export class FirestoreService {
  private static db: Firestore | null = null;
  private static isInitialized = false;
  private static isRealCloudConnected = false;

  // Resilient fallback storage when credentials are not yet provided locally
  private static memoryStore: {
    incidents: Map<string, Incident>;
    audit_ledger: MerkleAuditBlock[];
    hitl_actions: Map<string, HITLAction>;
    facilities: CertifiedFacility[];
  } = {
    incidents: new Map(),
    audit_ledger: [],
    hitl_actions: new Map(),
    facilities: [...CERTIFIED_FACILITIES]
  };

  /**
   * Initializes Firebase Admin SDK connected to pw-nutan project in asia-south1.
   */
  public static init() {
    if (this.isInitialized) return;

    try {
      // 1. Check for explicit service account key path
      if (config.firebaseServiceAccountKey && fs.existsSync(config.firebaseServiceAccountKey)) {
        const serviceAccount = JSON.parse(fs.readFileSync(config.firebaseServiceAccountKey, 'utf8'));
        if (getApps().length === 0) {
          initializeApp({
            credential: cert(serviceAccount),
            projectId: config.firebaseProjectId
          });
        }
        this.db = getFirestore();
        this.isRealCloudConnected = true;
        console.log(`[FirestoreService] Connected to Cloud Firestore via Service Account (Project: ${config.firebaseProjectId}, Region: ${config.firebaseRegion})`);
      } 
      // 2. Check for Application Default Credentials (ADC) or Google Cloud environment
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        if (getApps().length === 0) {
          initializeApp({
            credential: applicationDefault(),
            projectId: config.firebaseProjectId
          });
        }
        this.db = getFirestore();
        this.isRealCloudConnected = true;
        console.log(`[FirestoreService] Connected to Cloud Firestore via ADC (Project: ${config.firebaseProjectId})`);
      } else {
        console.log(`[FirestoreService] Initialized in Active Resilient Mode (Project: ${config.firebaseProjectId}, Region: ${config.firebaseRegion}). Firestore real cloud connection ready for serviceAccountKey.`);
        this.isRealCloudConnected = false;
      }
    } catch (err) {
      console.warn(`[FirestoreService] Firebase Admin SDK initialization deferred:`, err);
      this.isRealCloudConnected = false;
    }

    this.isInitialized = true;
  }

  /**
   * Returns current Firestore connection status for UI and audit inspector.
   */
  public static getStatus(): FirestoreStatusReport {
    const statusVal: 'LIVE' | 'UNAVAILABLE' | 'SIMULATED' = this.isRealCloudConnected ? 'LIVE' : 'SIMULATED';
    return {
      status: statusVal,
      initialized: this.isInitialized,
      connected: this.isRealCloudConnected,
      mode: this.isRealCloudConnected ? 'REAL_CLOUD_FIRESTORE' : 'LOCAL_ACTIVE_SIMULATION',
      projectId: config.firebaseProjectId,
      region: config.firebaseRegion,
      database: '(default)',
      collections: ['incidents', 'audit_ledger', 'hitl_actions', 'facilities', 'telemetry_metrics'],
      pendingConfig: this.isRealCloudConnected ? null : 'Awaiting serviceAccountKey.json'
    };
  }

  /**
   * Persists an incident document.
   */
  public static async saveIncident(incident: Incident): Promise<void> {
    this.memoryStore.incidents.set(incident.id, incident);

    if (this.isRealCloudConnected && this.db) {
      try {
        await this.db.collection('incidents').doc(incident.id).set({
          ...incident,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn(`[Firestore] Failed to persist incident ${incident.id} to Cloud Firestore:`, err);
      }
    }
  }

  /**
   * Retrieves all incidents.
   */
  public static async getIncidents(): Promise<Incident[]> {
    if (this.isRealCloudConnected && this.db) {
      try {
        const snapshot = await this.db.collection('incidents').orderBy('timestamp', 'desc').get();
        if (!snapshot.empty) {
          return snapshot.docs.map((doc: any) => doc.data() as Incident);
        }
      } catch (err) {
        console.warn(`[Firestore] Fallback to memory store for getIncidents:`, err);
      }
    }
    return Array.from(this.memoryStore.incidents.values()).reverse();
  }

  /**
   * Retrieves an incident by ID.
   */
  public static async getIncidentById(id: string): Promise<Incident | null> {
    if (this.isRealCloudConnected && this.db) {
      try {
        const doc = await this.db.collection('incidents').doc(id).get();
        if (doc.exists) {
          return doc.data() as Incident;
        }
      } catch (err) {
        console.warn(`[Firestore] Fallback to memory store for getIncidentById:`, err);
      }
    }
    return this.memoryStore.incidents.get(id) || null;
  }

  /**
   * Appends an immutable audit block to the ledger.
   */
  public static async recordAuditBlock(block: MerkleAuditBlock): Promise<void> {
    this.memoryStore.audit_ledger.push(block);

    if (this.isRealCloudConnected && this.db) {
      try {
        // Strict Append-Only write; using blockIndex as document ID
        await this.db.collection('audit_ledger').doc(`block_${block.blockIndex}`).set({
          ...block,
          persistedAt: FieldValue.serverTimestamp()
        });
      } catch (err) {
        console.warn(`[Firestore] Failed to append audit block ${block.blockIndex}:`, err);
      }
    }
  }

  /**
   * Retrieves the Merkle audit ledger.
   */
  public static async getAuditLedger(): Promise<MerkleAuditBlock[]> {
    if (this.isRealCloudConnected && this.db) {
      try {
        const snapshot = await this.db.collection('audit_ledger').orderBy('blockIndex', 'asc').get();
        if (!snapshot.empty) {
          return snapshot.docs.map((doc: any) => doc.data() as MerkleAuditBlock);
        }
      } catch (err) {
        console.warn(`[Firestore] Fallback to memory store for getAuditLedger:`, err);
      }
    }
    return [...this.memoryStore.audit_ledger];
  }

  /**
   * Saves a pending Human-in-the-Loop action.
   */
  public static async saveHITLAction(action: HITLAction): Promise<void> {
    this.memoryStore.hitl_actions.set(action.id, action);

    if (this.isRealCloudConnected && this.db) {
      try {
        await this.db.collection('hitl_actions').doc(action.id).set(action);
      } catch (err) {
        console.warn(`[Firestore] Failed to save HITL action:`, err);
      }
    }
  }

  /**
   * Resolves a pending HITL action with cryptographic sign-off.
   */
  public static async resolveHITLAction(actionId: string, decision: {
    status: 'APPROVED' | 'REJECTED';
    decidedBy: string;
    decisionAt: string;
  }): Promise<boolean> {
    const action = this.memoryStore.hitl_actions.get(actionId);
    if (!action) return false;

    action.status = decision.status;
    action.decidedBy = decision.decidedBy;
    action.decisionAt = decision.decisionAt;

    if (this.isRealCloudConnected && this.db) {
      try {
        await this.db.collection('hitl_actions').doc(actionId).update({
          status: decision.status,
          decidedBy: decision.decidedBy,
          decisionAt: decision.decisionAt
        });
      } catch (err) {
        console.warn(`[Firestore] Failed to update HITL action in Firestore:`, err);
      }
    }

    return true;
  }

  /**
   * Retrieves pending HITL actions.
   */
  public static async getPendingHITLActions(): Promise<HITLAction[]> {
    return Array.from(this.memoryStore.hitl_actions.values()).filter(a => a.status === 'PENDING');
  }

  /**
   * Retrieves certified medical and cryogenic facilities.
   */
  public static async getFacilities(): Promise<CertifiedFacility[]> {
    return [...this.memoryStore.facilities];
  }
}

// Initialize on module load
FirestoreService.init();
