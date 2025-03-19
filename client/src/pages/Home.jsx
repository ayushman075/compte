import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import ContestTableDisplay from '../components/Contests'
import { useAuthData } from '../context/AuthContext'
import axiosInstance from '@/utils/axiosConfig';


const Home = () => {
  const {setUserData} = useAuthData();

  const getUserDetails = async () => {
        try {
          const response = await axiosInstance.get('auth/get');
          if (response.data.success) {
           // setBookmarkedContests(response.data.data.user || []);
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

  return (
    <>
    <Navbar/>
    <ContestTableDisplay/>
    </>
  )
}

export default Home