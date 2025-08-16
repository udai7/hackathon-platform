import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="nav-glass sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <img
                className="block h-8 w-auto transition-transform duration-300 group-hover:scale-110"
                src="/hackpub-logo.png"
                alt="HackPub Platform"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <span className="ml-2 text-xl font-bold gradient-text">
                HackPub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                location.pathname === "/"
                  ? "text-blue-400 neon-blue"
                  : "text-gray-300 hover:text-blue-400"
              }`}
            >
              Home
            </Link>
            <Link
              to="/hackathons"
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                location.pathname === "/hackathons"
                  ? "text-blue-400 neon-blue"
                  : "text-gray-300 hover:text-blue-400"
              }`}
            >
              Explore Hackathons
            </Link>
            <Link
              to="/participants"
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                location.pathname === "/participants"
                  ? "text-blue-400 neon-blue"
                  : "text-gray-300 hover:text-blue-400"
              }`}
            >
              Explore Participants
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    location.pathname === "/dashboard"
                      ? "text-blue-400 neon-blue"
                      : "text-gray-300 hover:text-blue-400"
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === "host" && (
                  <Link
                    to="/create-hackathon"
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      location.pathname === "/create-hackathon"
                        ? "text-blue-400 neon-blue"
                        : "text-gray-300 hover:text-blue-400"
                    }`}
                  >
                    Host a Hackathon
                  </Link>
                )}
                <Button
                  onClick={logout}
                  variant="glass"
                  size="sm"
                  className="ml-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-blue-400 font-medium px-3 py-2 text-sm transition-all duration-200 hover:scale-105"
                >
                  Log in
                </Link>
                <Button asChild variant="cyber" size="sm">
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 focus:outline-none transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden glass-dark border-t border-gray-800/50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                location.pathname === "/"
                  ? "text-blue-400 bg-blue-500/10 neon-border"
                  : "text-gray-300 hover:text-blue-400 hover:bg-gray-800/50"
              }`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/hackathons"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                location.pathname === "/hackathons"
                  ? "text-blue-400 bg-blue-500/10 neon-border"
                  : "text-gray-300 hover:text-blue-400 hover:bg-gray-800/50"
              }`}
              onClick={closeMenu}
            >
              Explore Hackathons
            </Link>
            <Link
              to="/participants"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                location.pathname === "/participants"
                  ? "text-blue-400 bg-blue-500/10 neon-border"
                  : "text-gray-300 hover:text-blue-400 hover:bg-gray-800/50"
              }`}
              onClick={closeMenu}
            >
              Explore Participants
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    location.pathname === "/dashboard"
                      ? "text-blue-400 bg-blue-500/10 neon-border"
                      : "text-gray-300 hover:text-blue-400 hover:bg-gray-800/50"
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                {user.role === "host" && (
                  <Link
                    to="/create-hackathon"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      location.pathname === "/create-hackathon"
                        ? "text-blue-400 bg-blue-500/10 neon-border"
                        : "text-gray-300 hover:text-blue-400 hover:bg-gray-800/50"
                    }`}
                    onClick={closeMenu}
                  >
                    Host a Hackathon
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    location.pathname === "/login"
                      ? "text-blue-400 bg-blue-500/10 neon-border"
                      : "text-gray-300 hover:text-blue-400 hover:bg-gray-800/50"
                  }`}
                  onClick={closeMenu}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    location.pathname === "/register"
                      ? "text-blue-400 bg-blue-500/10 neon-border"
                      : "text-gray-300 hover:text-blue-400 hover:bg-gray-800/50"
                  }`}
                  onClick={closeMenu}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
