import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { FileText, Search, BarChart3, LayoutDashboard, Sparkles, BookOpen, Briefcase, ChevronRight } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <Link className="flex items-center group" href="/dashboard">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-heading font-bold text-slate-900 tracking-tight">AIResume</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <LayoutDashboard className="h-4 w-4 mr-3 text-slate-400" />
            Dashboard
          </Link>
          <Link href="/dashboard/build" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <FileText className="h-4 w-4 mr-3 text-slate-400" />
            Documents
          </Link>
          <Link href="/dashboard/cover-letters" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <BookOpen className="h-4 w-4 mr-3 text-slate-400" />
            Cover Letters
          </Link>
          <Link href="/dashboard/check" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Search className="h-4 w-4 mr-3 text-slate-400" />
            ATS Checker
          </Link>
          <Link href="/dashboard/jobs" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <BarChart3 className="h-4 w-4 mr-3 text-slate-400" />
            Job Board
          </Link>
          <Link href="/dashboard/tracker" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Briefcase className="h-4 w-4 mr-3 text-slate-400" />
            Job Tracker
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <UserButton />
            <span className="text-xs font-medium text-slate-500">Free Plan</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <Link className="flex items-center" href="/dashboard">
            <div className="p-1 bg-blue-600 rounded">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="ml-2 font-heading font-bold text-slate-900">AIResume</span>
          </Link>
          <UserButton />
        </header>

        {/* Top bar for actions */}
        <div className="h-16 bg-white border-b border-slate-200 hidden md:flex items-center justify-end px-8">
          <button className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 mr-4">
            Auto Apply <ChevronRight className="h-4 w-4 ml-1" />
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
