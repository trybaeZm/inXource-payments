import React, { useState } from "react"; 
import { motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import Logo from '../assets/img/InXource.png'

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  // Define links with section IDs
  const navLinks = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Services", id: "services" },
    { name: "Pricing", id: "pricing" },
    { name: "Portfolio", id: "portfolio" },
    { name: "Contact Us", id: "contact" },
  ];

  const handleScroll = (id) => {
    window.location.href = `/?scrollTo=${id}`;
  };

  window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const scrollTo = params.get('scrollTo');
    
    if (scrollTo) {
      const section = document.getElementById(scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };
  

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-4 lg:px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <span className="hover:text-amber-400 transition duration-300">
            {/* Viral Vision <span className="text-amber-300">Agency</span> */}
            <img src={Logo} alt="viral vision official logo - A strategy plan for social media marketing" width={150} />
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((link, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {
                link.id === 'contact' ?
                  <span
                    className="bg-amber-400 px-5 py-2 rounded-3xl text-black hover:text-white transition duration-300 cursor-pointer"
                    onClick={() => handleScroll(link.id)}
                  >
                    {link.name}
                  </span>
                : <span
                    className="hover:text-amber-400 transition duration-300 cursor-pointer"
                    onClick={() => handleScroll(link.id)}
                  >
                    {link.name}
                  </span>
              }
            </motion.div>
          ))}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button onClick={handleToggle}>
            {isOpen ? (
              <FiX className="text-2xl" />
            ) : (
              <FiMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800 md:hidden flex flex-col items-center space-y-4 py-4"
        >
          {navLinks.map((link, index) => (
            <span
              key={index}
              className="text-white hover:text-indigo-400 transition duration-300 cursor-pointer"
              onClick={() => handleScroll(link.id)}
            >
              {link.name}
            </span>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

export default NavBar;
