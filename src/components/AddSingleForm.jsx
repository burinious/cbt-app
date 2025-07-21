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
} from "@mui/material";
import { toast } from "react-toastify";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const AddSingleForm = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [examId, setExamId] = useState("");

  const [exams, setExams] = useState([]);

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

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!examId || !question || options.some((opt) => !opt) || !correctAnswer) {
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "questions"), {
        question,
        options,
        correctAnswer,
        examId,
        createdAt: serverTimestamp(),
      });

      toast.success("Question saved to Firebase!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setExamId("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save question.");
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Single Question
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Exam</InputLabel>
          <Select
            value={examId}
            label="Select Exam"
            onChange={(e) => setExamId(e.target.value)}
            required
          >
            <MenuItem value="">-- Choose an exam --</MenuItem>
            {exams.map((exam) => (
              <MenuItem key={exam.id} value={exam.id}>
                {exam.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Question"
          multiline
          rows={3}
          fullWidth
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          sx={{ mb: 2 }}
        />

        {["A", "B", "C", "D"].map((label, index) => (
          <TextField
            key={index}
            label={`Option ${label}`}
            fullWidth
            required
            value={options[index]}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            sx={{ mb: 2 }}
          />
        ))}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="correct-answer-label">Correct Answer</InputLabel>
          <Select
            labelId="correct-answer-label"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            label="Correct Answer"
            required
          >
            <MenuItem value="">Select correct option</MenuItem>
            {["A", "B", "C", "D"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Save Question
        </Button>
      </Box>
    </Paper>
  );
};

export default AddSingleForm;
