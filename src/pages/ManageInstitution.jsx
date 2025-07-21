import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, CircularProgress, Snackbar, Alert
} from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const defaultSocials = {
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  website: ""
};

const ManageInstitution = () => {
  const [institution, setInstitution] = useState({
    id: "",
    name: "",
    logoUrl: "",
    primaryColor: "#0d47a1",
    socials: defaultSocials
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in defaultSocials) {
      setInstitution((prev) => ({
        ...prev,
        socials: { ...prev.socials, [name]: value }
      }));
    } else {
      setInstitution((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, ...data } = institution;
    if (!id || !data.name || !data.logoUrl) {
      return setSnackbar({ open: true, message: "Please fill all required fields.", severity: "error" });
    }

    setLoading(true);
    try {
      await setDoc(doc(db, "institutions", id), data);
      setSnackbar({ open: true, message: "Institution branding saved!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Error saving data.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3 }}>
      <Typography variant="h5" mb={2}>Manage Institution Branding</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Institution ID (e.g. bouesti)"
          name="id"
          value={institution.id}
          onChange={handleChange}
          required fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Institution Name"
          name="name"
          value={institution.name}
          onChange={handleChange}
          required fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Logo URL"
          name="logoUrl"
          value={institution.logoUrl}
          onChange={handleChange}
          required fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Primary Color"
          name="primaryColor"
          type="color"
          value={institution.primaryColor}
          onChange={handleChange}
          fullWidth sx={{ mb: 3 }}
        />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>Social Media Links (optional)</Typography>
        {Object.keys(defaultSocials).map((platform) => (
          <TextField
            key={platform}
            label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
            name={platform}
            value={institution.socials[platform]}
            onChange={handleChange}
            fullWidth sx={{ mb: 2 }}
          />
        ))}

        <Button
          variant="contained"
          fullWidth
          type="submit"
          disabled={loading}
          sx={{ py: 1.2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Save Branding"}
        </Button>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageInstitution;

