const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
// If these variables are not needed, remove them:


// Or comment them out if you plan to use them later:
// const onRequest = functions.https.onRequest;
// const logger = functions.logger;


// Reset canteenCount every 5 seconds
exports.resetCanteenCount = functions.pubsub.schedule(
    "every 5 seconds").onRun(async (context) => {
  const usersSnapshot = await db.collection("users").get();
  usersSnapshot.forEach(async (doc) => {
    await doc.ref.update({
      canteenCount: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  console.log("canteenCount reset to 0 for all users");
});

// Reset studentCount every 5 minutes
exports.resetStudentCount = functions.pubsub.schedule(
    "every 5 minutes").onRun(async (context) => {
  const usersSnapshot = await db.collection("users").get();
  usersSnapshot.forEach(async (doc) => {
    await doc.ref.update({
      studentCount: 30,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  console.log("studentCount reset to 30 for all users");
});
