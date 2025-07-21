const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🧹 Delete documents from a collection, with optional filter
async function clearCollection(collectionName, filterFn = null) {
  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`✅ ${collectionName} is already empty.`);
    return;
  }

  const batch = db.batch();
  let deleteCount = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const shouldDelete = filterFn ? filterFn(data) : true;

    if (shouldDelete) {
      batch.delete(doc.ref);
      deleteCount++;
    }
  });

  await batch.commit();
  console.log(`🗑️ Cleared ${deleteCount} document(s) from "${collectionName}".`);
}

async function runClear() {
  // Keep superadmin (identified by studentID === 'superadmin')
  await clearCollection("users", (data) => data.studentID !== "superadmin");

  // Clear other collections entirely
  await clearCollection("questions");
  await clearCollection("departments");

  console.log("🚨 Cleanup completed.");
}

runClear().catch((err) => {
  console.error("❌ Failed to clear:", err);
});
