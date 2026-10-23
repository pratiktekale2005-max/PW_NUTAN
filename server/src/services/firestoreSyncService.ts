import fs from 'fs';
import path from 'path';

export class FirestoreSyncService {
  /**
   * Returns production Firebase Security Rules for pw-nutan
   */
  public static getFirestoreSecurityRules(): string {
    const rulesPath = path.resolve(process.cwd(), '../firestore.rules');
    if (fs.existsSync(rulesPath)) {
      return fs.readFileSync(rulesPath, 'utf8');
    }
    
    // Fallback embedded definition
    return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function hasRole(role) { return isAuthenticated() && (request.auth.token.role == role || request.auth.token[role] == true); }
    function isAdmin() { return hasRole('ADMIN'); }
    function isClinician() { return hasRole('CLINICIAN') || isAdmin(); }
    function isLogisticsOfficer() { return hasRole('LOGISTICS_OFFICER') || isAdmin(); }
    function isAuditor() { return hasRole('AUDITOR') || isAdmin(); }

    match /incidents/{incidentId} {
      allow read: if isAuthenticated() && (isClinician() || isLogisticsOfficer() || isAuditor());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (isClinician() || isLogisticsOfficer());
      allow delete: if false;
    }

    match /audit_ledger/{blockId} {
      allow read: if isAuditor();
      allow create: if isAuthenticated() && hasRole('SYSTEM_AGENT_SERVICE_ACCOUNT');
      allow update, delete: if false;
    }

    match /hitl_actions/{actionId} {
      allow read: if isAuthenticated();
      allow update: if isAuthenticated() && (isClinician() || isLogisticsOfficer() || isAdmin());
      allow delete: if false;
    }

    match /facilities/{facilityId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}`.trim();
  }
}
