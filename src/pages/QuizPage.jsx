// src/pages/QuizPage.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const QuizPage = () => {
  const { logout, user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, "questions"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(data);
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (qid, selected) => {
    setAnswers({ ...answers, [qid]: selected });
  };

  const handleSubmit = () => {
    let correct = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);
    toast.success(`You scored ${correct}/${questions.length}`);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Welcome, {user?.username}</h4>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>

      {!submitted ? (
        <>
          {questions.map((q, i) => (
            <div key={q.id} className="card mb-4">
              <div className="card-header">
                Question {i + 1}
              </div>
              <div className="card-body">
                <p>{q.question}</p>
                {q.options.map((opt, idx) => {
                  const optionKey = String.fromCharCode(65 + idx); // A, B, C, D
                  return (
                    <div className="form-check" key={idx}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`q-${q.id}`}
                        id={`${q.id}-${optionKey}`}
                        value={optionKey}
                        checked={answers[q.id] === optionKey}
                        onChange={() => handleAnswer(q.id, optionKey)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`${q.id}-${optionKey}`}
                      >
                        {optionKey}. {opt}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button className="btn btn-success" onClick={handleSubmit}>
            Submit Quiz
          </button>
        </>
      ) : (
        <div className="alert alert-success">
          <h5>Quiz Completed</h5>
          <p>Your Score: {score} / {questions.length}</p>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
