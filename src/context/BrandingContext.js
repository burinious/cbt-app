import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const BrandingContext = createContext();
export const useBranding = () => useContext(BrandingContext);

const defaultBranding = {
  name: "CBT Portal",
  logoUrl: "/default_logo.png",
  primaryColor: "#1976d2",
  socials: {}, // fallback
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(defaultBranding);
  const institutionId = process.env.REACT_APP_INSTITUTION_ID || "bouesti";

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const ref = doc(db, "institutions", institutionId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBranding({ ...defaultBranding, ...snap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch branding:", err.message);
      }
    };
    fetchBranding();
  }, [institutionId]);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
};
