import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddSingleForm from "../components/AddSingleForm";
import BulkEntryForm from "../components/BulkEntryForm";
import CSVUploadForm from "../components/CSVUploadForm";
import AdminLayout from "../components/AdminLayout";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const UploadQuestions = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const fetchExams = async () => {
      const querySnapshot = await getDocs(collection(db, "exams"));
      const examList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExams(examList);
    };
    fetchExams();
  }, []);

  return (
    <AdminLayout>
      <Typography variant="h5" gutterBottom>
        Upload Questions
      </Typography>

      <Card elevation={2}>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Exam</InputLabel>
            <Select
              value={selectedExam}
              label="Select Exam"
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              {exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.title} ({exam.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
            aria-label="Upload question methods"
            sx={{ mb: 2 }}
          >
            <Tab label="Add Single" />
            <Tab label="Bulk Entry" />
            <Tab label="CSV Upload" />
          </Tabs>
          <Divider />

          {!selectedExam ? (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Please select an exam to begin uploading questions.
            </Typography>
          ) : (
            <>
              <TabPanel value={tabIndex} index={0}>
                <AddSingleForm selectedExamId={selectedExam} />
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                <BulkEntryForm selectedExamId={selectedExam} />
              </TabPanel>
              <TabPanel value={tabIndex} index={2}>
                <CSVUploadForm selectedExamId={selectedExam} />
              </TabPanel>
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default UploadQuestions;
