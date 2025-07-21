import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Alert } from "@mui/material";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Input,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const CSVUploadForm = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [examId, setExamId] = useState("");
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const snapshot = await getDocs(collection(db, "exams"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExams(data);
      } catch (err) {
        toast.error("Failed to fetch exams");
      }
    };
    fetchExams();
  }, []);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleDownloadSample = () => {
    const sample = `question,optionA,optionB,optionC,optionD,correctAnswer
What is React?,A CSS tool,A server,A JS library,A database,C
2 + 2 = ?,2,3,4,5,C`;

    const blob = new Blob([sample], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_questions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (!csvFile) {
      toast.error("Please select a CSV file.");
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const validRows = results.data.filter(
          (row) =>
            row.question &&
            row.optionA &&
            row.optionB &&
            row.optionC &&
            row.optionD &&
            ["A", "B", "C", "D"].includes(row.correctAnswer)
        );

        if (validRows.length === 0) {
          toast.error("CSV format is invalid or empty.");
          return;
        }

        setPreviewRows(validRows);
        toast.success(`Parsed ${validRows.length} questions`);
      },
      error: function () {
        toast.error("Failed to parse CSV.");
      },
    });
  };

  const handleUpload = async () => {
    if (previewRows.length === 0) {
      toast.warning("Please preview a valid CSV first.");
      return;
    }

    if (!examId) {
      toast.error("Please select an exam.");
      return;
    }

    try {
      let uploadedCount = 0;

      for (let row of previewRows) {
        const qSnap = await getDocs(
          query(
            collection(db, "questions"),
            where("question", "==", row.question.trim()),
            where("examId", "==", examId)
          )
        );

        if (!qSnap.empty) continue;

        await addDoc(collection(db, "questions"), {
          question: row.question,
          options: [row.optionA, row.optionB, row.optionC, row.optionD],
          correctAnswer: row.correctAnswer,
          examId,
          createdAt: serverTimestamp(),
        });

        uploadedCount++;
      }

      toast.success(`Uploaded ${uploadedCount} new questions.`);
      setCsvFile(null);
      setPreviewRows([]);
      setExamId("");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    }
  };

  return (
    <Box>
      <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Expected CSV headers:</strong><br />
          <code>question, optionA, optionB, optionC, optionD, correctAnswer</code>
        </Typography>
      </Alert>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Exam</InputLabel>
        <Select value={examId} onChange={(e) => setExamId(e.target.value)} required>
          <MenuItem value="">-- Choose Exam --</MenuItem>
          {exams.map((exam) => (
            <MenuItem key={exam.id} value={exam.id}>
              {exam.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <Button variant="outlined" onClick={handleDownloadSample}>
          Download Sample CSV
        </Button>

        <label htmlFor="csv-input">
          <Input
            id="csv-input"
            type="file"
            inputProps={{ accept: ".csv" }}
            onChange={handleFileChange}
            sx={{ display: "none" }}
          />
          <Button variant="contained" component="span">
            Choose File
          </Button>
        </label>

        <Button
          variant="contained"
          color="info"
          onClick={handlePreview}
          disabled={!csvFile}
        >
          Preview
        </Button>
      </Stack>

      {previewRows.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Question</TableCell>
                  <TableCell>Option A</TableCell>
                  <TableCell>Option B</TableCell>
                  <TableCell>Option C</TableCell>
                  <TableCell>Option D</TableCell>
                  <TableCell>Correct</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewRows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{row.question}</TableCell>
                    <TableCell>{row.optionA}</TableCell>
                    <TableCell>{row.optionB}</TableCell>
                    <TableCell>{row.optionC}</TableCell>
                    <TableCell>{row.optionD}</TableCell>
                    <TableCell>{row.correctAnswer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            color="success"
            onClick={handleUpload}
            fullWidth
          >
            Upload Questions
          </Button>
        </>
      )}
    </Box>
  );
};

export default CSVUploadForm;
