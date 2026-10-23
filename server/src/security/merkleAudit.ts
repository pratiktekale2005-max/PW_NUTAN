import crypto from 'crypto';
import { MerkleAuditBlock } from '../types/index.js';
import { config } from '../config/index.js';

export class MerkleAuditLedger {
  private static chain: MerkleAuditBlock[] = [];
  private static genesisHash: string = '0000000000000000000000000000000000000000000000000000000000000000';
  // Mutex lock to guarantee serial, concurrency-safe append operations
  private static appendMutex: Promise<unknown> = Promise.resolve();

  /**
   * Deterministic canonical serialization (RFC 8785 style):
   * Recursively sorts object keys so equivalent payloads always yield identical SHA-256 hashes.
   */
  public static canonicalStringify(obj: unknown): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.canonicalStringify(item)).join(',') + ']';
    }
    const record = obj as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort();
    const pairs = sortedKeys.map(key => `${JSON.stringify(key)}:${this.canonicalStringify(record[key])}`);
    return '{' + pairs.join(',') + '}';
  }

  /**
   * Initializes the audit ledger with a genesis block.
   */
  public static init() {
    if (this.chain.length === 0) {
      this.recordEvent({
        incidentId: 'SYS_INIT',
        action: 'AUDIT_GENESIS_INITIALIZED',
        payloadSummary: 'AegisPulse Cryptographic Merkle Audit Ledger initialized.',
        details: { version: '1.0.0', algorithm: 'SHA-256 Merkle-Chained with HMAC Signatures' }
      });
    }
  }

  /**
   * Appends an immutable audit block to the ledger in a concurrency-safe manner.
   */
  public static async recordEventAsync(params: {
    incidentId: string;
    action: string;
    payloadSummary: string;
    details?: unknown;
  }): Promise<MerkleAuditBlock> {
    // Chain onto mutex to guarantee serialized execution
    const block = await (this.appendMutex = this.appendMutex.then(() => {
      return this.executeAppend(params);
    }));
    return block as MerkleAuditBlock;
  }

  /**
   * Synchronous append for backwards compatibility, using canonical hashing.
   */
  public static recordEvent(params: {
    incidentId: string;
    action: string;
    payloadSummary: string;
    details?: unknown;
  }): MerkleAuditBlock {
    return this.executeAppend(params);
  }

  private static executeAppend(params: {
    incidentId: string;
    action: string;
    payloadSummary: string;
    details?: unknown;
  }): MerkleAuditBlock {
    const previousHash = this.chain.length > 0 
      ? this.chain[this.chain.length - 1].currentHash 
      : this.genesisHash;

    const entryId = `AUDIT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();
    
    // Canonical data hashing
    const canonicalPayload = this.canonicalStringify(params.details || {});
    const dataHash = crypto
      .createHash('sha256')
      .update(canonicalPayload)
      .digest('hex');

    // Block hash combines previousHash + entryId + incidentId + action + payloadSummary + dataHash + timestamp
    const blockContent = `${previousHash}:${entryId}:${params.incidentId}:${params.action}:${params.payloadSummary}:${dataHash}:${timestamp}`;
    const currentHash = crypto
      .createHash('sha256')
      .update(blockContent)
      .digest('hex');

    // Cryptographic HMAC signature using server audit key
    const immutableSignature = crypto
      .createHmac('sha256', config.auditSigningKey)
      .update(currentHash)
      .digest('hex');

    const block: MerkleAuditBlock = {
      blockIndex: this.chain.length,
      entryId,
      incidentId: params.incidentId,
      timestamp,
      action: params.action,
      previousHash,
      currentHash,
      dataHash,
      payloadSummary: params.payloadSummary,
      immutableSignature
    };

    this.chain.push(block);
    return block;
  }

  /**
   * Retrieves the complete audit chain.
   */
  public static getLedger(): MerkleAuditBlock[] {
    return [...this.chain];
  }

  /**
   * Verifies the cryptographic integrity of the entire chain.
   * Detects broken links, modified data, reordering, and signature tampering.
   */
  public static verifyChainIntegrity(): { 
    isValid: boolean; 
    corruptedBlockIndex?: number; 
    signatureValid: boolean;
    message: string;
    totalBlocksVerified: number;
  } {
    if (this.chain.length === 0) {
      return { isValid: true, signatureValid: true, message: 'Chain is empty', totalBlocksVerified: 0 };
    }

    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.chain[i - 1].currentHash;

      // 1. Verify previous hash link
      if (block.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          corruptedBlockIndex: i,
          signatureValid: false,
          message: `Broken chain link at Block #${i}: previousHash does not match previous block's currentHash.`,
          totalBlocksVerified: i
        };
      }

      // 2. Verify block content hash integrity
      const blockContent = `${block.previousHash}:${block.entryId}:${block.incidentId}:${block.action}:${block.payloadSummary}:${block.dataHash}:${block.timestamp}`;
      const recomputedHash = crypto
        .createHash('sha256')
        .update(blockContent)
        .digest('hex');

      if (block.currentHash !== recomputedHash) {
        return {
          isValid: false,
          corruptedBlockIndex: i,
          signatureValid: false,
          message: `Hash mismatch at Block #${i}: payload or metadata has been altered.`,
          totalBlocksVerified: i
        };
      }

      // 3. Verify signature authenticity
      const expectedSignature = crypto
        .createHmac('sha256', config.auditSigningKey)
        .update(block.currentHash)
        .digest('hex');

      if (block.immutableSignature !== expectedSignature) {
        return {
          isValid: false,
          corruptedBlockIndex: i,
          signatureValid: false,
          message: `Tampered signature at Block #${i}: cryptographic HMAC mismatch.`,
          totalBlocksVerified: i
        };
      }
    }

    return { 
      isValid: true, 
      signatureValid: true, 
      message: `All ${this.chain.length} blocks cryptographically verified and intact.`,
      totalBlocksVerified: this.chain.length
    };
  }
}

// Initialize ledger on load
MerkleAuditLedger.init();
