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
      navigate("/");
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
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen w-full p-6 gap-10">
     
      <div className="lg:w-1/2 w-full p-5 text-center bg-background shadow-lg rounded-xl border border-border">
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-200 mb-3">Compte</h2>
        <div className="p-4">
        <Lottie
      loop
      animationData={loginani}
      play
      className="mx-auto w-full"
      style={{ width: "50%", border:"none", boxShadow:"none", height: "100%" }}

>
</Lottie>
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
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Login</h1>
            <p className="text-sm text-muted-foreground">Welcome back, log in to continue.</p>
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
                  className="w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your password"
                />
              </div>
              <Button
                onClick={handleLogin}
                className="w-full bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              >
                Login
              </Button>
              <div className="text-center">
                <Link className="text-sm text-muted-foreground hover:text-green-500" to="/signup">
                  New here? Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
