import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import {
  People as PeopleIcon,
  QuestionAnswer as QuestionIcon,
  Assessment as AssessmentIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../components/AdminLayout";

const StatCard = ({ icon, label, value, color }) => (
  <Card sx={{ minWidth: 200, backgroundColor: color, color: "#fff" }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        {icon}
        <Box>
          <Typography variant="h6">{value}</Typography>
          <Typography variant="body2">{label}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminBoard = () => {
  const [stats, setStats] = useState({
    students: 0,
    questions: 0,
    attempts: 0,
    // Extend with more fields if needed
  });

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const studentCount = usersSnap.docs.filter(doc => doc.data().role === "user").length;

      const questionsSnap = await getDocs(collection(db, "questions"));
      const attemptsSnap = await getDocs(collection(db, "quizAttempts")); // Adjust if using subcollections

      setStats({
        students: studentCount,
        questions: questionsSnap.size,
        attempts: attemptsSnap.size,
      });
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <Typography variant="h5" mb={3}>Welcome to the Admin Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon fontSize="large" />}
            label="Total Students"
            value={stats.students}
            color="#1877F2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<QuestionIcon fontSize="large" />}
            label="Total Questions"
            value={stats.questions}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssessmentIcon fontSize="large" />}
            label="Total Quiz Attempts"
            value={stats.attempts}
            color="#F59E0B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TimerIcon fontSize="large" />}
            label="Live/Ongoing Quizzes"
            value="Coming Soon"
            color="#EF4444"
          />
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminBoard;
