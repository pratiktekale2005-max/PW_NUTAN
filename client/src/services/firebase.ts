import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Vite environment variables for Firebase Web App (Client identification only)
// Sensitive secrets like GEMINI_API_KEY are strictly held on the server!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderForNutanHackathon2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pw-nutan.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pw-nutan',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pw-nutan.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1029384756:web:abcdef123456'
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
} catch (err) {
  console.warn('[Firebase Client] Firebase Web App initialized in standby mode:', err);
}

export const firebaseClient = {
  app,
  auth,
  config: {
    projectId: firebaseConfig.projectId,
    region: 'asia-south1',
    authDomain: firebaseConfig.authDomain
  },
  getStatus() {
    return {
      initialized: !!app,
      projectId: firebaseConfig.projectId,
      region: 'asia-south1',
      authDomain: firebaseConfig.authDomain
    };
  }
};
