const fs = require('fs');
const path = require('path');
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// --------------------------------------------------
// Load .env.local manually (no dotenv package needed)
// --------------------------------------------------
 

const envPath = path.resolve(
  __dirname,
  '..',
  '..',
  '.env'
);

console.log('ENV PATH =>', envPath);
console.log('ENV EXISTS =>', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const lines = fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/);

  for (const line of lines) {
    if (
      !line ||
      line.startsWith('#')
    )
      continue;

    const idx = line.indexOf('=');

    if (idx === -1) continue;

    const key = line
      .slice(0, idx)
      .trim();

    const value = line
      .slice(idx + 1)
      .trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env
      .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log(
  'FIREBASE CONFIG =>',
  firebaseConfig
);

const app =
  getApps()[0] ||
  initializeApp(firebaseConfig);

const firestore = getFirestore(app);

module.exports = { firestore };