import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | null = null;
let adminAuth: Auth | null = null;

function initializeAdmin() {
  if (getApps().length > 0) {
    app = getApps()[0];
    adminAuth = getAuth(app);
    return;
  }

  // Initialize Firebase Admin SDK
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  try {
    if (serviceAccount) {
      const serviceAccountJson = JSON.parse(serviceAccount);
      app = initializeApp({
        credential: cert(serviceAccountJson),
      });
    } else {
      // For production environments with default credentials (GCP, etc.)
      app = initializeApp();
    }
    adminAuth = getAuth(app);
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Admin SDK will not be available - API routes will need to handle this
  }
}

// Initialize on module load
initializeAdmin();

export async function verifyIdToken(token: string) {
  if (!adminAuth) {
    throw new Error('Firebase Admin SDK not initialized. Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
  }
  return await adminAuth.verifyIdToken(token);
}

export { adminAuth };

