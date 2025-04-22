import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="block h-8 w-auto"
                src="/hackpub-logo.png"
                alt="HackPub Platform"
                style={{ filter: 'brightness(0) saturate(100%) invert(24%) sepia(90%) saturate(1922%) hue-rotate(235deg) brightness(96%) contrast(94%)' }}
              />
              <span className="ml-2 text-xl font-bold text-indigo-600">
                HackPub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium ${
                location.pathname === "/"
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Home
            </Link>
            <Link
              to="/hackathons"
              className={`px-3 py-2 text-sm font-medium ${
                location.pathname === "/hackathons"
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Explore Hackathons
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 text-sm font-medium ${
                    location.pathname === "/dashboard"
                      ? "text-indigo-600"
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === "host" && (
                  <Link
                    to="/create-hackathon"
                    className={`px-3 py-2 text-sm font-medium ${
                      location.pathname === "/create-hackathon"
                        ? "text-indigo-600"
                        : "text-gray-700 hover:text-indigo-600"
                    }`}
                  >
                    Host a Hackathon
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="ml-2 px-4 py-2 bg-indigo-100 text-indigo-600 font-medium rounded-md text-sm hover:bg-indigo-200 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white rounded-md font-medium px-4 py-2 text-sm hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none"
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === "/"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              }`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/hackathons"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === "/hackathons"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              }`}
              onClick={closeMenu}
            >
              Explore Hackathons
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === "/dashboard"
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                {user.role === "host" && (
                  <Link
                    to="/create-hackathon"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === "/create-hackathon"
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
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
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === "/login"
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                  onClick={closeMenu}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === "/register"
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
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
