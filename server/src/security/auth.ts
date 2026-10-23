import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export type UserRole = 'CLINICIAN' | 'LOGISTICS_OFFICER' | 'AUDITOR' | 'ADMIN';

export interface AuthUser {
  uid: string;
  name: string;
  role: UserRole;
  issuedAt: number;
  expiresAt: number;
}

export class AuthService {
  /**
   * Signs an authenticated token using HMAC-SHA256 with server-held secret.
   */
  public static signToken(user: { uid: string; name: string; role: UserRole }, ttlMs = 24 * 60 * 60 * 1000): string {
    const payload: AuthUser = {
      uid: user.uid,
      name: user.name,
      role: user.role,
      issuedAt: Date.now(),
      expiresAt: Date.now() + ttlMs
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', config.jwtSecret)
      .update(payloadB64)
      .digest('base64url');
    return `${payloadB64}.${signature}`;
  }

  /**
   * Verifies an auth token and ensures role has not been client-spoofed.
   */
  public static verifyToken(token: string): { valid: boolean; user?: AuthUser; error?: string } {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token missing' };
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', config.jwtSecret)
      .update(payloadB64)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false, error: 'Cryptographic signature mismatch: Token forged or altered' };
    }

    try {
      const decoded: AuthUser = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      if (Date.now() > decoded.expiresAt) {
        return { valid: false, error: 'Token expired' };
      }
      return { valid: true, user: decoded };
    } catch {
      return { valid: false, error: 'Invalid payload encoding' };
    }
  }

  /**
   * Generates standard authorized test tokens for demo evaluation.
   */
  public static getDemoToken(role: UserRole): string {
    const names: Record<UserRole, string> = {
      CLINICIAN: 'Dr. Sarah Connor, Chief Resident',
      LOGISTICS_OFFICER: 'Marcus Vance, Logistics Fleet Director',
      AUDITOR: 'Elena Rostova, Compliance QA Inspector',
      ADMIN: 'System SuperAdmin'
    };
    return this.signToken({
      uid: `USER-${role.toLowerCase()}-01`,
      name: names[role],
      role
    });
  }
}

/**
 * Express middleware to enforce authenticated role verification.
 * Rejects client-spoofed roles and validates HMAC signatures.
 */
export function authenticateRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'] as string;
    }

    // STRICT SECURITY: Never trust client-supplied headers without a signed token.
    // Demo clients must request an authentic signed token via /api/auth/tokens or provide a Bearer token.
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication Required',
        message: 'No valid Bearer authorization token was provided. Unsigned client roles are rejected.'
      });
    }

    const verification = AuthService.verifyToken(token);
    if (!verification.valid || !verification.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid Token',
        message: verification.error || 'Token verification failed.'
      });
    }

    const user = verification.user;
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient Permissions',
        message: `Verified role (${user.role}) does not have permission for this operation. Required: ${allowedRoles.join(', ')}.`
      });
    }

    // Attach verified user to request
    (req as any).user = user;
    next();
  };
}
