import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import ItineraryView from './pages/ItineraryView';
import Trips from './pages/Trips';
import Explore from './pages/Explore';
import PublicItinerary from './pages/PublicItinerary';
import Profile from './pages/Profile';
import Journal from './pages/Journal';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-blue-600">Checking Protocol...</div>;
  return token ? children : <Navigate to="/auth" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/create-trip" element={
        <PrivateRoute>
          <CreateTrip />
        </PrivateRoute>
      } />
      <Route path="/trip/:id" element={
        <PrivateRoute>
          <ItineraryView />
        </PrivateRoute>
      } />
      <Route path="/trips" element={
        <PrivateRoute>
          <Trips />
        </PrivateRoute>
      } />
      <Route path="/explore" element={<Explore />} />
      <Route path="/public/:slug" element={<PublicItinerary />} />
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
      <Route path="/journal" element={
        <PrivateRoute>
          <Journal />
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
