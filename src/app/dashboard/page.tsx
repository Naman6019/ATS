import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FileText, Plus, ChevronRight, CheckCircle2, FileEdit } from "lucide-react";
import Link from "next/link";
import { getResumes } from "@/app/actions/resume";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const firstName = user?.firstName || "there";

  const resumes = await getResumes(); 

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center mb-12 mt-8">
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">Hi {firstName}!</h1>
        <p className="text-slate-500">What's your goal today?</p>
        
        <div className="flex items-center space-x-6 mt-8">
          <span className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">Resume Building</span>
          <span className="text-slate-400 font-medium pb-2">Job Search</span>
          <span className="text-slate-400 font-medium pb-2">Interview Prep</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Progress Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-6">Progress</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-slate-400 mr-3" />
                <span className="font-semibold text-slate-700">Resume Building</span>
              </div>
              <span className="font-bold text-blue-600">100%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full w-full"></div>
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div className="flex items-center">
                <FileEdit className="w-5 h-5 text-slate-400 mr-3" />
                <span className="font-semibold text-slate-700">Resume Tailoring</span>
              </div>
              <span className="font-bold text-slate-400">0%</span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-emerald-900 mb-2">Resume complete!</h2>
            <p className="text-emerald-700 text-sm max-w-[200px]">Nice work. Your new resume will literally open doors. Now let's use AI to tailor it for any job.</p>
          </div>
          
          <div className="mt-8 relative z-10">
            <button className="w-full bg-white text-slate-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors shadow-sm">
              Next step <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20">
            <CheckCircle2 className="w-full h-full text-emerald-600 transform translate-x-8 translate-y-8" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Your Documents</h2>
        <Link href="/dashboard/build">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </button>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No resumes yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm">Create your first resume to start tracking your progress and applying for jobs.</p>
          <Link href="/dashboard/build">
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm">
              Build Resume
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {resumes.map((resume: any) => (
            <div key={resume.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-slate-900 mb-2">{resume.title}</h3>
              <p className="text-sm text-slate-500 mb-4">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <Link href={`/dashboard/build?id=${resume.id}`} className="flex-1">
                  <button className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm">
                    Edit
                  </button>
                </Link>
                <Link href={`/dashboard/check?resumeId=${resume.id}`} className="flex-1">
                  <button className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm">
                    Check ATS
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
