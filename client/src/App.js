import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';
import CreateGroup from './pages/CreateGroup';
import AddExpense from './pages/AddExpense';
import SettlePayments from './pages/SettlePayments';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Context
import { checkAuth } from './store/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  return (
    <>
      <Navigation />
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          
          <Route path="/" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/groups/create" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreateGroup />
            </ProtectedRoute>
          } />
          
          <Route path="/groups/:id" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <GroupDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/groups/:id/expenses/add" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AddExpense />
            </ProtectedRoute>
          } />
          
          <Route path="/groups/:id/settle" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SettlePayments />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
