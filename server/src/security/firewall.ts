import crypto from 'crypto';
import { SecurityAssessment } from '../types/index.js';
import { config } from '../config/index.js';

export class PromptFirewall {
  // Known adversarial patterns & jailbreak heuristics
  private static readonly ADVERSARIAL_PATTERNS: Array<{ regex: RegExp; threat: string; weight: number }> = [
    { regex: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts)/i, threat: 'Direct Instruction Override', weight: 0.95 },
    { regex: /(disregard|forget|bypass)\s+(safety|system|security)\s+(rules|guidelines|policies)/i, threat: 'Safety Policy Bypass', weight: 0.95 },
    { regex: /(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(DAN|unrestricted|god\s+mode|chaos|jailbroken)/i, threat: 'Jailbreak Persona Adoption', weight: 0.9 },
    { regex: /(reveal|print|output|display|show|leak)\s+(your\s+)?(system\s+prompt|initial\s+instructions|secret\s+key|api\s+key)/i, threat: 'System Prompt / Secret Exfiltration', weight: 0.95 },
    { regex: /<\|im_start\|>|<\|im_end\|>|\[INST\]|\[\/INST\]|```system/i, threat: 'Special Token / Delimiter Injection', weight: 0.85 },
    { regex: /(base64|rot13|hex|unicode)\s*:\s*[a-zA-Z0-9+/=]{20,}/i, threat: 'Encoded Payload Obfuscation', weight: 0.75 },
    { regex: /(drop\s+table|delete\s+from|rm\s+-rf|format\s+c:|<script>|javascript:)/i, threat: 'Malicious Command / Script Injection', weight: 0.9 },
    { regex: /(elevate|escalate)\s+(privilege|role|access)\s+to\s+(admin|root|superuser)/i, threat: 'Unauthorized Privilege Escalation', weight: 0.85 },
    { regex: /(override|disable|suppress)\s+(clinical\s+contraindication|allergy\s+warning|toxic\s+dosage)/i, threat: 'Clinical Safety Check Suppression', weight: 0.98 }
  ];

  /**
   * Evaluates untrusted user/telemetry input for injection and adversarial payloads.
   */
  public static inspectInput(rawInput: string): SecurityAssessment {
    if (!rawInput || typeof rawInput !== 'string') {
      return {
        isSafe: true,
        injectionDetected: false,
        threatLevel: 'NONE',
        sanitizedInput: '',
        contextTag: '',
        checkedAt: new Date().toISOString(),
        signature: this.generateSignature('empty-input')
      };
    }

    let detectedThreats: string[] = [];
    let cumulativeRiskScore = 0;

    // Check direct pattern matches
    for (const pattern of this.ADVERSARIAL_PATTERNS) {
      if (pattern.regex.test(rawInput)) {
        detectedThreats.push(pattern.threat);
        cumulativeRiskScore += pattern.weight;
      }
    }

    // Inspect for base64 obfuscated text
    const base64Matches = rawInput.match(/[A-Za-z0-9+/=]{24,}/g);
    if (base64Matches) {
      for (const match of base64Matches) {
        try {
          const decoded = Buffer.from(match, 'base64').toString('utf-8');
          for (const pattern of this.ADVERSARIAL_PATTERNS) {
            if (pattern.regex.test(decoded)) {
              detectedThreats.push(`Obfuscated (Base64) ${pattern.threat}`);
              cumulativeRiskScore += pattern.weight;
            }
          }
        } catch {
          // not valid base64, continue
        }
      }
    }

    const injectionDetected = detectedThreats.length > 0 || cumulativeRiskScore >= 0.75;
    let threatLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL' = 'NONE';

    if (cumulativeRiskScore >= 0.9) {
      threatLevel = 'CRITICAL';
    } else if (cumulativeRiskScore >= 0.6) {
      threatLevel = 'MEDIUM';
    } else if (cumulativeRiskScore > 0) {
      threatLevel = 'LOW';
    }

    // Tainted Data Sanitization and Context Isolation
    const nonce = crypto.randomBytes(6).toString('hex');
    const sanitized = this.sanitizeText(rawInput);
    const isolatedContext = `\n<SECURE_DATA_BOUNDARY nonce="${nonce}">\n[UNTRUSTED_PAYLOAD_START]\n${sanitized}\n[UNTRUSTED_PAYLOAD_END]\n</SECURE_DATA_BOUNDARY>\n`;

    return {
      isSafe: !injectionDetected,
      injectionDetected,
      threatLevel,
      threatPattern: detectedThreats.join(' | ') || undefined,
      sanitizedInput: isolatedContext,
      contextTag: nonce,
      checkedAt: new Date().toISOString(),
      signature: this.generateSignature(rawInput)
    };
  }

  private static sanitizeText(text: string): string {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[STRIPPED_SCRIPT]')
      .replace(/<\|im_start\|>/gi, '[STRIPPED_TOKEN]')
      .replace(/<\|im_end\|>/gi, '[STRIPPED_TOKEN]')
      .trim();
  }

  private static generateSignature(payload: string): string {
    return crypto
      .createHmac('sha256', config.jwtSecret)
      .update(payload)
      .digest('hex');
  }
}
