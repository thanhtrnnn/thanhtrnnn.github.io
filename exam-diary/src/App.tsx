import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Exam from './pages/Exam';
import Result from './pages/Result';
import MyResults from './pages/MyResults';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import CreateExam from './pages/CreateExam';
import AdminStats from './pages/AdminStats';
import AdminStudentResults from './pages/AdminStudentResults';
import { initQuizanoData } from './lib/mockData';

export default function App() {
  // Initialize mock db once on app load
  useEffect(() => {
    initQuizanoData();
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Student Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student App */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/exam/:id" element={<Exam />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/my-results" element={<MyResults />} />

        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin App */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/exam/new" element={<CreateExam />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/results" element={<AdminStudentResults />} />
      </Routes>
    </Router>
  );
}
