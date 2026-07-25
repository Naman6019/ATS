"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, CheckCircle2, ArrowRight, Layout, Zap, Search, ShieldCheck } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // 3D Tilt Effect for Resume Mockup
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to the center of the element (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Stagger variants for feature cards
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 overflow-hidden relative">
      
      {/* Background Decorative Elements */}
      <motion.div style={{ y: y1 }} className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
      <motion.div style={{ y: y2 }} className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
      <motion.div style={{ y: y1 }} className="absolute bottom-[30%] left-[-5%] w-[30%] h-[30%] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-heading font-extrabold tracking-tight text-slate-900">AIResume</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
            <Link href="#templates" className="hover:text-slate-900 transition-colors">Templates</Link>
            <Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block transition-colors">
              Log in
            </Link>
            <Link href="/dashboard">
              <Button className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors px-5 h-10 text-sm font-semibold">
                Start Building
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Hero Content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ opacity }}
                className="flex-1 text-center lg:text-left z-10"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 mb-6 shadow-sm"
                >
                  <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                  Next-Gen Resume Builder
                </motion.div>
                
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                  Build a resume that <br className="hidden lg:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">stands out.</span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium">
                  Leverage AI to craft perfect bullet points, analyze your ATS score, and design a professional resume in minutes.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/dashboard">
                    <Button className="rounded-xl h-14 px-8 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                      Create Your Resume
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/check">
                    <Button variant="outline" className="rounded-xl h-14 px-8 text-base font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                      <Search className="mr-2 h-5 w-5 text-blue-600" />
                      Check ATS Score
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-500">
                  <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> Free to use</div>
                  <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> No credit card required</div>
                </div>
              </motion.div>

              {/* Interactive 3D Hero Visual */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="flex-1 w-full max-w-xl lg:max-w-none relative z-10 [perspective:1500px]"
              >
                <motion.div 
                  ref={ref}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                  className="relative w-full aspect-[8.5/11] rounded-2xl flex flex-col overflow-hidden shadow-2xl bg-white border border-slate-200 cursor-default mx-auto lg:ml-auto"
                >
                  
                  {/* Mock Resume Content Container */}
                  <div className="relative w-full h-full flex flex-col z-10">
                    <div className="w-full h-full bg-white flex flex-col">
                      {/* Header */}
                      <div className="bg-slate-50 p-6 lg:p-8 border-b border-slate-100 flex flex-col items-center text-center">
                        <div className="w-3/4 h-6 lg:h-8 bg-slate-800 rounded-md mb-3 lg:mb-4"></div>
                        <div className="w-1/2 h-2 lg:h-3 bg-blue-600 rounded-full mb-3"></div>
                        <div className="flex gap-3 lg:gap-4">
                          <div className="w-12 lg:w-16 h-1.5 lg:h-2 bg-slate-300 rounded-full"></div>
                          <div className="w-12 lg:w-16 h-1.5 lg:h-2 bg-slate-300 rounded-full"></div>
                          <div className="w-12 lg:w-16 h-1.5 lg:h-2 bg-slate-300 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Body */}
                      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 bg-white">
                        <div>
                          <div className="w-1/3 h-4 lg:h-5 bg-slate-800 rounded mb-3 lg:mb-4"></div>
                          <div className="w-full h-px bg-slate-200 mb-3 lg:mb-4"></div>
                          
                          <div className="mb-4 lg:mb-5">
                            <div className="flex justify-between mb-2">
                              <div className="w-1/2 h-3 lg:h-4 bg-slate-800 rounded"></div>
                              <div className="w-1/4 h-3 lg:h-4 bg-blue-100 rounded"></div>
                            </div>
                            <div className="w-1/3 h-2 lg:h-3 bg-slate-400 rounded mb-2 lg:mb-3"></div>
                            <div className="space-y-1.5 lg:space-y-2 pl-3 lg:pl-4">
                              <div className="w-full h-1.5 lg:h-2 bg-slate-300 rounded"></div>
                              <div className="w-11/12 h-1.5 lg:h-2 bg-slate-300 rounded"></div>
                              <div className="w-4/5 h-1.5 lg:h-2 bg-slate-300 rounded"></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <div className="w-1/2 h-3 lg:h-4 bg-slate-800 rounded"></div>
                              <div className="w-1/4 h-3 lg:h-4 bg-blue-100 rounded"></div>
                            </div>
                            <div className="w-1/3 h-2 lg:h-3 bg-slate-400 rounded mb-2 lg:mb-3"></div>
                            <div className="space-y-1.5 lg:space-y-2 pl-3 lg:pl-4">
                              <div className="w-full h-1.5 lg:h-2 bg-slate-300 rounded"></div>
                              <div className="w-10/12 h-1.5 lg:h-2 bg-slate-300 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements (Subtle in light mode) */}
                  <div className="absolute top-1/4 -right-4 lg:-right-6 w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100" style={{ transform: "translateZ(30px)" }}>
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="absolute bottom-1/3 -left-4 lg:-left-8 bg-white rounded-xl flex items-center p-3 shadow-xl border border-slate-100" style={{ transform: "translateZ(40px)" }}>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs lg:text-sm font-bold text-slate-900">ATS Optimized</div>
                      <div className="text-[10px] lg:text-xs text-slate-500 font-medium">99% Match Score</div>
                    </div>
                  </div>

                </motion.div>
                
              </motion.div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative z-10 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-heading font-extrabold text-slate-900 mb-4">Everything you need to land the job</h2>
              <p className="text-slate-500 text-lg lg:text-xl font-medium">Our intuitive builder takes the guesswork out of formatting and phrasing, letting you focus on your career story.</p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-3 gap-6 lg:gap-8"
            >
              {[
                {
                  icon: <Zap className="w-6 h-6 text-blue-600" />,
                  title: "AI-Powered Writing",
                  desc: "Stuck on what to say? Our AI generates tailored, impactful bullet points based on your job title and industry.",
                  bg: "bg-blue-50"
                },
                {
                  icon: <Layout className="w-6 h-6 text-indigo-600" />,
                  title: "Professional Templates",
                  desc: "Choose from templates designed by HR experts, ensuring your resume looks pristine and parses perfectly.",
                  bg: "bg-indigo-50"
                },
                {
                  icon: <Search className="w-6 h-6 text-sky-600" />,
                  title: "ATS Resume Checker",
                  desc: "Scan your resume against any job description to see your match score and find missing keywords before you apply.",
                  bg: "bg-sky-50"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg} transition-transform group-hover:scale-110 duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative z-10 bg-slate-50">
          <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-12 lg:p-16 bg-blue-600 rounded-[2rem] shadow-xl relative overflow-hidden"
            >
              {/* Decorative blobs */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-4 leading-tight">Ready to upgrade your career?</h2>
                <p className="text-lg lg:text-xl text-blue-100 mb-10 max-w-2xl font-medium">Join thousands of professionals who have successfully landed their dream jobs using our platform.</p>
                <Link href="/dashboard">
                  <Button className="rounded-xl h-14 px-10 text-base font-bold bg-white text-blue-600 hover:bg-slate-50 shadow-lg hover:-translate-y-0.5 transition-all">
                    Create Your Resume Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-md">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-slate-900">AIResume</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} AIResume. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
