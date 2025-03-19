import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthData } from "@/context/AuthContext";
import googleLogo from "../../public/search.png";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Lottie from "react-lottie-player";
import Signupani from "../../public/AnimationSignup.json";

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

const Signup = () => {
  const { register, googleLogin, isSignedIn } = useAuthData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/");
    }
  }, [isSignedIn]);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error("All fields are required");
    } else if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
    } else {
      await register(email, password, navigate);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % tourSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + tourSteps.length) % tourSteps.length);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen w-full p-6 gap-10">
      <div className="lg:w-1/2 w-full p-5 text-center bg-background shadow-lg rounded-xl border border-border">
        <h2 className="text-2xl font-bold text-gray-800 font-serif dark:text-gray-200 mb-3">Compte</h2>
        <div className="p-4">
          <Lottie loop animationData={Signupani} play className="mx-auto w-full" style={{ width: "60%", height: "100%" }} />
          <h3 className="text-lg font-semibold">{tourSteps[currentStep].title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{tourSteps[currentStep].description}</p>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          {tourSteps.map((_, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-full transition-all ${
                currentStep === index ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <Button
            onClick={prevStep}
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900"
          >
            Prev
          </Button>
          <Button
            onClick={nextStep}
            variant="default"
            className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Next
          </Button>
        </div>
      </div>

      <div className="lg:w-1/2 w-full max-w-md">
        <Card className="bg-background shadow-lg p-6 rounded-xl border border-border">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Sign Up</h1>
            <p className="text-sm text-muted-foreground">Create your account to get started</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={googleLogin}
                className="w-full flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              >
                <img src={googleLogo} width={20} height={20} alt="Google Logo" />
                Continue with Google
              </Button>
              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 mt-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 mt-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 mt-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Confirm your password"
                />
              </div>
              <Button
                onClick={handleSignup}
                className="w-full bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              >
                Sign Up
              </Button>
              <div className="text-center mt-2">
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                  Already have an account? Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
