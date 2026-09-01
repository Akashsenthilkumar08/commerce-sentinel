import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBanv10gOHkTBlylH5d1MwDm5YskRzkFZk",
  authDomain: "akash-14574.firebaseapp.com",
  databaseURL: "https://akash-14574-default-rtdb.firebaseio.com",
  projectId: "akash-14574",
  storageBucket: "akash-14574.firebasestorage.app",
  messagingSenderId: "1058558884003",
  appId: "1:1058558884003:web:0b0da65d5d8065015f2716",
  measurementId: "G-7GZKRGSWXL"
};

// Initialize Firebase safely (avoid re-initialization on hot-reload)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  prompt: 'select_account',
  tenant: 'common'
});

// Analytics (Only in client browser)
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};

export default app;
