const {
  initializeApp,
  getApps,
  getApp,
} = require("firebase/app");

const {
  getFirestore,
} = require("firebase/firestore");

const {
  getFirebaseConfig,
} = require("../db/firebaseConfigRepo.cjs"); 


const savedConfig = getFirebaseConfig();

if (!savedConfig) {
  throw new Error(
    "Firebase configuration not found. Please initialize the POS first."
  );
}


const firebaseConfig = {
  apiKey: savedConfig.apiKey,
  authDomain: savedConfig.authDomain,
  databaseURL: savedConfig.databaseURL,
  projectId: savedConfig.projectId,
  storageBucket: savedConfig.storageBucket,
  messagingSenderId: savedConfig.messagingSenderId,
  appId: savedConfig.appId,
  measurementId: savedConfig.measurementId,
};


console.log(
  "========== FIREBASE CLIENT CONFIG =========="
);

console.log(
  "CLIENT ID:",
  savedConfig.clientId
);

console.log(
  "PROJECT ID:",
  firebaseConfig.projectId
);

console.log(
  "API KEY EXISTS:",
  !!firebaseConfig.apiKey
);

console.log(
  "============================================"
);


const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


const firestore = getFirestore(app);


module.exports = {
  firestore,
};