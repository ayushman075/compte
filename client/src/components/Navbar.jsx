import React from 'react';
import { FiLogIn, FiLogOut, FiBookmark } from "react-icons/fi";
import { CiMenuFries } from "react-icons/ci";
import { Link } from 'react-router-dom';
import { useAuthData } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { ModeToggle } from './mode-toogle';
import axiosInstance from '../utils/axiosConfig';

const Navbar = () => {
  const { isSignedIn, logout, userData } = useAuthData();
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


  const {setUserData} = useAuthData();
  
    const getUserDetails = async () => {
          try {
            const response = await axiosInstance.get('auth/get');
            if (response.data.success) {
             setUserData({
              avatar:response.data.data.avatar,
              emailId:response.data.data.emailId,
              role:response.data.data.role,
              userId:response.data.data.userId
             })
              console.log('User Details loaded:', response.data.data);
            } else {
              console.error('Failed to fetch User Details:', response.data.message);
            }
          } catch (error) {
            console.error('Error fetching User Details:', error);
          }
    }
    useEffect(()=>{
      getUserDetails()
    },[])
  


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const generateAvatarColor = () => {
    return 'bg-green-600';
  };

  const avatarColor = generateAvatarColor(userData?.emailId);

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg bg-green-200 shadow-lg" >
        <div className="flex items-center">
          <Link to="/" className="text-xl font-serif font-bold text-green-800">
            Compte
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {isSignedIn && (
            <Link 
              to="/bookmarks" 
              className="flex items-center text-green-800 px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-md"
              style={{ backgroundColor: '#edfce1' }}
            >
              <FiBookmark className="mr-2" /> Bookmarks
            </Link>
          )}
<ModeToggle/>
          <div className="relative" ref={avatarRef}>
            {isSignedIn ? (
              <>
                <div 
                  className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold cursor-pointer shadow-md transform transition-transform hover:scale-105`}
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                >
                  {userData?.emailId?.charAt(0).toUpperCase()}
                </div>

                {isAvatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-10" style={{ borderColor: '#c7f5a5', borderWidth: '1px' }}>
                    <div className="flex gap-x-2 my-auto px-4 py-3 text-sm text-green-800 font-medium" style={{ borderBottomColor: '#c7f5a5', borderBottomWidth: '1px' }}>
                    <div 
                  className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold cursor-pointer shadow-md transform transition-transform hover:scale-105`}
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                >
                  {userData?.emailId?.charAt(0).toUpperCase()}
                </div><div className='my-auto'> {userData?.emailId}</div>
                    </div>
                    <div 
                      className="px-4 py-3 text-sm text-red-500 flex items-center cursor-pointer transition-colors duration-200"
                      onClick={logout}
                      style={{ ":hover": { backgroundColor: '#f0fce8' } }}
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="flex items-center text-green-800 px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-md" style={{ backgroundColor: '#edfce1' }}>
                <FiLogIn className="mr-2" /> Login
              </Link>
            )}
          </div>
        </div>

        <div className="md:hidden gap-x-2 flex items-center">
<ModeToggle/>

          <button
            className="text-green-800 hover:text-green-900 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <CiMenuFries size={24} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden shadow-lg rounded-b-lg p-4" ref={menuRef} style={{ backgroundColor: '#edfce1' }}>
          <div className="flex flex-col space-y-4">
            {isSignedIn ? (
              <>
                <div className="flex items-center space-x-3 p-3 rounded-lg">
                  <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold shadow-md`}>
                    {userData?.emailId?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-green-800 font-medium">{userData?.emailId}</span>
                </div>
                
                <Link 
                  to="/bookmarks" 
                  className="flex items-center text-green-800 bg-white p-3 rounded-lg transition-colors duration-200 font-medium shadow-md"
                >
                  <FiBookmark className="mr-2" /> Bookmarks
                </Link>
                
                <div 
                  className="flex items-center text-red-500 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors duration-200"
                  onClick={logout}
                >
                  <FiLogOut className="mr-2" /> Logout
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center text-green-800 bg-white p-3 rounded-lg transition-colors duration-200 justify-center font-medium shadow-md">
                <FiLogIn className="mr-2" /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;