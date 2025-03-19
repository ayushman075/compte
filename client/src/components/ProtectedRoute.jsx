import { useAuthData } from "@/context/AuthContext";



const ProtectedRoute = ({ element }) => {
  const { isSignedIn } = useAuthData();

  return isSignedIn && element ;
};

export default ProtectedRoute;
