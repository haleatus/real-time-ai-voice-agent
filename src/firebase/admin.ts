import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initialize Firebase Admin SDK
 * @returns {Object} - Firebase Admin SDK
 */
const initiFirebaseAdmin = () => {
  const apps = getApps();

  // Initialize Firebase Admin SDK if not already initialized
  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PROJECT_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
};

export const { auth, db } = initiFirebaseAdmin();
