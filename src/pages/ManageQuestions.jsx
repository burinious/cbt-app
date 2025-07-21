// src/pages/ManageQuestions.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
  Stack,
  Grid,
  Tooltip,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import AdminLayout from "../components/AdminLayout";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const location = useLocation();

  const fetchExams = async () => {
    const snap = await getDocs(collection(db, "exams"));
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setExams(data);

    const stateExamId = location?.state?.examId;
    if (stateExamId) {
      const matched = data.find((e) => e.id === stateExamId);
      if (matched) setSelectedExam(matched.id);
    }
  };

  const fetchQuestions = async () => {
    try {
      if (!selectedExam) {
        setQuestions([]);
        return;
      }

      const q = query(
        collection(db, "questions"),
        where("examId", "==", selectedExam),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(data);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to fetch questions");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteDoc(doc(db, "questions", id));
      toast.success("Question deleted");
      fetchQuestions();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedExam]);

  return (
    <AdminLayout>
      <Typography variant="h5" gutterBottom>
        Manage Questions
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Exam</InputLabel>
        <Select
          value={selectedExam}
          label="Select Exam"
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          {exams.map((exam) => (
            <MenuItem key={exam.id} value={exam.id}>
              {exam.code} - {exam.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!selectedExam ? (
        <Typography color="text.secondary">
          Please select an exam to view questions.
        </Typography>
      ) : questions.length === 0 ? (
        <Typography color="text.secondary">
          No questions found for this exam.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {questions.map((q, index) => (
            <Paper key={q.id} elevation={3} sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1">
                  {index + 1}. {q.question}
                </Typography>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton color="primary">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(q.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Grid container spacing={1}>
                {q.options?.map((opt, i) => {
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

              {q.points && (
                <Chip
                  label={`${q.points} point${q.points > 1 ? "s" : ""}`}
                  color="info"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </AdminLayout>
  );
};

export default ManageQuestions;
