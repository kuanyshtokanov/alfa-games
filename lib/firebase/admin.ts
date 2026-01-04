import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { join } from "path";

let app: App | null = null;
let adminAuth: Auth | null = null;

function initializeAdmin() {
  if (getApps().length > 0) {
    app = getApps()[0];
    adminAuth = getAuth(app);
    return;
  }

  // Initialize Firebase Admin SDK
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || ".env.service-key";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  let serviceAccountJson: Record<string, unknown> | null = null;

  try {
    // Try to read from environment variable (JSON string)
    if (serviceAccountKey) {
      serviceAccountJson = JSON.parse(serviceAccountKey) as Record<
        string,
        unknown
      >;
    } else {
      // Try to read from file
      try {
        const filePath = join(process.cwd(), serviceAccountPath);
        const fileContent = readFileSync(filePath, "utf-8");
        serviceAccountJson = JSON.parse(fileContent) as Record<string, unknown>;
      } catch {
        // File not found or invalid - will fall back to project ID only
      }
    }

    if (serviceAccountJson) {
      // Use service account key (recommended for production)
      app = initializeApp({
        credential: cert(serviceAccountJson),
        projectId:
          projectId ||
          (serviceAccountJson.project_id as string | undefined) ||
          undefined,
      });
    } else if (projectId) {
      // For development: initialize with project ID only
      // Note: This will allow initialization, but you'll need service account
      // credentials to actually verify tokens. Consider adding FIREBASE_SERVICE_ACCOUNT_KEY
      // for full functionality.
      app = initializeApp({
        projectId: projectId,
      });
      console.warn(
        "Firebase Admin initialized with project ID only. To verify tokens, set FIREBASE_SERVICE_ACCOUNT_KEY environment variable or create .env.service-key file."
      );
    } else {
      // Try default initialization (for production GCP environments)
      app = initializeApp();
    }
    adminAuth = getAuth(app);
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    console.error(
      "Make sure you have set FIREBASE_SERVICE_ACCOUNT_KEY, created .env.service-key file, or set NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable."
    );
    // Admin SDK will not be available - API routes will need to handle this
  }
}

// Initialize on module load
initializeAdmin();

export async function verifyIdToken(token: string) {
  if (!adminAuth) {
    throw new Error(
      "Firebase Admin SDK not initialized. Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable."
    );
  }
  return await adminAuth.verifyIdToken(token);
}

export { adminAuth };
