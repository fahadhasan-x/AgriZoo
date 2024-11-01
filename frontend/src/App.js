import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './pages/UserProfile';
import ZooShop from './pages/ZooShop';
import MyShop from './pages/MyShop';
import UserShop from './pages/UserShop';
import { Toaster } from 'react-hot-toast';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Toaster position="top-right" />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route path="/shop" element={<ZooShop />} />
              <Route
                path="/my-shop"
                element={
                  <PrivateRoute>
                    <MyShop />
                  </PrivateRoute>
                }
              />
              <Route path="/user-shop/:id" element={<UserShop />} />
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
