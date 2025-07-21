const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function updateData() {
  const docRef = db.collection("users").doc("USER_ID"); // Replace USER_ID

  await docRef.update({
    name: "Updated Name",
    department: "New Department",
    extraTime: 10,
  });

  console.log("Document updated");
}

updateData().catch(console.error);
