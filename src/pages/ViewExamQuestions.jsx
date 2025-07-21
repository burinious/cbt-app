// src/pages/ViewExamQuestions.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  Divider,
  Grid,
  Tooltip,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";

const ViewExamQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const fetchExamAndQuestions = async () => {
    try {
      setLoading(true);
      const examSnap = await getDoc(doc(db, "exams", examId));
      if (!examSnap.exists()) {
        toast.error("Exam not found");
        navigate("/admin/exams");
        return;
      }

      setExam({ id: examSnap.id, ...examSnap.data() });

      const q = query(
        collection(db, "questions"),
        where("examId", "==", examId),
        orderBy("createdAt", "desc")
      );
      const qSnap = await getDocs(q);
      const qList = qSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(qList);
    } catch (err) {
      toast.error("Failed to load exam data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteDoc(doc(db, "questions", id));
      toast.success("Question deleted");
      fetchExamAndQuestions();
    } catch {
      toast.error("Delete failed");
    }
  };

  const openEditDialog = (question) => {
    setCurrentQuestion({ ...question });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setCurrentQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleSaveUpdate = async () => {
    const { id, question, options, correctAnswer } = currentQuestion;

    if (!question || options.some((opt) => !opt) || !correctAnswer) {
      toast.error("Please complete all fields");
      return;
    }

    try {
      await updateDoc(doc(db, "questions", id), {
        question,
        options,
        correctAnswer,
      });
      toast.success("Question updated");
      setEditDialogOpen(false);
      fetchExamAndQuestions();
    } catch {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    fetchExamAndQuestions();
    // eslint-disable-next-line
  }, [examId]);

  if (loading) {
    return (
      <AdminLayout>
        <Box textAlign="center" mt={5}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Typography variant="h5" gutterBottom>
        {exam?.code} - {exam?.title}
      </Typography>

      {questions.length === 0 ? (
        <Typography>No questions found.</Typography>
      ) : (
        <Stack spacing={2}>
          {questions.map((q, index) => (
            <Paper key={q.id} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>
                  {index + 1}. {q.question}
                </Typography>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openEditDialog(q)} color="primary">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(q.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={1}>
                {q.options.map((opt, i) => {
                  const labels = ["A", "B", "C", "D"];
                  const isCorrect = q.correctAnswer === labels[i];
                  return (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: isCorrect ? "success.light" : "grey.100",
                          border: isCorrect
                            ? "2px solid #4caf50"
                            : "1px solid #ddd",
                        }}
                      >
                        <Typography variant="body2">
                          <strong>{labels[i]}.</strong> {opt}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Edit Question Modal */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Question"
              multiline
              fullWidth
              value={currentQuestion?.question || ""}
              onChange={(e) => handleEditChange("question", e.target.value)}
            />
            {["A", "B", "C", "D"].map((label, index) => (
              <TextField
                key={index}
                label={`Option ${label}`}
                fullWidth
                value={currentQuestion?.options?.[index] || ""}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
            ))}
            <FormControl fullWidth>
              <InputLabel>Correct Answer</InputLabel>
              <Select
                value={currentQuestion?.correctAnswer || ""}
                onChange={(e) => handleEditChange("correctAnswer", e.target.value)}
                label="Correct Answer"
              >
                {["A", "B", "C", "D"].map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUpdate}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default ViewExamQuestions;
