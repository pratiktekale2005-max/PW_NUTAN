export interface DrugSafetyRule {
  drugA: string;
  drugB: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  mechanism: string;
  recommendation: string;
  actionRequired: 'BLOCK_AND_SUBSTITUTE' | 'DOSAGE_ADJUSTMENT' | 'MONITOR_VITALS';
  safeAlternative?: string;
}

export interface ColdChainSpec {
  bioItem: string;
  category: 'VACCINE' | 'BLOOD_PLASMA' | 'INSULIN' | 'CHEMOTHERAPY_BIOLOGIC';
  nominalTempMinC: number;
  nominalTempMaxC: number;
  criticalExcursionThresholdC: number;
  degradationRatePerMinuteAboveMax: number; // percentage loss of bio-potency per minute
  maxExcursionMinutesAllowed: number;
  storageRequirement: string;
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

export const DRUG_SAFETY_GRAPH: DrugSafetyRule[] = [
  {
    drugA: 'Warfarin',
    drugB: 'Amiodarone',
    severity: 'CRITICAL',
    mechanism: 'Amiodarone inhibits CYP2C9 and CYP3A4 metabolism of Warfarin, causing severe INR spike and fatal internal hemorrhage risk.',
    recommendation: 'Immediate 33% to 50% Warfarin dosage reduction or substitute antiarrhythmic agent.',
    actionRequired: 'BLOCK_AND_SUBSTITUTE',
    safeAlternative: 'Apixaban with tailored dose OR Multaq (dronedarone) under cardiologist protocol'
  },
  {
    drugA: 'Metformin',
    drugB: 'Iodinated Radiocontrast',
    severity: 'CRITICAL',
    mechanism: 'Contrast-induced nephropathy combined with Metformin can precipitate fatal lactic acidosis in renal impaired patients.',
    recommendation: 'Withhold Metformin 48 hours prior to and 48 hours following contrast administration. Verify eGFR.',
    actionRequired: 'BLOCK_AND_SUBSTITUTE',
    safeAlternative: 'Insulin sliding scale temporarily during radiographic workup'
  },
  {
    drugA: 'Potassium Chloride IV',
    drugB: 'Spironolactone',
    severity: 'CRITICAL',
    mechanism: 'Severe hyperkalemia (>6.5 mEq/L) leading to fatal cardiac arrest / ventricular fibrillation in acute kidney injury.',
    recommendation: 'Immediately suspend IV potassium infusion. Administer sodium polystyrene sulfonate or calcium gluconate if ECG peaked T waves present.',
    actionRequired: 'BLOCK_AND_SUBSTITUTE',
    safeAlternative: '0.9% Normal Saline hydration without potassium additives'
  },
  {
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    severity: 'HIGH',
    mechanism: 'Omeprazole inhibits CYP2C19 bioactivation of Clopidogrel, significantly reducing antiplatelet efficacy and increasing stent thrombosis risk.',
    recommendation: 'Switch gastroprotective agent to Pantoprazole or Famotidine which does not significantly inhibit CYP2C19.',
    actionRequired: 'BLOCK_AND_SUBSTITUTE',
    safeAlternative: 'Pantoprazole 40mg IV/PO'
  }
];

export const COLD_CHAIN_SPECIFICATIONS: Record<string, ColdChainSpec> = {
  'mRNA-Vaccine-BNT162b2': {
    bioItem: 'COVID-19 mRNA Vaccine (Comirnaty)',
    category: 'VACCINE',
    nominalTempMinC: -80,
    nominalTempMaxC: -60,
    criticalExcursionThresholdC: -15, // if rises above -15°C, rapid decay
    degradationRatePerMinuteAboveMax: 0.85, // 0.85% potency lost per min above threshold
    maxExcursionMinutesAllowed: 60,
    storageRequirement: 'Ultra-low temperature cryogenic freezer with dry-ice backup'
  },
  'Recombinant-Human-Insulin': {
    bioItem: 'Insulin Glargine (Lantus)',
    category: 'INSULIN',
    nominalTempMinC: 2,
    nominalTempMaxC: 8,
    criticalExcursionThresholdC: 25,
    degradationRatePerMinuteAboveMax: 0.4,
    maxExcursionMinutesAllowed: 120,
    storageRequirement: '2°C to 8°C validated pharmaceutical refrigeration'
  },
  'Fresh-Frozen-Plasma-ABO': {
    bioItem: 'Fresh Frozen Cryo-Plasma Units (FFP)',
    category: 'BLOOD_PLASMA',
    nominalTempMinC: -30,
    nominalTempMaxC: -18,
    criticalExcursionThresholdC: -5,
    degradationRatePerMinuteAboveMax: 1.2,
    maxExcursionMinutesAllowed: 45,
    storageRequirement: 'Strict sub-zero blast freezer; thaw only under blood bank waterbath'
  }
};

export const CERTIFIED_FACILITIES: CertifiedFacility[] = [
  {
    id: 'FAC-METRO-01',
    name: 'St. Jude Metropolitan Tertiary Trauma & Bio-Hub',
    category: 'LEVEL_1_TRAUMA_CENTER',
    address: '840 BioMedical Parkway, Sector 4, Metro City',
    lat: 18.5204,
    lng: 73.8567,
    availableCapacityLiters: 1250,
    icuBedsAvailable: 8,
    coldChainTier: 'ULTRA_LOW_MINUS_80',
    contactRadio: 'ST-JUDE-CRITICAL-CH4'
  },
  {
    id: 'FAC-CRYONIC-02',
    name: 'Apex Regional Cryogenic Cold-Chain Logistics Hub',
    category: 'REGIONAL_CRYOGENIC_HUB',
    address: 'Plot 12, Expressway Logistics Corridor',
    lat: 18.5679,
    lng: 73.9143,
    availableCapacityLiters: 8500,
    icuBedsAvailable: 0,
    coldChainTier: 'ULTRA_LOW_MINUS_80',
    contactRadio: 'APEX-BIO-DISPATCH-9'
  },
  {
    id: 'FAC-PHARM-03',
    name: 'Apollo Clinical Specialty Distribution Depot',
    category: 'SPECIALTY_PHARMACY_DEPOT',
    address: 'Building B, Healthcare SEZ Phase 1',
    lat: 18.4901,
    lng: 73.8219,
    availableCapacityLiters: 3200,
    icuBedsAvailable: 0,
    coldChainTier: 'REFRIGERATED_2_TO_8',
    contactRadio: 'APOLLO-DEPOT-CH1'
  }
];
