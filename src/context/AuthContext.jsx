import React, { createContext, useContext, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (usernameOrId, password) => {
    try {
      console.log("🔍 Attempting login with:", usernameOrId);

      // Try with studentId
      let q = query(collection(db, "users"), where("studentId", "==", usernameOrId));
      let snapshot = await getDocs(q);

      // If no result, try with username
      if (snapshot.empty) {
        console.log("🔁 No match for studentID. Trying 'username' instead...");
        q = query(collection(db, "users"), where("username", "==", usernameOrId));
        snapshot = await getDocs(q);
      }

      if (snapshot.empty) {
        console.log("❌ User not found for any field");
        return false;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // Validate password (plain text check for now)
      if (userData.password !== password) {
        console.log("❌ Incorrect password");
        return false;
      }

      // Set current user in context
      setCurrentUser({ id: userDoc.id, ...userData });

      console.log("✅ Login successful:", userData.username || userData.studentId);
      return true;
    } catch (error) {
      console.error("🔥 Login error:", error.message);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    console.log("👋 User logged out.");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
