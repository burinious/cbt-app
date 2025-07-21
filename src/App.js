import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import AdminBoard from "./pages/AdminBoard";
import UploadQuestions from "./pages/UploadQuestions";
import ManageUsers from "./pages/ManageUsers";
import ManageDepartments from "./pages/ManageDepartments";
import ManageQuestions from "./pages/ManageQuestions";
import ManageStudents from "./pages/ManageStudents";
import AddStudent from "./pages/AddStudent";
import QuizPage from "./pages/QuizPage";
import ManageExams from "./pages/ManageExams";
import ViewExamQuestions from "./pages/ViewExamQuestions";
import StudentExamScreen from "./pages/StudentExamScreen";



const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={user ? (user.role === "admin" ? "/admin" : "/quiz") : "/login"} />
        }
      />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <AdminBoard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/upload-questions"
        element={
          <PrivateRoute role="admin">
            <UploadQuestions />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute role="admin">
            <ManageUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <PrivateRoute role="admin">
            <ManageQuestions />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <PrivateRoute role="admin">
            <ManageStudents />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/add-student"
        element={
          <PrivateRoute role="admin">
            <AddStudent />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <PrivateRoute role="admin">
            <ManageDepartments />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/exams"
        element={
          <PrivateRoute role="admin">
            <ManageExams />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/exams/:examId"
        element={
          <PrivateRoute role="admin">
            <ViewExamQuestions />
          </PrivateRoute>
        }
      />
      <Route
  path="/exam/:examId"
  element={
    <PrivateRoute role="user">
      <StudentExamScreen />
    </PrivateRoute>
  }
/>


      {/* Student Route */}
      <Route
        path="/quiz"
        element={
          <PrivateRoute role="user">
            <QuizPage />
          </PrivateRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
