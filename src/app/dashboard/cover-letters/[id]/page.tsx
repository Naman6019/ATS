"use client";

import { useState, useEffect } from "react";
import { getCoverLetter, saveCoverLetter } from "@/app/actions/cover-letters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, ChevronLeft, Sparkles, Layout } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

export default function CoverLetterEditor({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const router = useRouter();
  
  const [title, setTitle] = useState("Untitled Cover Letter");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    if (!isNew) {
      getCoverLetter(params.id).then(letter => {
        if (letter) {
          setTitle(letter.title);
          setTargetRole(letter.targetRole || "");
          setTargetCompany(letter.targetCompany || "");
          setContent(letter.content);
        }
      });
    }
  }, [params.id, isNew]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCoverLetter(isNew ? null : params.id, title, content, targetRole, targetCompany);
      alert("Cover letter saved!");
      router.push("/dashboard/cover-letters");
    } catch (error) {
      console.error(error);
      alert("Failed to save cover letter.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!targetRole || !targetCompany) {
      alert("Please specify the Target Role and Company first.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const prompt = `Write a professional cover letter for a ${targetRole} position at ${targetCompany}. Make it engaging, modern, and confident.`;
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
      });
      
      if (!response.ok) throw new Error("Failed to generate");
      
      const result = await response.json();
      setContent(result.enhancedText);
    } catch (error) {
      console.error(error);
      alert("Failed to generate cover letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Editor Side */}
      <div className="w-1/2 flex flex-col bg-white border-r border-slate-200 z-10">
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
          <Link href="/dashboard/cover-letters" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="font-medium text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => reactToPrintFn()} 
              className="border-slate-200 text-slate-600 hover:text-slate-900 h-9 px-3 rounded-lg"
            >
              Print PDF
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold h-9 px-4 rounded-lg transition-colors"
            >
              {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save</>}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Document Title</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="text-xl font-bold bg-transparent border-none px-1 h-auto focus-visible:ring-0 text-slate-900 placeholder:text-slate-300"
                placeholder="Software Engineer at Stripe"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Target Role</Label>
                <Input 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)} 
                  className="bg-white border-slate-200"
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Target Company</Label>
                <Input 
                  value={targetCompany} 
                  onChange={(e) => setTargetCompany(e.target.value)} 
                  className="bg-white border-slate-200"
                  placeholder="e.g. Vercel"
                />
              </div>
              <div className="col-span-2 pt-2">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? "AI is writing..." : "Auto-Generate with AI"}
                </Button>
              </div>
            </div>

            <div className="space-y-2 flex-1 flex flex-col h-[500px]">
              <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold ml-1">Letter Content</Label>
              <Textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                className="flex-1 bg-white border-slate-200 rounded-xl focus-visible:ring-teal-500 text-slate-900 resize-none p-6 leading-relaxed shadow-sm min-h-[400px]"
                placeholder="Dear Hiring Manager, ..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Side */}
      <div className="w-1/2 bg-slate-200/50 flex flex-col relative z-20">
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md">
          <span className="text-xs font-bold text-slate-500 tracking-widest uppercase flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            Live Preview
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center p-8 relative">
          <div 
            className="shadow-xl rounded-sm overflow-hidden bg-white relative z-10 w-[210mm] min-h-[297mm] p-[25mm]"
            ref={contentRef}
          >
            <div className="font-serif text-[11pt] text-slate-800 leading-relaxed whitespace-pre-wrap">
              {content || "Start typing to see your cover letter here..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
