const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

// Reset canteenCount to 0 every 5 seconds
exports.resetCanteenCount = functions.pubsub
  .schedule('every 5 seconds')
  .onRun(async () => {
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(async (doc) => {
      await doc.ref.update({
        canteenCount: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    console.log('canteenCount reset to 0');
  });

// Reset studentCount to 30 every 5 minutes
exports.resetStudentCount = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(async (doc) => {
      await doc.ref.update({
        studentCount: 30,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    console.log('studentCount reset to 30');
  });
