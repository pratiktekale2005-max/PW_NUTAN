import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/api.js';
import { AgentOrchestrator } from './agents/orchestrator.js';

const app = express();

// Security & Parsing Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

// Request logging for audit telemetry
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/stream') {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ServerError]', err);
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  res.status(500).json({
    success: false,
    error: 'Internal AegisPulse Error',
    message
  });
});

// Seed an initial demonstrative scenario on server launch
async function seedInitialIncidents() {
  console.log('[AegisPulse] Initializing system and seeding baseline operational state...');
  try {
    await AgentOrchestrator.processIncident({
      type: 'COLD_CHAIN_EXCURSION',
      title: 'Cryogenic Container #AZ-409 Temperature Excursion In-Transit',
      priority: 'CRITICAL',
      source: 'Mobile-Reefer-Van-04 (Route Expressway-E8)',
      payload: {
        bioItemCode: 'mRNA-Vaccine-BNT162b2',
        currentTempC: -14.2,
        ambientTempC: 34.0,
        durationAboveMaxMinutes: 26,
        batchId: 'LOT-BNT-2026-X89',
        doseCount: 1200,
        estimatedBatchValueUsd: 42000,
        currentLat: 18.5312,
        currentLng: 73.8445
      }
    });

    await AgentOrchestrator.processIncident({
      type: 'CLINICAL_DRUG_CONFLICT',
      title: 'ICU High-Acuity Conflict: Warfarin Ordered for Amiodarone Patient',
      priority: 'CRITICAL',
      source: 'EHR-ICU-Station-Bed04',
      payload: {
        prescribedDrug: 'Warfarin',
        activeMedications: ['Amiodarone', 'Furosemide', 'Enoxaparin'],
        patientEgfr: 44,
        allergies: ['Penicillin'],
        patientId: 'PT-8820-ICU',
        attendingPhysician: 'Dr. S. Nair, MD'
      }
    });
    console.log('[AegisPulse] Baseline incidents seeded and autonomously triaged.');
  } catch (err) {
    console.error('Error seeding initial state:', err);
  }
}

app.listen(config.port, async () => {
  console.log(`====================================================`);
  console.log(`🛡️  AegisPulse AI Resilience Server Active`);
  console.log(`📡 Port: ${config.port}`);
  console.log(`🌐 Mode: ${config.environment}`);
  console.log(`🧠 Gemini Model Tiering: ACTIVE`);
  console.log(`🔒 Merkle SHA-256 Audit: ONLINE`);
  console.log(`====================================================`);
  
  await seedInitialIncidents();
});
