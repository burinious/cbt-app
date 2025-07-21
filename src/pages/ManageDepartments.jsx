import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "react-toastify";
import AdminLayout from "../components/AdminLayout";

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  // Fetch departments
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "departments"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDepartments(data);
    });

    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!newDept.trim()) return toast.error("Enter department name");

    try {
      await addDoc(collection(db, "departments"), {
        name: newDept.trim(),
      });
      setNewDept("");
      toast.success("Department added");
    } catch (err) {
      toast.error("Failed to add department");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "departments", id));
      toast.success("Department deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = async () => {
    if (!editName.trim()) return toast.error("Enter new name");

    try {
      await updateDoc(doc(db, "departments", editId), {
        name: editName.trim(),
      });
      toast.success("Updated");
      setEditId(null);
      setEditName("");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h5" gutterBottom>
        Manage Departments
      </Typography>

      {/* Add New Department */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          label="New Department Name"
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>
          Add Department
        </Button>
      </Stack>

      {/* Department Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((dept, i) => (
              <TableRow key={dept.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  {editId === dept.id ? (
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="small"
                    />
                  ) : (
                    dept.name
                  )}
                </TableCell>
                <TableCell>
                  {editId === dept.id ? (
                    <Button size="small" onClick={handleEdit}>
                      Save
                    </Button>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditId(dept.id);
                        setEditName(dept.name);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminLayout>
  );
};

export default ManageDepartments;
