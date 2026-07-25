"use client";

import { useEffect, useState } from "react";
import { getJobApplications, updateApplicationStatus, addManualApplication } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kanban, Plus, Building, ExternalLink, ChevronLeft, Calendar, GripVertical } from "lucide-react";
import Link from "next/link";
import { JobApplication, JobListing } from "@prisma/client";

type ApplicationWithJob = JobApplication & { job?: JobListing | null };

const COLUMNS = [
  { id: "SAVED", label: "Saved" },
  { id: "APPLIED", label: "Applied" },
  { id: "INTERVIEWING", label: "Interviewing" },
  { id: "OFFER", label: "Offer" },
  { id: "REJECTED", label: "Rejected" },
];

export default function JobTrackerPage() {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add manual form state
  const [newCompany, setNewCompany] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const loadData = async () => {
    try {
      const fetchedApps = await getJobApplications();
      setApplications(fetchedApps);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    // Optimistic update
    setApplications(apps => apps.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    ));
    await updateApplicationStatus(appId, newStatus);
    await loadData();
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newTitle) return;
    
    await addManualApplication(newCompany, newTitle, "APPLIED");
    setNewCompany("");
    setNewTitle("");
    setShowAddForm(false);
    await loadData();
  };

  const appsByColumn = COLUMNS.map(col => ({
    ...col,
    items: applications.filter(app => app.status === col.id)
  }));

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <div className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Kanban className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-2xl text-slate-900">Job Tracker</span>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Keep track of all your applications in one place. Drag and drop between columns to update their status.
          </p>
          
          <Button 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-lg transition-colors"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>
        <div>
          <Link href="/dashboard/jobs">
            <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold h-12 rounded-lg transition-colors border border-slate-200">
              Browse Job Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-auto p-10 custom-scrollbar">
        <div className="min-w-[1200px] h-full flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-slate-900">Application Pipeline</h1>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddManual} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 flex gap-4 items-end max-w-3xl">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                <Input value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="e.g. Acme Corp" required className="bg-slate-50 border-slate-200" />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Software Engineer" required className="bg-slate-50 border-slate-200" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Add</Button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center p-12 text-slate-500">Loading tracker...</div>
          ) : (
            <div className="flex-1 flex gap-6 pb-6">
              {appsByColumn.map(col => (
                <div key={col.id} className="w-80 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 p-4">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-slate-700">{col.label}</h3>
                    <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">{col.items.length}</span>
                  </div>
                  
                  <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                    {col.items.map(app => (
                      <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900 leading-tight">
                            {app.job?.title || app.jobTitle}
                          </h4>
                          <select 
                            className="text-xs border border-slate-200 rounded p-1 text-slate-600 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          >
                            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                        </div>
                        
                        <div className="text-sm font-semibold text-indigo-600 flex items-center mb-3">
                          <Building className="w-3.5 h-3.5 mr-1.5" />
                          {app.job?.company || app.companyName}
                        </div>
                        
                        {app.appliedDate && (
                          <div className="text-xs text-slate-500 flex items-center mt-2 pt-2 border-t border-slate-100">
                            <Calendar className="w-3 h-3 mr-1" />
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </div>
                        )}
                        
                        {app.job?.url && (
                          <a href={app.job.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold flex items-center mt-2 hover:underline">
                            Original Post <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    ))}
                    
                    {col.items.length === 0 && (
                      <div className="text-center p-6 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        No applications in this stage
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
