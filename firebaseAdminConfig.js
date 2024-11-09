import admin from 'firebase-admin';
import serviceAccount from './fixaroo-ba396-firebase-adminsdk-cxgc4-73959738ae.json' assert { type: 'json' }; // Add the assertion here

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fixaroo-ba396-default-rtdb.asia-southeast1.firebasedatabase.app/' // Your Firebase database URL
});

const db = admin.database();

export default db;