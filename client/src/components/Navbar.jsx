import React from 'react';
import { FiLogIn, FiLogOut, FiBookmark, FiAward } from "react-icons/fi";
import { CiMenuFries } from "react-icons/ci";
import { Link } from 'react-router-dom';
import { useAuthData } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { ModeToggle } from './mode-toogle';
import axiosInstance from '../utils/axiosConfig';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isSignedIn, logout, userData, setUserData } = useAuthData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const avatarRef = useRef(null);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }

    if (avatarRef.current && !avatarRef.current.contains(event.target)) {
      setIsAvatarMenuOpen(false);
    }
  };

  const getUserDetails = async () => {
    try {
      const response = await axiosInstance.get('auth/get');
      if (response.data.success) {
        setUserData({
          avatar: response.data.data.avatar,
          emailId: response.data.data.emailId,
          role: response.data.data.role,
          userId: response.data.data.userId
        });
        console.log('User Details loaded:', response.data.data);
      } else {
        console.error('Failed to fetch User Details:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching User Details:', error);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (email) => {
    if (!email) return '';
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-emerald-700 dark:to-green-900 rounded-lg opacity-90 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-emerald-700 dark:to-green-900 animate-pulse opacity-20"></div>
          <div className="absolute -left-4 -top-4 w-32 h-32 bg-green-300 dark:bg-green-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-300 dark:bg-emerald-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative flex items-center justify-between p-4 rounded-lg backdrop-blur-sm z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link to="/" className="text-2xl font-serif font-bold text-white dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100 dark:from-white dark:to-green-200">
                Compte
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/bookmarks" 
                  className="flex items-center text-white dark:text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-md bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                >
                  <FiBookmark className="mr-2" /> Bookmarks
                </Link>
              </motion.div>
            )}
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/contest" 
                className="flex items-center text-white dark:text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-md bg-emerald-500/30 backdrop-blur-sm border border-white/20 hover:bg-emerald-500/40"
              >
                <FiAward className="mr-2" /> Contests
              </Link>
            </motion.div>

            <ModeToggle />

            <div className="relative" ref={avatarRef}>
              {isSignedIn ? (
                <>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 dark:from-emerald-600 dark:to-green-800 flex items-center justify-center text-white font-bold cursor-pointer shadow-md ring-2 ring-white/30"
                    onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  >
                    {getInitials(userData?.emailId)}
                  </motion.div>

                  {isAvatarMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-10 border border-green-200 dark:border-green-700"
                    >
                      <div className="flex gap-x-2 my-auto px-4 py-3 text-sm font-medium border-b border-green-100 dark:border-green-700">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 dark:from-emerald-600 dark:to-green-800 flex items-center justify-center text-white font-bold shadow-md">
                          {getInitials(userData?.emailId)}
                        </div>
                        <div className='my-auto text-gray-800 dark:text-gray-200'> {userData?.emailId}</div>
                      </div>
                      <div 
                        className="px-4 py-3 text-sm text-red-500 dark:text-red-400 flex items-center cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={logout}
                      >
                        <FiLogOut className="mr-2" /> Logout
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/login" className="flex items-center text-white dark:text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-md bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20">
                    <FiLogIn className="mr-2" /> Login
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          <div className="md:hidden gap-x-2 flex items-center">
            <ModeToggle />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-white dark:text-white hover:text-green-100 dark:hover:text-green-200 transition-colors duration-200 bg-white/10 backdrop-blur-sm p-2 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <CiMenuFries size={24} />
            </motion.button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden shadow-lg rounded-b-lg p-4 bg-white dark:bg-gray-800 border-t-0 border border-green-200 dark:border-green-700"
          ref={menuRef}
        >
          <div className="flex flex-col space-y-4">
            {isSignedIn ? (
              <>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 dark:from-emerald-600 dark:to-green-800 flex items-center justify-center text-white font-bold shadow-md">
                    {getInitials(userData?.emailId)}
                  </div>
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{userData?.emailId}</span>
                </div>
                
                <Link 
                  to="/bookmarks" 
                  className="flex items-center text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors duration-200 font-medium shadow-md"
                >
                  <FiBookmark className="mr-2" /> Bookmarks
                </Link>
                
                <Link 
                  to="/contest" 
                  className="flex items-center text-gray-800 dark:text-gray-200 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800/30 dark:to-emerald-800/30 p-3 rounded-lg transition-colors duration-200 font-medium shadow-md"
                >
                  <FiAward className="mr-2" /> Contests
                </Link>
                
                <div 
                  className="flex items-center text-red-500 dark:text-red-400 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={logout}
                >
                  <FiLogOut className="mr-2" /> Logout
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors duration-200 justify-center font-medium shadow-md">
                <FiLogIn className="mr-2" /> Login
              </Link>
            )}
          </div>
        </motion.div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .bg-grid-white {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0V20M0 1H20' stroke='white' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E%0A");
          background-size: 20px 20px;
        }
      `}</style>
    </>
  );
};

export default Navbar;