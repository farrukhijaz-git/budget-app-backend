import admin from 'firebase-admin';
import path from 'path';

// You must download your Firebase service account key from the Firebase console
// and place it in the backend directory as serviceAccountKey.json
const serviceAccount = require('../../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
