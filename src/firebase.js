// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKFEvwlDxOgt23YG2A48hqGs9i3MShnro",
  authDomain: "cbt-app-34911.firebaseapp.com",
  projectId: "cbt-app-34911",
  storageBucket: "cbt-app-34911.firebasestorage.app",
  messagingSenderId: "409191800023",
  appId: "1:409191800023:web:d3ba05db0af2c071ba6492",
  measurementId: "G-XH3SZFX8B0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); //eslint-disable-next-line
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ✅ Export the database so it can be used elsewhere
export { db };
