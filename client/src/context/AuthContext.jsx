/* eslint-disable react-refresh/only-export-components */
import { useSignIn, useSignUp, useUser, useClerk , useAuth} from "@clerk/clerk-react";
import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const { getToken } = useAuth();
  const [token, setToken] = useState(null);
  const [userData,setUserData] = useState({
    avatar: null, 
    emailId: null,     
    role: null,
    userId: null,

 })


 

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getToken();
      setToken(authToken);
      Cookies.set('authToken', authToken); 
    };
    fetchToken();
  }, [getToken]);

  const { signOut,handleRedirectCallback } = useClerk();
  const { user, isSignedIn} = useUser();
  const { signIn } = useSignIn();
  const {signUp} = useSignUp();
  const login = async (email, password) => {
    try {
      await signIn.create({
        identifier: email,
        password,
      });
      <Navigate to={"/contest"} />
      window.location.reload()
    } catch (err) {
        toast.error("Error Logging in, PLease try again")
      console.error("Login failed:", err);
      //window.location.reload()
    }
  };
  const logout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
      <Navigate to={"/"} />
    } catch (err) {
      toast.error("Error logging out, please try again.");
      console.error("Logout failed:", err);
    }
  };
  

  const register = async (email, password,navigate) => {
    try {
      await signUp.create({ emailAddress: email, password });
      toast.success("Account created successfully! Please log in.");
       window.location.reload()
     
    } catch (err) {
      toast.error("Error creating account, please try again.");
      console.error("Sign up failed:", err);
    }
  };

  const googleLogin = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "http://localhost:5173/oauth-callback"
      });
    } catch (err) {
      toast.error("Error with Google login, please try again.");
      console.error("Google login failed:", err);
    }
  };

  const handleOAuthCallback = async () => {
    try {
      await handleRedirectCallback();
      toast.success("Google login successful!");
      <Navigate to={"/contest"}/>
    } catch (err) {
      toast.error("Error processing Google login.");
      console.error("OAuth callback failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ userData,setUserData,isSignedIn,signUp,register,token, googleLogin,handleOAuthCallback,user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthData = () => useContext(AuthContext);
