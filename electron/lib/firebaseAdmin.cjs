const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Same env variable used by Next.js
const relativePath =
  process.env.FIREBASE_ADMIN_CREDENTIALS_PATH;

const serviceAccountPath = path.join(
  process.cwd(),
  relativePath || 'firebase-service-account.json'
);

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf8')
  );

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminDb = getFirestore();

module.exports = { adminDb };