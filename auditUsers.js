const admin = require("firebase-admin");
const fs = require("fs");

// 🔐 Path to your downloaded service account JSON key
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const runAudit = async () => {
  console.log("🔍 Auditing users...");

  const usersRef = db.collection("users");
  const snapshot = await usersRef.get();

  const fixes = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const missing = [];

    if (!data.studentId && data.matric) {
      missing.push("🔁 Rename matric to studentId");
    } else if (!data.studentId) {
      missing.push("❌ Missing studentId");
    }

    if (!data.password) missing.push("❌ Missing password");
    if (!data.role) missing.push("❌ Missing role");

    if (missing.length > 0) {
      console.log(`🧾 User ${doc.id}:`, missing.join(", "));

      // Queue a fix if safe
      const fixData = {};
      if (data.matric && !data.studentId) fixData.studentId = data.matric;
      if (!data.role) fixData.role = "user";
      if (Object.keys(fixData).length > 0) {
        fixes.push({ id: doc.id, fixData });
      }
    }
  });

  // Optional: apply fixes
  if (fixes.length > 0) {
    console.log(`\n🛠️ Applying ${fixes.length} safe fixes...\n`);
    for (const { id, fixData } of fixes) {
      await db.collection("users").doc(id).update(fixData);
      console.log(`✔️ Updated user ${id} with`, fixData);
    }
  } else {
    console.log("✅ No fixes needed. All good!");
  }

  console.log("\n🚀 Audit complete.\n");
};

runAudit();
