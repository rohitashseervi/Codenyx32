import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBu-te8amA5gTTPYCZr3iR2xUm8XXP-QIU",
  authDomain: "gapzero-ab712.firebaseapp.com",
  projectId: "gapzero-ab712",
  storageBucket: "gapzero-ab712.firebasestorage.app",
  messagingSenderId: "645254405300",
  appId: "1:645254405300:web:fd1e733879f8a3509c0be1",
  measurementId: "G-8XJVKFDSS7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
