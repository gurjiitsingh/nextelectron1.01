const { initializeApp, getApps } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("========== ELECTRON FIREBASE CONFIG ==========");
console.log("apiKey exists:", !!firebaseConfig.apiKey);
console.log("authDomain:", firebaseConfig.authDomain);
console.log("projectId:", firebaseConfig.projectId);
console.log("storageBucket:", firebaseConfig.storageBucket);
console.log("messagingSenderId:", firebaseConfig.messagingSenderId);
console.log("appId:", firebaseConfig.appId);
console.log("==============================================");

const app =
  getApps()[0] ||
  initializeApp(firebaseConfig);

const firestore = getFirestore(app);

module.exports = { firestore }; 