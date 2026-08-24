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


 
  const firebaseConfig = {
  apiKey:
    savedConfig?.apiKey ||
    'AIzaSyAOFaFrogsiaUYjfRb8nqYogrfrfw0AWzY',

  authDomain:
    savedConfig?.authDomain ||
    'food-demo-d69f0.firebaseapp.com',

  databaseURL:
    savedConfig?.databaseURL ||
    '',

  projectId:
    savedConfig?.projectId ||
    'food-demo-d69f0',

  storageBucket:
    savedConfig?.storageBucket ||
    'food-demo-d69f0.firebasestorage.app',

  messagingSenderId:
    savedConfig?.messagingSenderId ||
    '694719081868',

  appId:
    savedConfig?.appId ||
    '1:694719081868:web:c9ad72f4238f48c5fbbaa9',

  measurementId:
    savedConfig?.measurementId ||
    'G-RYLQPYK7T4',
};




const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


const firestore = getFirestore(app);


module.exports = {
  firestore,
};