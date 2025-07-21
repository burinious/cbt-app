import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useBranding } from "../context/BrandingContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const branding = useBranding();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("🔍 Attempting login with:", username);

    const success = await login(username.trim(), password.trim());
    setLoading(false);

    if (!success) {
      console.warn("❌ Login failed for:", username);
      setSnackbar({
        open: true,
        message: "Incorrect Student ID or Password.",
        severity: "error",
      });
    } else {
      const role = JSON.parse(localStorage.getItem("currentUser"))?.role;
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            p: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            color: "#fff",
            textAlign: "center",
          }}
        >
          {branding?.logoUrl && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <img src={branding.logoUrl} alt="Logo" style={{ height: 60 }} />
            </Box>
          )}

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {branding?.name || "CBT Portal"}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            Log in to access your dashboard
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              placeholder="Student ID or Username"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="filled"
              sx={{
                mb: 2,
                input: { color: "white" },
                "& .MuiFilledInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            />

            <TextField
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="filled"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "white" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                input: { color: "white" },
                "& .MuiFilledInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: "#ffffff",
                color: branding?.primaryColor || "#3f51b5",
                fontWeight: "bold",
                py: 1.2,
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
            </Button>

            <Link
              href="#"
              underline="hover"
              sx={{ display: "block", mt: 2, fontSize: "14px", color: "#ffffff" }}
            >
              Forgot Password? Contact Admin
            </Link>
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Login;
