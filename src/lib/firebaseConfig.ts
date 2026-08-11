//gagurjiitsingh@gmail.com
// firebase.ts (or firebaseClient.ts)
// Project: food-demo-d69f0
// Firebase config for Gurjiit Singh

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Initialize app once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Firestore instance
export const db = getFirestore(app);



//gagurjiitsingh@gmail.com
//Cloud Firestore
//nextjs-course
// import { initializeApp, getApps, getApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
//   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
// };



// // Only initialize if not already initialized
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// export const db = getFirestore(app);






// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAOFaFrogsiaUYjfRb8nqYogrfrfw0AWzY",
//   authDomain: "food-demo-d69f0.firebaseapp.com",
//   projectId: "food-demo-d69f0",
//   storageBucket: "food-demo-d69f0.firebasestorage.app",
//   messagingSenderId: "694719081868",
//   appId: "1:694719081868:web:c9ad72f4238f48c5fbbaa9",
//   measurementId: "G-RYLQPYK7T4"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);