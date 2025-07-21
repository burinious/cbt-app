import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { toast } from "react-toastify";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const BulkEntryForm = () => {
  const [examId, setExamId] = useState("");
  const [exams, setExams] = useState([]);
  const [bulkData, setBulkData] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const snapshot = await getDocs(collection(db, "exams"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExams(data);
      } catch (error) {
        toast.error("Failed to fetch exams.");
      }
    };

    fetchExams();
  }, []);

  const handleChange = (index, field, value) => {
    const newData = [...bulkData];
    newData[index][field] = value;
    setBulkData(newData);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newData = [...bulkData];
    newData[qIndex].options[oIndex] = value;
    setBulkData(newData);
  };

  const addNewQuestion = () => {
    setBulkData([...bulkData, { question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  const removeQuestion = (index) => {
    const newData = [...bulkData];
    newData.splice(index, 1);
    setBulkData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!examId) {
      toast.error("Please select an exam.");
      return;
    }

    const invalid = bulkData.some(
      (q) =>
        !q.question ||
        q.options.some((opt) => !opt) ||
        !["A", "B", "C", "D"].includes(q.correctAnswer)
    );

    if (invalid) {
      toast.error("Please fill all fields for each question.");
      return;
    }

    try {
      const promises = bulkData.map((q) =>
        addDoc(collection(db, "questions"), {
          ...q,
          examId,
          createdAt: serverTimestamp(),
        })
      );

      await Promise.all(promises);
      toast.success("Questions uploaded!");
      setBulkData([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
      setExamId("");
    } catch (err) {
      toast.error("Failed to upload questions.");
      console.error(err);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Bulk Entry of Questions
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Exam</InputLabel>
          <Select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            required
          >
            <MenuItem value="">-- Choose Exam --</MenuItem>
            {exams.map((exam) => (
              <MenuItem key={exam.id} value={exam.id}>
                {exam.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {bulkData.map((q, index) => (
          <Box key={index} sx={{ mb: 4, borderBottom: "1px dashed #ccc", pb: 2 }}>
            <Typography variant="subtitle2">Question {index + 1}</Typography>

            <TextField
              label="Question"
              fullWidth
              multiline
              rows={2}
              required
              value={q.question}
              onChange={(e) => handleChange(index, "question", e.target.value)}
              sx={{ mt: 1, mb: 2 }}
            />

            <Stack spacing={2}>
              {["A", "B", "C", "D"].map((label, optIdx) => (
                <TextField
                  key={optIdx}
                  label={`Option ${label}`}
                  fullWidth
                  required
                  value={q.options[optIdx]}
                  onChange={(e) => handleOptionChange(index, optIdx, e.target.value)}
                />
              ))}

              <FormControl fullWidth>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={q.correctAnswer}
                  onChange={(e) => handleChange(index, "correctAnswer", e.target.value)}
                  required
                >
                  <MenuItem value="">Select Correct Option</MenuItem>
                  {["A", "B", "C", "D"].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {bulkData.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => removeQuestion(index)}
              >
                Remove Question
              </Button>
            )}
          </Box>
        ))}

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={addNewQuestion}>
            Add Another
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Submit All
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default BulkEntryForm;
