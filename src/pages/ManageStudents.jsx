// src/pages/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete, AccessTime, Search } from "@mui/icons-material";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [editing, setEditing] = useState(null);
  const [extraTimeDialog, setExtraTimeDialog] = useState({ open: false, id: null });
  const [extraTime, setExtraTime] = useState("");

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === "user");
      setStudents(data);
      setFiltered(data);
    } catch (error) {
      toast.error("Failed to fetch students");
    }
  };

  const fetchDepartments = async () => {
    const snap = await getDocs(collection(db, "departments"));
    setDepartments(snap.docs.map((doc) => doc.data().name));
  };

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filter = students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.matric.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept ? s.department === selectedDept : true;
      return matchesSearch && matchesDept;
    });
    setFiltered(filter);
  }, [searchTerm, selectedDept, students]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("Student deleted");
      fetchStudents();
    } catch (err) {
      toast.error("Error deleting student");
    }
  };

  const handleEditSave = async () => {
    try {
      await updateDoc(doc(db, "users", editing.id), {
        name: editing.name,
        matric: editing.matric,
        department: editing.department,
      });
      toast.success("Student updated");
      setEditing(null);
      fetchStudents();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleExtraTimeSave = async () => {
    try {
      await updateDoc(doc(db, "users", extraTimeDialog.id), {
        extraTime: Number(extraTime),
      });
      toast.success("Extra time added");
      setExtraTimeDialog({ open: false, id: null });
      setExtraTime("");
    } catch (err) {
      toast.error("Failed to add extra time");
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h5" gutterBottom>
        Manage Students
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          placeholder="Search by name or matric"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Filter by Department</InputLabel>
          <Select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            label="Filter by Department"
          >
            <MenuItem value="">All</MenuItem>
            {departments.map((dept, i) => (
              <MenuItem key={i} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Matric No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.matric}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell>
                  <IconButton onClick={() => setEditing(student)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(student.id)} color="error">
                    <Delete />
                  </IconButton>
                  <IconButton
                    onClick={() => setExtraTimeDialog({ open: true, id: student.id })}
                    color="secondary"
                  >
                    <AccessTime />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onClose={() => setEditing(null)}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Matric Number"
              value={editing?.matric || ""}
              onChange={(e) => setEditing({ ...editing, matric: e.target.value })}
              fullWidth
            />
            <TextField
              label="Name"
              value={editing?.name || ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Department"
              value={editing?.department || ""}
              onChange={(e) => setEditing({ ...editing, department: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extra Time Dialog */}
      <Dialog open={extraTimeDialog.open} onClose={() => setExtraTimeDialog({ open: false, id: null })}>
        <DialogTitle>Grant Extra Time</DialogTitle>
        <DialogContent>
          <TextField
            label="Extra Time (in minutes)"
            type="number"
            value={extraTime}
            onChange={(e) => setExtraTime(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtraTimeDialog({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleExtraTimeSave} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default ManageStudents;
