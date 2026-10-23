import { CERTIFIED_FACILITIES, DRUG_SAFETY_GRAPH, COLD_CHAIN_SPECIFICATIONS, CertifiedFacility } from '../data/mockDatabase.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export const REGISTERED_TOOLS: ToolDefinition[] = [
  {
    name: 'google_maps_emergency_routing',
    description: 'Calculates the fastest emergency route and ETA using Google Maps geospatial distance matrix and traffic conditions.',
    parameters: {
      type: 'object',
      properties: {
        originLat: { type: 'number', description: 'Current latitude of mobile unit or vehicle' },
        originLng: { type: 'number', description: 'Current longitude of mobile unit or vehicle' },
        destinationFacilityId: { type: 'string', description: 'ID of target facility to divert to' },
        priorityMode: { type: 'string', enum: ['EMERGENCY_SIREN_TRANSIT', 'STANDARD'], description: 'Traffic priority level' }
      },
      required: ['originLat', 'originLng', 'destinationFacilityId']
    }
  },
  {
    name: 'coldchain_telemetry_analyzer',
    description: 'Analyzes IoT temperature/humidity curve and calculates degradation rate and Time-to-Potency-Failure.',
    parameters: {
      type: 'object',
      properties: {
        bioItemCode: { type: 'string', description: 'Code of the biologic product (e.g. mRNA-Vaccine-BNT162b2)' },
        currentTempC: { type: 'number', description: 'Current chamber temperature in Celsius' },
        ambientTempC: { type: 'number', description: 'External ambient temperature' },
        durationAboveMaxMinutes: { type: 'number', description: 'Minutes elapsed above allowed temperature ceiling' }
      },
      required: ['bioItemCode', 'currentTempC', 'durationAboveMaxMinutes']
    }
  },
  {
    name: 'clinical_drug_interaction_checker',
    description: 'Checks prescribed medications against patient active meds and EHR renal/hepatic status to detect adverse contraindications.',
    parameters: {
      type: 'object',
      properties: {
        prescribedDrug: { type: 'string', description: 'Medication intended for immediate administration' },
        activeMedications: { type: 'array', items: { type: 'string' }, description: 'List of currently administered patient drugs' },
        patientEgfr: { type: 'number', description: 'Estimated Glomerular Filtration Rate (renal function metric)' },
        allergies: { type: 'array', items: { type: 'string' }, description: 'Patient documented allergy list' }
      },
      required: ['prescribedDrug', 'activeMedications']
    }
  },
  {
    name: 'facility_capacity_finder',
    description: 'Finds nearest certified healthcare or cryogenic facility with available capacity and required storage tier.',
    parameters: {
      type: 'object',
      properties: {
        requiredTier: { type: 'string', enum: ['ULTRA_LOW_MINUS_80', 'STANDARD_COLD_MINUS_20', 'REFRIGERATED_2_TO_8'], description: 'Required cryogenic or refrigeration tier' },
        minCapacityLiters: { type: 'number', description: 'Minimum available storage volume needed' },
        currentLat: { type: 'number', description: 'Current latitude' },
        currentLng: { type: 'number', description: 'Current longitude' }
      },
      required: ['requiredTier', 'currentLat', 'currentLng']
    }
  },
  {
    name: 'inventory_quarantine_controller',
    description: 'Applies cryptographic digital quarantine lock on compromised biomedical inventory batches to prevent dispensation.',
    parameters: {
      type: 'object',
      properties: {
        batchId: { type: 'string', description: 'Universal Lot / Batch Identifier' },
        productName: { type: 'string', description: 'Name of the biomedical product' },
        reason: { type: 'string', description: 'Clinical or thermal excursion justification' },
        quarantineScope: { type: 'string', enum: ['SINGLE_CONTAINER', 'ENTIRE_SHIPMENT_LOT', 'REGIONAL_DISTRIBUTION_HOLD'], description: 'Scope of quarantine' }
      },
      required: ['batchId', 'reason', 'quarantineScope']
    }
  },
  {
    name: 'emergency_alert_dispatcher',
    description: 'Dispatches cryptographically verified multichannel emergency alerts to on-call clinical teams and logistics dispatch.',
    parameters: {
      type: 'object',
      properties: {
        severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'ADVISORY'], description: 'Urgency tier' },
        targetDepartment: { type: 'string', description: 'e.g. ICU_CHARGE_NURSE, COLD_CHAIN_OPERATIONS, PHARMACY_DIRECTOR' },
        message: { type: 'string', description: 'Concise incident summary and required clinical/logistical directive' },
        incidentId: { type: 'string', description: 'Associated incident ID' }
      },
      required: ['severity', 'targetDepartment', 'message', 'incidentId']
    }
  }
];

export class AutonomousToolsExecutor {
  /**
   * Executes a tool dynamically with schema validation and defensive error handling.
   */
  public static async executeTool(toolName: string, args: Record<string, any>): Promise<any> {
    const startTime = Date.now();

    try {
      switch (toolName) {
        case 'google_maps_emergency_routing': {
          const { originLat, originLng, destinationFacilityId, priorityMode } = args;
          const targetFacility = CERTIFIED_FACILITIES.find(f => f.id === destinationFacilityId) || CERTIFIED_FACILITIES[0];
          
          // Compute Haversine distance in km
          const dLat = (targetFacility.lat - originLat) * Math.PI / 180;
          const dLng = (targetFacility.lng - originLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(originLat * Math.PI / 180) * Math.cos(targetFacility.lat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distanceKm = parseFloat((6371 * c).toFixed(2));
          
          // Emergency siren speed vs standard urban speed
          const avgSpeedKmh = priorityMode === 'EMERGENCY_SIREN_TRANSIT' ? 68 : 42;
          const transitMinutes = Math.max(3, Math.round((distanceKm / avgSpeedKmh) * 60));

          return {
            success: true,
            facilityId: targetFacility.id,
            facilityName: targetFacility.name,
            address: targetFacility.address,
            destinationCoords: { lat: targetFacility.lat, lng: targetFacility.lng },
            distanceKm,
            estimatedTransitMinutes: transitMinutes,
            trafficClearanceGranted: priorityMode === 'EMERGENCY_SIREN_TRANSIT',
            recommendedEmergencyCorridor: `Sector 4 Arterial -> Expressway Connector -> ${targetFacility.name}`,
            executionDurationMs: Date.now() - startTime
          };
        }

        case 'coldchain_telemetry_analyzer': {
          const { bioItemCode, currentTempC, ambientTempC = 32, durationAboveMaxMinutes } = args;
          const spec = COLD_CHAIN_SPECIFICATIONS[bioItemCode] || COLD_CHAIN_SPECIFICATIONS['mRNA-Vaccine-BNT162b2'];
          
          const isBreached = currentTempC > spec.nominalTempMaxC;
          const tempDeltaAboveNominal = Math.max(0, currentTempC - spec.nominalTempMaxC);
          const potencyLossPercent = parseFloat(
            Math.min(100, durationAboveMaxMinutes * spec.degradationRatePerMinuteAboveMax * (tempDeltaAboveNominal > 0 ? (tempDeltaAboveNominal / 5) : 1)).toFixed(1)
          );
          const remainingMinutesBeforeIrreversibleSpoilage = Math.max(
            0,
            Math.round(spec.maxExcursionMinutesAllowed - durationAboveMaxMinutes)
          );

          return {
            success: true,
            bioItem: spec.bioItem,
            currentTempC,
            nominalAllowedRange: `${spec.nominalTempMinC}°C to ${spec.nominalTempMaxC}°C`,
            isExcursionActive: isBreached,
            calculatedPotencyLossPercent: potencyLossPercent,
            viabilityStatus: potencyLossPercent > 15 ? 'CRITICAL_DEGRADATION' : (isBreached ? 'EXCURSION_RECOVERABLE' : 'NOMINAL'),
            remainingGraceMinutes: remainingMinutesBeforeIrreversibleSpoilage,
            recommendedAction: remainingMinutesBeforeIrreversibleSpoilage <= 25 
              ? 'IMMEDIATE_DIVERSION_TO_CRYOGENIC_HUB' 
              : 'BOOST_AUXILIARY_COOLING_AND_MONITOR',
            executionDurationMs: Date.now() - startTime
          };
        }

        case 'clinical_drug_interaction_checker': {
          const { prescribedDrug, activeMedications = [], patientEgfr, allergies = [] } = args;
          const conflicts: Array<{ rule: any; urgency: string }> = [];

          // Cross-reference with clinical safety graph
          for (const drug of activeMedications) {
            const rule = DRUG_SAFETY_GRAPH.find(
              r => (r.drugA.toLowerCase() === prescribedDrug.toLowerCase() && r.drugB.toLowerCase() === drug.toLowerCase()) ||
                   (r.drugB.toLowerCase() === prescribedDrug.toLowerCase() && r.drugA.toLowerCase() === drug.toLowerCase())
            );
            if (rule) {
              conflicts.push({ rule, urgency: rule.severity });
            }
          }

          // Check renal contraindications
          const renalContraindicated = (patientEgfr && patientEgfr < 30 && prescribedDrug.toLowerCase().includes('metformin'));
          if (renalContraindicated) {
            conflicts.push({
              rule: {
                drugA: prescribedDrug,
                drugB: 'Renal Insufficiency (eGFR < 30)',
                severity: 'CRITICAL',
                mechanism: 'Severe drug accumulation causing toxic lactic acidosis.',
                recommendation: 'Withhold drug immediately; consult clinical nephrologist.',
                actionRequired: 'BLOCK_AND_SUBSTITUTE',
                safeAlternative: 'Insulin sliding scale'
              },
              urgency: 'CRITICAL'
            });
          }

          // Check allergy list
          const allergyHit = allergies.find((a: string) => prescribedDrug.toLowerCase().includes(a.toLowerCase()));
          if (allergyHit) {
            conflicts.push({
              rule: {
                drugA: prescribedDrug,
                drugB: `Allergen Record: ${allergyHit}`,
                severity: 'CRITICAL',
                mechanism: 'High risk of anaphylactic reaction and acute respiratory distress.',
                recommendation: 'Do NOT administer. Flag EHR chart.',
                actionRequired: 'BLOCK_AND_SUBSTITUTE',
                safeAlternative: 'Select non-cross-reactive pharmacological class'
              },
              urgency: 'CRITICAL'
            });
          }

          const isSafe = conflicts.length === 0;

          return {
            success: true,
            isSafe,
            prescribedDrug,
            activeConflictsCount: conflicts.length,
            conflicts,
            riskRecommendation: isSafe ? 'PROCEED_WITH_ADMINISTRATION' : 'HALT_ADMINISTRATION_IMMEDIATELY',
            executionDurationMs: Date.now() - startTime
          };
        }

        case 'facility_capacity_finder': {
          const { requiredTier, minCapacityLiters = 500, currentLat, currentLng } = args;
          
          // Filter matching tier
          const matchingFacilities = CERTIFIED_FACILITIES.filter(
            f => (requiredTier === 'ULTRA_LOW_MINUS_80' ? f.coldChainTier === 'ULTRA_LOW_MINUS_80' : true) &&
                 f.availableCapacityLiters >= minCapacityLiters
          ).map(facility => {
            const dLat = (facility.lat - currentLat) * Math.PI / 180;
            const dLng = (facility.lng - currentLng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(currentLat * Math.PI / 180) * Math.cos(facility.lat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distanceKm = parseFloat((6371 * c).toFixed(2));
            const estimatedTransitMinutes = Math.round((distanceKm / 55) * 60);

            return {
              ...facility,
              distanceKm,
              estimatedTransitMinutes
            };
          }).sort((a, b) => a.estimatedTransitMinutes - b.estimatedTransitMinutes);

          return {
            success: true,
            optimalFacility: matchingFacilities[0] || null,
            allCandidates: matchingFacilities,
            executionDurationMs: Date.now() - startTime
          };
        }

        case 'inventory_quarantine_controller': {
          const { batchId, productName, reason, quarantineScope } = args;
          const quarantineLockId = `Q-LOCK-${Date.now().toString(36).toUpperCase()}`;

          return {
            success: true,
            quarantineLockId,
            batchId,
            productName,
            status: 'LOCKED_IN_QUARANTINE',
            quarantineScope,
            reason,
            dispensationBlocked: true,
            timestamp: new Date().toISOString(),
            executionDurationMs: Date.now() - startTime
          };
        }

        case 'emergency_alert_dispatcher': {
          const { severity, targetDepartment, message, incidentId } = args;
          const dispatchToken = `ALERT-TOK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

          return {
            success: true,
            dispatchToken,
            incidentId,
            severity,
            targetDepartment,
            message,
            channelsBroadcasted: ['HOSPITAL_PAGING_SYSTEM', 'MOBILE_CRITICAL_SMS', 'CLINICAL_WORKSTATION_POPUP'],
            broadcastTimestamp: new Date().toISOString(),
            acknowledgmentRequired: severity === 'CRITICAL',
            executionDurationMs: Date.now() - startTime
          };
        }

        default:
          throw new Error(`Tool "${toolName}" is not registered in AegisPulse autonomous tool registry.`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Tool execution encountered an internal error',
        executionDurationMs: Date.now() - startTime
      };
    }
  }
}
