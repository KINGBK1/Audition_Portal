import { FaHome, FaUser, FaCog } from 'react-icons/fa';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-xl">GLUG Auditions</div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-blue-400 transition-colors duration-200">
              <FaHome className="inline-block mr-1" /> Home
            </a>
            <a href="#" className="text-white hover:text-blue-400 transition-colors duration-200">
              <FaUser className="inline-block mr-1" /> Profile
            </a>
            <a href="#" className="text-white hover:text-blue-400 transition-colors duration-200">
              <FaCog className="inline-block mr-1" /> Settings
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

