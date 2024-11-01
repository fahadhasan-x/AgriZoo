import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="AgriZoo Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="ml-3 text-2xl font-bold text-green-600">
                AgriZoo
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-green-600 px-3 py-2"
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className="text-gray-700 hover:text-green-600 px-3 py-2"
            >
              Zoo Shop
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-green-600 px-3 py-2"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-green-600 px-3 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
