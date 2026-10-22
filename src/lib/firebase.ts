import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdDvfVMwFaJIhWVy0lGjAUty0kwb8B6gg",
  authDomain: "prime-life-care-dcacf.firebaseapp.com",
  projectId: "prime-life-care-dcacf",
  storageBucket: "prime-life-care-dcacf.firebasestorage.app",
  messagingSenderId: "790518603401",
  appId: "1:790518603401:web:3e4585ca277d2315777058",
  measurementId: "G-4GLH5SKFF5"
};

// Initialize Firebase (singleton pattern for SSR / Next.js)
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

export const googleAuthProvider = new GoogleAuthProvider();
// Forces device (Android / iOS / PC) to display all logged-in Gmail accounts
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});
