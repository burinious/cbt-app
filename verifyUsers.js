// verifyUsers.js
const admin = require("firebase-admin");
const fs = require("fs");

// Load service account
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function verifyAndFixUsers() {
  const snapshot = await db.collection("users").get();

  console.log(`🔍 Found ${snapshot.size} users\n`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    const missing = [];

    // Check for required fields
    if (!data.studentId) {
      if (data.matric) {
        updates.studentId = data.matric; // Rename 'matric' to 'studentId'
        updates.matric = admin.firestore.FieldValue.delete();
      } else {
        missing.push("studentId");
      }
    }

    if (!data.name) missing.push("name");
    if (!data.password) missing.push("password");
    if (!data.role) updates.role = "user"; // default to student
    if (!data.department) missing.push("department");

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await db.collection("users").doc(doc.id).update(updates);
      console.log(`✅ Updated user ${doc.id}:`, updates);
    }

    // Report missing fields
    if (missing.length > 0) {
      console.warn(`⚠️ User ${doc.id} missing fields: ${missing.join(", ")}`);
    }
  }

  console.log("\n✅ Verification complete.");
}

verifyAndFixUsers().catch(console.error);
