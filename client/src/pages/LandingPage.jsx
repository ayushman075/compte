import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/Spotlight";
import { ArrowRight, CheckCircle, Users, BookOpen, Calendar } from "lucide-react";
import { useTheme } from "../context/theme-provider";

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const gradientTransition = {
    animate: {
      background: [
        "linear-gradient(45deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)",
        "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
        "linear-gradient(225deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)",
        "linear-gradient(315deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
      ],
      transition: {
        duration: 15,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className=" min-h-screen overflow-hidden bg-background text-foreground">
      <BackgroundBeams className="absolute inset-0 opacity-30" />
      
      <motion.div 
        className="absolute inset-0 z-0"
        initial="animate"
        animate="animate"
        variants={gradientTransition}
      />
      
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-green-300/20 to-green-500/20 blur-3xl"
          animate={{ 
            x: ["-10%", "60%", "-10%"],
            y: ["0%", "40%", "0%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{ top: "10%", left: "10%" }}
        />
        
        <motion.div 
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-300/10 blur-3xl"
          animate={{ 
            x: ["80%", "0%", "80%"],
            y: ["10%", "50%", "10%"],
          }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
          style={{ top: "30%", right: "20%" }}
        />
        
        <motion.div 
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-green-400/10 to-emerald-300/10 blur-3xl"
          animate={{ 
            x: ["0%", "70%", "0%"],
            y: ["80%", "30%", "80%"],
          }}
          transition={{ duration: 22, repeat: Infinity, repeatType: "reverse" }}
          style={{ bottom: "10%", left: "20%" }}
        />
      </div>
      
      <section className="relative h-screen">
        <Spotlight
          className="hidden md:block absolute inset-0"
          fill={theme === "dark" ? "green" : "green"}
        />
        
        <motion.div 
          style={{ opacity, y }}
          className="absolute inset-0 flex items-center justify-center text-center px-4 z-10"
        >
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-4 py-3 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent"
            >
             Compte - Organize Your Competitive Journey
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl mb-6 text-muted-foreground"
            >
              Streamline your contest preparation and ace your competitions with Compte's intelligent tracking and organization tools.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:opacity-90 text-white font-medium px-8 relative overflow-hidden group"
              >
                <Link to="/contest">
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"
                    animate={{ 
                      x: ["-100%", "100%"],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  />
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="border-green-500 text-green-500 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 font-medium relative overflow-hidden"
              >
                <Link to="/login">
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-transparent"
                    animate={{ 
                      x: ["-100%", "100%"],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  />
                  Login
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </section>
      
      <section className="py-16 md:py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold py-3 mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Everything You Need To Excel
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Compte provides all the tools competitive programmers need in one place.
            </p>
          </motion.div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div 
              variants={item}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Card className="h-full backdrop-blur-sm bg-card/50 border border-border/50 dark:border-green-900/30 overflow-hidden relative group">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-300/10 opacity-0 group-hover:opacity-100"
                  animate={{ opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <CardContent className="p-6 relative z-10">
                  <motion.div 
                    className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-full w-12 h-12 flex items-center justify-center mb-4"
                    whileHover={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Organized Contest List</h3>
                  <p className="text-muted-foreground">
                    Browse and access well-organized contests with intuitive filtering and sorting options.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Intelligent categorization</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Custom sorting options</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Comprehensive filtering</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              variants={item}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Card className="h-full backdrop-blur-sm bg-card/50 border border-border/50 dark:border-green-900/30 overflow-hidden relative group">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-bl from-emerald-500/5 to-emerald-300/10 opacity-0 group-hover:opacity-100"
                  animate={{ opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
                <CardContent className="p-6 relative z-10">
                  <motion.div 
                    className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-full w-12 h-12 flex items-center justify-center mb-4"
                    whileHover={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Bookmarking & Navigation</h3>
                  <p className="text-muted-foreground">
                    Quickly save and navigate to your favorite contests with our intuitive bookmark system.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">One-click bookmarking</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Custom collections</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Quick access dashboard</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              variants={item}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Card className="h-full backdrop-blur-sm bg-card/50 border border-border/50 dark:border-green-900/30 overflow-hidden relative group">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 to-teal-300/10 opacity-0 group-hover:opacity-100"
                  animate={{ opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                />
                <CardContent className="p-6 relative z-10">
                  <motion.div 
                    className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-full w-12 h-12 flex items-center justify-center mb-4"
                    whileHover={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Curated Discussion</h3>
                  <p className="text-muted-foreground">
                    Instantly access personalized contest discussions on YouTube tailored to your learning style.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Personalized recommendations</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Expert explanations</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Community insights</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="py-12 px-6 md:px-12 rounded-3xl border border-green-500/20 relative overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 z-0"
              animate={{ 
                background: [
                  "linear-gradient(45deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%)",
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)",
                  "linear-gradient(225deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%)",
                  "linear-gradient(315deg, rgba(16, 185, 129, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
            />
            
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 rounded-full bg-green-500/10"
                  initial={{ 
                    x: Math.random() * 100 + "%", 
                    y: Math.random() * 100 + "%",
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{ 
                    x: [
                      Math.random() * 100 + "%", 
                      Math.random() * 100 + "%", 
                      Math.random() * 100 + "%"
                    ],
                    y: [
                      Math.random() * 100 + "%", 
                      Math.random() * 100 + "%", 
                      Math.random() * 100 + "%"
                    ]
                  }}
                  transition={{ 
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10 backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 py-3 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                Ready to Upgrade Your Contest Experience?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of competitive programmers who have transformed their preparation and performance.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button 
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:opacity-90 text-white font-medium px-8 relative overflow-hidden group"
                >
                  <Link to="/contest">
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"
                      animate={{ 
                        x: ["-100%", "100%"],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                    Get Started For Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button 
                  asChild
                  variant="outline" 
                  size="lg"
                  className="border-green-500 text-green-500 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 font-medium relative overflow-hidden"
                >
                  <Link to="/login">
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-transparent"
                      animate={{ 
                        x: ["-100%", "100%"],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    />
                    Login
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <footer className="py-8 px-4 border-t border-border/50 relative">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent opacity-30"
          animate={{ 
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                Compte
              </h3>
              <p className="text-sm text-muted-foreground">Elevate your competitive programming journey</p>
            </div>
        
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Compte. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;