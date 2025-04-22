import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaDiscord } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center">
              <img 
                src="/hackpub-logo.png" 
                alt="HackPub" 
                className="h-10 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }} 
              />
              <span className="text-2xl font-bold text-indigo-400 ml-2">HackPub</span>
            </Link>
            <p className="mt-3 text-gray-400 max-w-md">
              Your platform for discovering, participating in, and hosting amazing hackathons. 
              Connect with developers, showcase your skills, and build innovative solutions.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaGithub className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaDiscord className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/hackathons" className="text-gray-400 hover:text-white transition-colors">Explore Hackathons</Link>
              </li>
              <li>
                <Link to="/create-hackathon" className="text-gray-400 hover:text-white transition-colors">Host a Hackathon</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Guides</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} HackPub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 