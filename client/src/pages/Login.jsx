import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthData } from "../context/AuthContext";
import googleLogo from "../../public/search.png";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import loginani from '../../public/AnimationLogin.json';
import Lottie from "react-lottie-player";
import { motion } from "framer-motion";
import { BackgroundBeams } from "../components/ui/background-beams";
import { Spotlight } from "../components/ui/Spotlight";
import { cn } from "@/lib/utils";

const tourSteps = [
  {
    title: "Organized Contest List",
    description: "Browse and access well-organized contests with ease",
  },
  {
    title: "Bookmarking and Direct Navigation",
    description: "Quickly save and navigate to your favorite contests",
  },
  {
    title: "Curated PCD in One-Click",
    description: "Instantly access personalized contest dicussion on Youtube tailored for you",
  },
];

const Login = () => {
  const { isSignedIn, login, googleLogin } = useAuthData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/contest");
    }
  }, [isSignedIn]);

  const handleLogin = () => {
    if (!email || !password) {
      toast.error("Some fields are empty");
    } else {
      login(email, password);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % tourSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + tourSteps.length) % tourSteps.length);
  };

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden">
      <BackgroundBeams className="absolute inset-0 opacity-20" />
      <Spotlight
        className="hidden md:block absolute inset-0"
        fill="green"
      />
      
      <div className="container mx-auto px-4 py-12 md:py-16 h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-background/80 backdrop-blur-md shadow-lg border border-border/50 dark:border-green-900/20 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Compte
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, log in to continue.
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row md:gap-6">
                <div className="w-full md:w-1/2 pb-4 md:pb-0">
                  <div className="flex justify-center mb-3">
                    <Lottie
                      loop
                      animationData={loginani}
                      play
                      style={{ width: "160px", height: "160px" }}
                    />
                  </div>
                  
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center px-4 min-h-16"
                  >
                    <h3 className="text-lg font-bold mb-1 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                      {tourSteps[currentStep].title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {tourSteps[currentStep].description}
                    </p>
                  </motion.div>
                  
                  <div className="flex justify-center gap-3 my-3">
                    {tourSteps.map((_, index) => (
                      <motion.button
                        key={index}
                        className={cn(
                          "h-2 rounded-full transition-all cursor-pointer",
                          currentStep === index 
                            ? "bg-green-500 w-6" 
                            : "bg-gray-300 dark:bg-gray-600 w-2 hover:bg-green-300 dark:hover:bg-green-800"
                        )}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setCurrentStep(index)}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-500 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      Prev
                    </Button>
                    <Button
                      onClick={nextStep}
                      size="sm"
                      className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <Separator orientation="vertical" className="h-full" />
                </div>
                <Separator className="my-4 md:hidden" />
                
                <div className="w-full md:w-1/2 space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={googleLogin}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90 dark:from-green-600 dark:to-green-700 h-10"
                    >
                      <img src={googleLogo} width={18} height={18} alt="Google Logo" className="rounded-full bg-white p-1" />
                      <span>Continue with Google</span>
                    </Button>
                  </motion.div>
                  
                  <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-sm text-muted-foreground px-2">OR</span>
                    <Separator className="flex-1" />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-card/50 backdrop-blur-sm text-foreground border border-border/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-card/50 backdrop-blur-sm text-foreground border border-border/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleLogin}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90 dark:from-green-600 dark:to-green-700 h-10 text-base font-medium"
                    >
                      Login
                    </Button>
                  </motion.div>
                  
                  <div className="text-center">
                    <Link className="text-sm text-muted-foreground hover:text-green-500 transition-colors" to="/signup">
                      New here? Sign up
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;