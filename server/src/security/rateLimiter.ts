import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { authenticateRole, UserRole } from './auth.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

/**
 * Server-side IP-based rate limiting middleware.
 * Protects Gemini AI inference routes and incident triggers from abuse / DoS.
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  
  let record = ipRequestMap.get(clientIp);
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + config.rateLimitWindowMs
    };
    ipRequestMap.set(clientIp, record);
    return next();
  }

  record.count++;
  if (record.count > config.rateLimitMaxRequests) {
    const retrySec = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retrySec);
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Please wait ${retrySec} seconds before retrying.`
    });
  }

  next();
}

/**
 * Server-side Authorization & Role-Based Access Control (RBAC) middleware.
 * Mandated because Firebase Admin SDK / backend operations bypass Firestore client rules.
 * Strictly verifies cryptographic HMAC signatures to prevent client-side role spoofing.
 */
export function requireRole(allowedRoles: Array<UserRole>) {
  return authenticateRole(allowedRoles);
}

/**
 * Validates request payload size.
 */
export function validatePayloadSize(maxBytes: number = 100 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        error: 'Payload Too Large',
        message: `Request payload exceeds allowed maximum of ${maxBytes / 1024} KB.`
      });
    }
    next();
  };
}
