import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().find((candidate) => candidate.name === '[DEFAULT]') || initializeApp(firebaseConfig);
const adminApp = getApps().find((candidate) => candidate.name === 'boltwish-admin') || initializeApp(firebaseConfig, 'boltwish-admin');

const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;

if (typeof window !== 'undefined' && appCheckSiteKey) {
  import('firebase/app-check')
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      [app, adminApp].forEach((firebaseApp) => {
        initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaV3Provider(appCheckSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
      });
    })
    .catch(() => {
      // App Check is an optional deployment hardening layer. Database rules remain enforced.
    });
}

export { adminApp, app };
