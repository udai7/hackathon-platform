import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin, FaDiscord } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-dark border-t border-gray-800/50 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center group">
              <img
                src="/hackpub-logo.png"
                alt="HackPub"
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <span className="text-2xl font-bold gradient-text ml-2">
                HackPub
              </span>
            </Link>
            <p className="mt-3 text-gray-400 max-w-md leading-relaxed">
              Your platform for discovering, participating in, and hosting
              amazing hackathons. Connect with developers, showcase your skills,
              and build innovative solutions.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover:drop-shadow-lg"
              >
                <FaGithub className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover:drop-shadow-lg"
              >
                <FaTwitter className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 hover:drop-shadow-lg"
              >
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110 hover:drop-shadow-lg"
              >
                <FaDiscord className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 neon-blue">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/hackathons"
                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1"
                >
                  Explore Hackathons
                </Link>
              </li>
              <li>
                <Link
                  to="/create-hackathon"
                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1"
                >
                  Host a Hackathon
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-1"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4 neon-purple">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1"
                >
                  Guides
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear}{" "}
            <span className="gradient-text font-semibold">HackPub</span>. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
