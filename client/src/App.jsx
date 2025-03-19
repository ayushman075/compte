import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Signup from './pages/Signup'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import OAuthCallback from './components/OAuthCallback'
import Home from './pages/Home'
import BookmarksPage from './pages/BookmarkPage'
import { ThemeProvider } from './context/theme-provider'

function App() {

  return (
    <>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <AuthProvider>
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        />

    
     <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/bookmarks' element={<BookmarksPage/>}/>
        <Route path="/oauth-callback" element={<OAuthCallback />} />

      </Routes>
     </BrowserRouter>
     </AuthProvider>
     </ThemeProvider>
    </>
  )
}

export default App
