const admin = require("firebase-admin");
const serviceAccount = require("./path-to-your-serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function renameField() {
  const usersRef = db.collection("users");
  const snapshot = await usersRef.get();

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.matric) {
      const docRef = usersRef.doc(doc.id);
      batch.update(docRef, {
        studentId: data.matric,
        matric: admin.firestore.FieldValue.delete()
      });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Updated ${count} users.`);
  } else {
    console.log("No users needed updating.");
  }
}

renameField().catch(console.error);
