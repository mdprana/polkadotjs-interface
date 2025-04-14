import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApi } from '../../context/ApiContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { isApiReady } = useApi();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-indigo-600 bg-clip-text text-transparent">
            Polkadot Interface
          </Link>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-1">
              <NavLink to="/" active={location.pathname === '/'}>
                Home
              </NavLink>
              <NavLink to="/chainstate" active={location.pathname === '/chainstate'}>
                ChainState
              </NavLink>
              <NavLink to="/extrinsics" active={location.pathname === '/extrinsics'}>
                Extrinsics
              </NavLink>
              <NavLink to="/transfer" active={location.pathname === '/transfer'}>
                Transfer
              </NavLink>
            </nav>
            
            <div className={`ml-4 px-3 py-1 rounded-full flex items-center text-sm font-medium ${
              isApiReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <span className={`h-2 w-2 rounded-full mr-2 ${isApiReady ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isApiReady ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;