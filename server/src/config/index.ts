import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';

// Secure random fallback secrets in dev to prevent hardcoded key leakage
const defaultDevSecret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const defaultAuditKey = process.env.AUDIT_SIGNING_KEY || crypto.randomBytes(32).toString('hex');

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL SECURITY ERROR: Mandatory JWT_SECRET environment variable is missing in production. Failing closed.');
  }
  if (!process.env.AUDIT_SIGNING_KEY) {
    throw new Error('FATAL SECURITY ERROR: Mandatory AUDIT_SIGNING_KEY environment variable is missing in production. Failing closed.');
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  // Google Gemini API Key (Strictly Server-Side - Never Exposed)
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModelFlash: process.env.GEMINI_MODEL_FLASH || 'gemini-3.5-flash',
  geminiModelPro: process.env.GEMINI_MODEL_PRO || 'gemini-3.5-flash',
  
  // Google Cloud & Firebase Configuration
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'pw-nutan',
  firebaseRegion: process.env.FIREBASE_REGION || 'asia-south1',
  firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '',
  
  // BigQuery Dataset
  bigqueryDataset: process.env.BIGQUERY_DATASET || 'aegispulse_telemetry_dw',
  
  // Security & Cryptographic secrets (Zero hardcoded production secrets)
  jwtSecret: process.env.JWT_SECRET || defaultDevSecret,
  auditSigningKey: process.env.AUDIT_SIGNING_KEY || defaultAuditKey,
  
  // Rate limiting (per minute per IP)
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  rateLimitWindowMs: 60 * 1000,
  
  environment: process.env.NODE_ENV || 'development',
  enableSimulationFallback: true,
};
