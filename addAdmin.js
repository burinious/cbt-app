// addAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const addAdmin = async () => {
  await db.collection("users").add({
    studentId: "admin",
    password: "admin123",
    role: "admin",
    name: "Super Admin",
    department: "Admin",
  });
  console.log("✅ Admin user added");
};

addAdmin();
