import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./NavbarStyles.css";

/**
 * Navbar component - Fixed top navigation bar
 * Provides wayfinding and primary navigation for the application
 */
export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Left section - Home button */}
        <div className="navbar-left">
          <Link to="/" className="navbar-button navbar-home">
            Home
          </Link>
        </div>

        {/* Center section - Navigation links (when authenticated) */}
        {isAuthenticated && (
          <div className="navbar-center">
            <Link
              to="/"
              className={`navbar-link ${isActive("/") ? "active" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}
            >
              Dashboard
            </Link>
            <Link
              to="/applications/new"
              className={`navbar-link ${isActive("/applications/new") ? "active" : ""}`}
            >
              Add Application
            </Link>
          </div>
        )}

        {/* Right section - Auth controls */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="navbar-button logout">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="navbar-button login">
                Login
              </Link>
              <Link to="/register" className="navbar-button register">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
