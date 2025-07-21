// src/pages/AddStudent.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Papa from "papaparse";
import { toast } from "react-toastify";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../components/AdminLayout";

const AddStudent = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [student, setStudent] = useState({
    matric: "",
    name: "",
    department: "",
    password: "",
  });

  const [csvFile, setCsvFile] = useState(null);
  const [csvDept, setCsvDept] = useState("");
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const snap = await getDocs(collection(db, "departments"));
      setDepartments(snap.docs.map((doc) => doc.data().name));
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleAddSingle = async () => {
    const { matric, name, department, password } = student;
    if (!matric || !name || !department || !password) {
      toast.error("All fields are required.");
      return;
    }

    const exists = await getDocs(
      query(collection(db, "users"), where("matric", "==", matric))
    );

    if (!exists.empty) {
      toast.error("Matric number already exists.");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        matric,
        name,
        department,
        password,
        role: "user",
      });
      toast.success("Student added successfully!");
      setStudent({ matric: "", name: "", department: "", password: "" });
    } catch (err) {
      toast.error("Error adding student.");
    }
  };

  const handleCSVChange = (e) => setCsvFile(e.target.files[0]);

  const previewCSV = () => {
    if (!csvFile || !csvDept) return toast.error("File and department required.");

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        const matrics = rows.map((s) => s.matric);
        const q = query(collection(db, "users"), where("matric", "in", matrics));
        const existingSnap = await getDocs(q);

        const existingMatricSet = new Set(
          existingSnap.docs.map((doc) => doc.data().matric)
        );

        const valid = rows.filter(
          (s) =>
            s.matric &&
            s.name &&
            s.password &&
            !existingMatricSet.has(s.matric)
        );

        if (valid.length === 0) {
          toast.error("No valid rows. All matrics may be duplicates.");
          return;
        }

        const withDept = valid.map((s) => ({ ...s, department: csvDept }));
        setPreview(withDept);
        toast.success(`Previewing ${withDept.length} new students`);
      },
    });
  };

  const uploadCSV = async () => {
    try {
      const uploads = preview.map((s) =>
        addDoc(collection(db, "users"), {
          ...s,
          role: "user",
        })
      );
      await Promise.all(uploads);
      toast.success("Students uploaded!");
      setCsvFile(null);
      setCsvDept("");
      setPreview([]);
    } catch {
      toast.error("Upload failed.");
    }
  };

  const downloadSample = () => {
    const sample = `matric,name,password\n0001,Jane Doe,pass123`;
    const blob = new Blob([sample], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_students.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h5" gutterBottom>
          Add Students
        </Typography>

        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ mb: 3 }}>
          <Tab label="Single Entry" />
          <Tab label="Bulk Upload (CSV)" />
        </Tabs>

        {/* SINGLE ENTRY */}
        {tabIndex === 0 && (
          <Paper sx={{ p: 3, maxWidth: 500 }}>
            <Stack spacing={2}>
              <TextField label="Matric Number" name="matric" value={student.matric} onChange={handleChange} fullWidth />
              <TextField label="Full Name" name="name" value={student.name} onChange={handleChange} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={student.department}
                  label="Department"
                  onChange={handleChange}
                >
                  {departments.map((dept, i) => (
                    <MenuItem key={i} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Password" name="password" type="password" value={student.password} onChange={handleChange} fullWidth />
              <Button variant="contained" onClick={handleAddSingle}>
                Add Student
              </Button>
            </Stack>
          </Paper>
        )}

        {/* BULK UPLOAD */}
        {tabIndex === 1 && (
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2} direction={{ xs: "column", sm: "row" }} mb={2}>
              <Button onClick={downloadSample} variant="outlined">
                Download Sample CSV
              </Button>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Department</InputLabel>
                <Select
                  value={csvDept}
                  label="Select Department"
                  onChange={(e) => setCsvDept(e.target.value)}
                >
                  {departments.map((dept, i) => (
                    <MenuItem key={i} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <input type="file" accept=".csv" onChange={handleCSVChange} />
              <Button onClick={previewCSV} variant="contained" color="info">
                Preview
              </Button>
            </Stack>

            <Alert severity="info" sx={{ mb: 2 }}>
              Expected CSV headers: <code>matric, name, password</code>
              <br />
              Department will be set to: <strong>{csvDept || "None selected"}</strong>
            </Alert>

            {preview.length > 0 && (
              <>
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Matric</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Password</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{s.matric}</TableCell>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.department}</TableCell>
                          <TableCell>{s.password}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button variant="contained" color="success" onClick={uploadCSV}>
                  Upload to Firebase
                </Button>
              </>
            )}
          </Paper>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AddStudent;
