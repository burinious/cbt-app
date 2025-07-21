// src/pages/StudentExamScreen.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Stack,
} from "@mui/material";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const StudentExamScreen = () => {
  const { user } = useAuth();
  const { examId } = useParams(); // get exam ID from route
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examMeta, setExamMeta] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const questionsPerPage = 5;
  const navigate = useNavigate();

  // Fetch questions for selected exam
  useEffect(() => {
    const fetchData = async () => {
      if (!examId) return;
      const qSnap = await getDocs(
        query(
          collection(db, "questions"),
          where("examId", "==", examId),
          orderBy("createdAt")
        )
      );
      const data = qSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(data);

      const examRef = doc(db, "exams", examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        const meta = examSnap.data();
        setExamMeta(meta);
        setTimeLeft(meta.duration * 60); // duration in minutes
      }
    };
    fetchData();
  }, [examId]);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Save answer to Firestore instantly
  const handleAnswer = async (questionId, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    const ref = doc(
      db,
      `students/${user.uid}/answers/${examId}_q_${questionId}`
    );
    await setDoc(ref, {
      studentId: user.uid,
      examId,
      questionId,
      answer: selectedOption,
      timestamp: new Date(),
    });
  };

  // Pagination
  const pageQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* LEFT: Student Info */}
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Student Info</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Name: {user?.displayName}</Typography>
              <Typography>Email: {user?.email}</Typography>
              <Typography>Department: {user?.department || "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CENTER: Questions */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Questions {currentPage * questionsPerPage + 1} -{" "}
                {(currentPage + 1) * questionsPerPage}
              </Typography>
              {pageQuestions.map((q, index) => (
                <Box key={q.id} sx={{ mb: 3 }}>
                  <Typography>
                    {currentPage * questionsPerPage + index + 1}. {q.question}
                  </Typography>
                  <RadioGroup
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                  >
                    {q.options.map((opt, i) => (
                      <FormControlLabel
                        key={i}
                        value={["A", "B", "C", "D"][i]}
                        control={<Radio />}
                        label={`${["A", "B", "C", "D"][i]}. ${opt}`}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              ))}

              {/* Pagination */}
              <Stack direction="row" justifyContent="space-between">
                <Button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  disabled={(currentPage + 1) * questionsPerPage >= questions.length}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: Timer & Stats */}
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Exam Info</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>Time Left: {formatTime(timeLeft)}</Typography>
              <Typography>Questions: {questions.length}</Typography>
              <Typography>Answered: {Object.keys(answers).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentExamScreen;
