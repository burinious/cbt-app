import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Stack,
  IconButton,
  Button,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Delete,
  Edit,
  Visibility,
  Add,
  Search,
} from "@mui/icons-material";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ code: "", title: "" });
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const qSnap = await getDocs(query(collection(db, "exams"), orderBy("createdAt", "desc")));
      const data = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(data);
    } catch (err) {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openDialog = (exam = null) => {
    if (exam) {
      setForm({ code: exam.code || "", title: exam.title || "" });
      setEditId(exam.id);
    } else {
      setForm({ code: "", title: "" });
      setEditId(null);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const code = form.code.trim();
    const title = form.title.trim();

    if (!code || !title) {
      toast.error("All fields required");
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "exams", editId), { code, title });
        toast.success("Exam updated");
      } else {
        await addDoc(collection(db, "exams"), {
          code,
          title,
          createdAt: serverTimestamp(),
          visible: false,
          allowReview: false,
          allowResult: false,
        });
        toast.success("Exam created");
      }
      setDialogOpen(false);
      fetchExams();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const toggleSwitch = async (id, field, currentVal) => {
    try {
      await updateDoc(doc(db, "exams", id), { [field]: !currentVal });
      fetchExams();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exam and its questions?")) return;
    try {
      await deleteDoc(doc(db, "exams", id));
      toast.success("Exam deleted");
      fetchExams();
    } catch (err) {
      toast.error("Failed to delete exam");
    }
  };

  const filtered = exams.filter((e) =>
    (e.code?.toLowerCase().includes(search.toLowerCase()) ||
     e.title?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <Box>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Manage Exams</Typography>
          <Button startIcon={<Add />} variant="contained" onClick={() => openDialog()}>
            Add Exam
          </Button>
        </Stack>

        <TextField
          placeholder="Search exams"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {filtered.length > 0 ? (
              filtered.map((exam) => (
                <Paper key={exam.id} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography fontWeight="bold">
                        {exam.code} - {exam.title}
                      </Typography>
                      <Stack direction="row" spacing={3} mt={1}>
                        <Typography variant="body2">
                          <Switch
                            checked={!!exam.visible}
                            onChange={() => toggleSwitch(exam.id, "visible", exam.visible)}
                            size="small"
                          /> Visibility
                        </Typography>
                        <Typography variant="body2">
                          <Switch
                            checked={!!exam.allowReview}
                            onChange={() => toggleSwitch(exam.id, "allowReview", exam.allowReview)}
                            size="small"
                          /> Allow Review
                        </Typography>
                        <Typography variant="body2">
                          <Switch
                            checked={!!exam.allowResult}
                            onChange={() => toggleSwitch(exam.id, "allowResult", exam.allowResult)}
                            size="small"
                          /> Allow Result
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit Exam">
                        <IconButton onClick={() => openDialog(exam)} color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Questions">
                        <IconButton onClick={() => navigate(`/admin/exams/${exam.id}`)} color="success">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Exam">
                        <IconButton onClick={() => handleDelete(exam.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" align="center" mt={4}>
                No exams found.
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>{editId ? "Edit Exam" : "Add Exam"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Course Code (e.g., CSC101)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              fullWidth
            />
            <TextField
              label="Course Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default ManageExams;
