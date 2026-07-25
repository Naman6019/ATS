"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Zap, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ATSCheckerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) return;
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);
      
      const response = await fetch("/api/analyze", { 
        method: "POST", 
        body: formData 
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze resume");
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while analyzing the resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const staggerItem: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Header */}
      <header className="px-6 lg:px-12 h-16 flex items-center border-b border-slate-200 bg-white sticky top-0 z-50">
        <Link className="flex items-center justify-center group" href="/dashboard">
          <ChevronLeft className="w-4 h-4 mr-1 text-slate-500 group-hover:text-slate-900 transition-colors" />
          <span className="font-medium text-slate-500 group-hover:text-slate-900 transition-colors">Back to Dashboard</span>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 mb-4 shadow-sm">
            <Zap className="mr-2 h-4 w-4 text-blue-600" />
            AI Scoring Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900">ATS Resume Checker</h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl">See how well your resume matches a job description before you apply. Upload your PDF and paste the requirements below.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-bold text-slate-900">1. Upload Resume</h2>
                <p className="text-sm text-slate-500">PDF format only</p>
              </div>
              <label htmlFor="resume-upload" className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:bg-slate-50 transition-all cursor-pointer block group bg-slate-50/50">
                <input 
                  type="file" 
                  id="resume-upload" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-base font-bold text-slate-900 mb-2">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </span>
                  <span className="text-xs text-slate-500">PDF up to 5MB</span>
                </div>
              </label>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-bold text-slate-900">2. Job Description</h2>
                <p className="text-sm text-slate-500">Paste the target job description</p>
              </div>
              <Textarea 
                placeholder="Paste the full job description here..."
                className="min-h-[220px] bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500 text-slate-900 resize-none text-base p-6 placeholder:text-slate-400"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded-xl" 
              disabled={!file || !jobDescription || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <Sparkles className="animate-spin w-5 h-5 mr-3 text-slate-300" />
                  Analyzing with AI...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-3 text-white" />
                  Analyze Match Score
                </span>
              )}
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="h-full"
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full p-8 lg:p-10 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden"
                >
                  <div className="mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-3xl font-heading font-bold text-slate-900">Analysis Results</h2>
                    <p className="text-slate-500">Here's how your resume stacks up.</p>
                  </div>
                  
                  <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex-1 space-y-10">
                    <motion.div variants={staggerItem} className="flex flex-col items-center justify-center">
                      <div className="relative h-40 w-40 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 shadow-inner">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r="74" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                          <circle 
                            cx="80" cy="80" r="74" 
                            stroke={result.score >= 80 ? "#10b981" : result.score >= 60 ? "#f59e0b" : "#ef4444"} 
                            strokeWidth="8" fill="none" 
                            strokeDasharray="465" 
                            strokeDashoffset={465 - (465 * result.score) / 100}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="flex flex-col items-center relative z-10">
                          <span className="text-5xl font-heading font-black tracking-tighter" style={{ color: result.score >= 80 ? "#10b981" : result.score >= 60 ? "#f59e0b" : "#ef4444" }}>
                            {result.score}
                          </span>
                          <span className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Score</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="space-y-3">
                      <h4 className="font-bold flex items-center text-slate-900 text-lg"><FileText className="h-5 w-5 mr-2 text-blue-600" /> Executive Summary</h4>
                      <p className="text-slate-700 leading-relaxed p-5 bg-slate-50 rounded-xl border border-slate-100">{result.summary}</p>
                    </motion.div>

                    <motion.div variants={staggerItem} className="space-y-3">
                      <h4 className="font-bold flex items-center text-slate-900 text-lg"><AlertCircle className="h-5 w-5 mr-2 text-amber-500" /> Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2 p-5 bg-slate-50 rounded-xl border border-slate-100">
                        {result.missingKeywords.length > 0 ? result.missingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm rounded-lg font-semibold">
                            {kw}
                          </span>
                        )) : (
                          <span className="text-slate-600">Excellent! No major keywords missing.</span>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="space-y-3">
                      <h4 className="font-bold flex items-center text-slate-900 text-lg"><CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" /> Actionable Suggestions</h4>
                      <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <ul className="text-slate-700 space-y-3 list-none">
                          {result.suggestions.map((sug: string, i: number) => (
                            <li key={i} className="flex items-start">
                              <span className="text-blue-500 mr-3 mt-0.5">•</span>
                              <span className="leading-relaxed">{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="pt-6 border-t border-slate-100">
                      <Link 
                        href={`/dashboard/build?ats=true&missing_keywords=${encodeURIComponent(result.missingKeywords.join(","))}&role=${encodeURIComponent("Target Role")}`}
                        className="w-full h-14 flex items-center justify-center text-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-xl shadow-sm"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Fix Issues in Builder
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-white shadow-sm"
                >
                  <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                    <Sparkles className="h-10 w-10 text-blue-300" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-slate-900 mb-3">Awaiting Analysis</h3>
                  <p className="max-w-xs text-slate-500 leading-relaxed">Upload your resume PDF and paste the job description to see your AI-powered match score.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
