"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useReactToPrint } from "react-to-print";
import { initialResumeData, ResumeData, Experience, Education } from "@/types/resume";
import { ResumePreview } from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Sparkles, Plus, Trash2, User, Briefcase, GraduationCap, Code, Layout, Save, ChevronLeft, Target, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveResume } from "@/app/actions/resume";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type TabType = "personal" | "experience" | "education" | "skills";

function BuildContent() {
  const [data, setData] = useState<ResumeData>(initialResumeData);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [template, setTemplate] = useState<"professional" | "modern" | "creative">("professional");
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAtsMode = searchParams.get("ats") === "true";
  const missingKeywordsRaw = searchParams.get("missing_keywords");
  const targetRole = searchParams.get("role") || "";
  const missingKeywords = missingKeywordsRaw ? missingKeywordsRaw.split(",").map(k => k.trim()).filter(Boolean) : [];

  // Derived state to check if a keyword is satisfied across the entire resume data
  const resumeText = JSON.stringify(data).toLowerCase();
  
  const handlePersonalInfoChange = (field: keyof ResumeData["personalInfo"], value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    setData((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const removeExperience = (id: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      startDate: "",
      endDate: "",
    };
    setData((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const removeEducation = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const enhanceDescription = async (id: string, description: string, title?: string, company?: string) => {
    let prompt = description;
    
    // If we have missing keywords and we are in ATS mode, we should instruct the AI to incorporate them
    const unsatisfiedKeywords = missingKeywords.filter(kw => !resumeText.includes(kw.toLowerCase()));
    
    if (!prompt.trim()) {
      if (title) {
        prompt = `Generate 3 strong, action-oriented resume bullet points for a ${title} ${company ? `at ${company}` : ""}.`;
        if (unsatisfiedKeywords.length > 0) {
          prompt += ` Please naturally incorporate these keywords if possible: ${unsatisfiedKeywords.join(", ")}`;
        }
      } else {
        return;
      }
    } else {
      if (unsatisfiedKeywords.length > 0) {
        prompt = `Rewrite and improve the following resume bullet points. Make them more professional and action-oriented. CRITICAL: Naturally weave in as many of these missing keywords as possible: ${unsatisfiedKeywords.join(", ")}.\n\nOriginal points:\n${prompt}`;
      }
    }
    
    setIsEnhancing(id);
    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
      });
      
      if (!response.ok) throw new Error("Failed to enhance");
      
      const result = await response.json();
      updateExperience(id, "description", result.enhancedText);
    } catch (error) {
      console.error("Error enhancing description:", error);
      alert("Failed to enhance description. Please try again.");
    } finally {
      setIsEnhancing(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveResume(null, data.personalInfo.fullName || "Untitled Resume", template, data);
      alert("Resume saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to save resume.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Code },
  ];

  const listVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const listItemVariants: any = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <div className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-2xl text-slate-900">Builder</span>
          </div>
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 font-medium relative overflow-hidden ${
                    isActive 
                      ? "text-blue-700 bg-blue-50" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-blue-600' : ''}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* ATS Suggestions Panel (If in ATS Mode) */}
        {isAtsMode && missingKeywords.length > 0 && (
          <div className="mt-8 bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full -mr-8 -mt-8 z-0"></div>
            <div className="relative z-10">
              <h4 className="font-bold text-amber-900 text-sm flex items-center mb-3">
                <Target className="w-4 h-4 mr-1.5 text-amber-600" />
                ATS Target Keywords
              </h4>
              <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                Add these keywords to your resume to increase your match score for: <strong className="font-semibold">{targetRole}</strong>
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {missingKeywords.map(kw => {
                  const isSatisfied = resumeText.includes(kw.toLowerCase());
                  return (
                    <div key={kw} className="flex items-start text-sm">
                      {isSatisfied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`${isSatisfied ? 'text-emerald-700 line-through opacity-70' : 'text-amber-900 font-medium'}`}>
                        {kw}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 mt-8">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-lg transition-colors"
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Resume
              </>
            )}
          </Button>
          <Button 
            onClick={() => reactToPrintFn()} 
            variant="outline"
            className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold h-12 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Editor Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-transparent">
        <div className="max-w-3xl mx-auto p-10 lg:p-16 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {activeTab === "personal" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Personal Information</h2>
                    <p className="text-slate-500">This is how employers will contact you.</p>
                  </div>
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-8">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Full Name</Label>
                      <Input 
                        value={data.personalInfo.fullName} 
                        onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)} 
                        placeholder="e.g. Jane Doe"
                        className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Email</Label>
                        <Input 
                          type="email" 
                          value={data.personalInfo.email} 
                          onChange={(e) => handlePersonalInfoChange("email", e.target.value)} 
                          placeholder="jane@example.com"
                          className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Phone</Label>
                        <Input 
                          value={data.personalInfo.phone} 
                          onChange={(e) => handlePersonalInfoChange("phone", e.target.value)} 
                          placeholder="+1 (555) 000-0000"
                          className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Location</Label>
                        <Input 
                          value={data.personalInfo.location} 
                          onChange={(e) => handlePersonalInfoChange("location", e.target.value)} 
                          placeholder="San Francisco, CA"
                          className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Website / LinkedIn</Label>
                        <Input 
                          value={data.personalInfo.website} 
                          onChange={(e) => handlePersonalInfoChange("website", e.target.value)} 
                          placeholder="linkedin.com/in/janedoe"
                          className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Professional Summary</Label>
                      <Textarea 
                        value={data.personalInfo.summary} 
                        onChange={(e) => handlePersonalInfoChange("summary", e.target.value)} 
                        placeholder="Write a brief, engaging summary of your career and skills..." 
                        rows={5}
                        className="bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-blue-500 text-slate-900 resize-none p-4 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "experience" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Employment History</h2>
                      <p className="text-slate-500">Show your relevant experience.</p>
                    </div>
                    <Button onClick={addExperience} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg h-10 px-4">
                      <Plus className="w-4 h-4 mr-2" /> Add Experience
                    </Button>
                  </div>
                  
                  <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-6">
                    <AnimatePresence>
                      {data.experience.map((exp, index) => (
                        <motion.div 
                          key={exp.id} 
                          variants={listItemVariants}
                          layout
                          className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 relative group"
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeExperience(exp.id)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center">
                            <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 text-xs mr-3 font-semibold">
                              {index + 1}
                            </span>
                            Role Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Job Title</Label>
                              <Input 
                                value={exp.position} 
                                onChange={(e) => updateExperience(exp.id, "position", e.target.value)} 
                                placeholder="Software Engineer"
                                className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Company</Label>
                              <Input 
                                value={exp.company} 
                                onChange={(e) => updateExperience(exp.id, "company", e.target.value)} 
                                placeholder="Tech Inc."
                                className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Start Date</Label>
                              <Input 
                                value={exp.startDate} 
                                onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} 
                                placeholder="Jan 2020"
                                className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">End Date</Label>
                              <Input 
                                value={exp.endDate} 
                                onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} 
                                placeholder="Present"
                                className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Description</Label>
                              <Button 
                                size="sm" 
                                onClick={() => enhanceDescription(exp.id, exp.description, exp.position, exp.company)}
                                disabled={isEnhancing === exp.id}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs h-8 px-3 font-semibold"
                              >
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                {isEnhancing === exp.id ? "Generating..." : (exp.description ? (isAtsMode ? "AI Fix & Add Keywords" : "Enhance") : "Auto-Generate")}
                              </Button>
                            </div>
                            <Textarea 
                              value={exp.description} 
                              onChange={(e) => updateExperience(exp.id, "description", e.target.value)} 
                              placeholder={exp.position ? `Click 'Auto-Generate' to let AI write bullet points for a ${exp.position}...` : "• Describe your achievements..."}
                              rows={6} 
                              className="bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-blue-500 text-slate-900 resize-none p-4 placeholder:text-slate-400"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {data.experience.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500"
                      >
                        No experience added yet. Click "Add Experience" to start.
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              )}

              {activeTab === "education" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Education</h2>
                      <p className="text-slate-500">Your academic background.</p>
                    </div>
                    <Button onClick={addEducation} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg h-10 px-4">
                      <Plus className="w-4 h-4 mr-2" /> Add Education
                    </Button>
                  </div>
                  
                  <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-6">
                    <AnimatePresence>
                      {data.education.map((edu, index) => (
                        <motion.div 
                          key={edu.id} 
                          variants={listItemVariants}
                          layout
                          className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 relative group"
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeEducation(edu.id)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center">
                            <span className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs mr-3 font-semibold">
                              {index + 1}
                            </span>
                            Degree Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">School / University</Label>
                              <Input 
                                value={edu.school} 
                                onChange={(e) => updateEducation(edu.id, "school", e.target.value)} 
                                placeholder="State University"
                                className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Degree & Major</Label>
                              <Input 
                                value={edu.degree} 
                                onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} 
                                placeholder="B.S. in Computer Science"
                                className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Start Date</Label>
                              <Input 
                                value={edu.startDate} 
                                onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} 
                                placeholder="Sep 2016"
                                className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">End Date</Label>
                              <Input 
                                value={edu.endDate} 
                                onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} 
                                placeholder="May 2020"
                                className="bg-slate-50 border-slate-200 h-12 rounded-lg focus-visible:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {data.education.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500"
                      >
                        No education added yet. Click "Add Education" to start.
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              )}

              {activeTab === "skills" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Skills</h2>
                    <p className="text-slate-500">Highlight your core competencies.</p>
                  </div>
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Key Skills (Comma separated)</Label>
                      <Textarea 
                        value={data.skills} 
                        onChange={(e) => setData(prev => ({...prev, skills: e.target.value}))} 
                        placeholder="React, TypeScript, Project Management, UI/UX Design..." 
                        rows={6} 
                        className="bg-slate-50 border-slate-200 rounded-lg focus-visible:ring-blue-500 text-slate-900 resize-none p-4 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Live Preview Side */}
      <div className="w-[45%] bg-slate-200/50 border-l border-slate-200 flex flex-col relative z-20">
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md">
          <span className="text-xs font-bold text-slate-500 tracking-widest uppercase flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            Live Preview
          </span>
          <div className="flex gap-2">
            <Button
              variant={template === "professional" ? "default" : "outline"}
              size="sm"
              onClick={() => setTemplate("professional")}
              className="text-xs h-8"
            >
              Professional
            </Button>
            <Button
              variant={template === "modern" ? "default" : "outline"}
              size="sm"
              onClick={() => setTemplate("modern")}
              className="text-xs h-8"
            >
              Modern
            </Button>
            <Button
              variant={template === "creative" ? "default" : "outline"}
              size="sm"
              onClick={() => setTemplate("creative")}
              className="text-xs h-8"
            >
              Creative
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center p-8 relative">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.4 }}
            className="shadow-xl rounded-sm overflow-hidden bg-white relative z-10 mx-auto"
          >
            <ResumePreview data={data} template={template} ref={contentRef} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-slate-500"><Sparkles className="animate-spin w-8 h-8" /></div>}>
      <BuildContent />
    </Suspense>
  );
}
