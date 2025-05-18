import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Activity, BarChart2, Home, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <Link to="/" className="text-xl font-bold">my project</Link>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-white/80 transition-colors">
              <span className="flex items-center gap-2">
                <Home size={18} />
                <span>Home</span>
              </span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/channels" className="hover:text-white/80 transition-colors">
                  <span className="flex items-center gap-2">
                    <BarChart2 size={18} />
                    <span>My Channels</span>
                  </span>
                </Link>
                <Link to="/profile" className="hover:text-white/80 transition-colors">
                  <span className="flex items-center gap-2">
                    <User size={18} />
                    <span>Profile</span>
                  </span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:text-white/80 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-white/80 transition-colors">Login</Link>
                <Link 
                  to="/register"
                  className="bg-white text-primary px-4 py-2 rounded-md hover:bg-white/90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/channels" 
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart2 size={18} />
                  <span>My Channels</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 text-left w-full hover:bg-gray-100 rounded-md"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="p-2 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="bg-primary text-white p-2 rounded-md text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Iot</h3>
              <p className="text-gray-300">
                An IoT analytics platform for collecting, visualizing, and analyzing live data streams.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link to="/channels" className="text-gray-300 hover:text-white">Channels</Link></li>
                <li><Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                Questions or feedback? Email us at support@thingspeakclone.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© {new Date().getFullYear()} ThingSpeak Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;