"use client";

import { useEffect, useState } from "react";
import { saveJob, applyToJob, getJobApplications, addManualApplication } from "@/app/actions/jobs";
import { getAgentPreference, updateAgentPreference, toggleAgentPreference } from "@/app/actions/agent";
import { Button } from "@/components/ui/button";
import { Briefcase, Building, MapPin, DollarSign, Bookmark, Send, ExternalLink, ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import { JobApplication } from "@prisma/client";
import { Input } from "@/components/ui/input";

type ApiJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  url: string;
};

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("Software Engineer");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Agent State
  const [agentIsActive, setAgentIsActive] = useState(false);
  const [hasAgentPref, setHasAgentPref] = useState(false);
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false);

  const loadJobs = async (searchQuery: string, searchLocation: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/jobs/recommended?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(searchLocation)}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedApps = await getJobApplications();
      setApplications(fetchedApps);
      
      const pref = await getAgentPreference();
      if (pref) {
        setHasAgentPref(true);
        setAgentIsActive(pref.isActive);
        setQuery(pref.query);
        setLocation(pref.location);
        await loadJobs(pref.query, pref.location);
      } else {
        await loadJobs(query, location);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs(query, location);
  };

  const handleUpdateAgent = async () => {
    setIsUpdatingAgent(true);
    try {
      await updateAgentPreference(query, location, true);
      setHasAgentPref(true);
      setAgentIsActive(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingAgent(false);
    }
  };

  const handleToggleAgent = async () => {
    if (!hasAgentPref) return;
    setIsUpdatingAgent(true);
    try {
      await toggleAgentPreference(!agentIsActive);
      setAgentIsActive(!agentIsActive);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingAgent(false);
    }
  };

  const handleSave = async (job: ApiJob) => {
    // Check if the job exists in the DB first by trying to save it.
    // If it's from RapidAPI, we need to add it to the user's tracker.
    await addManualApplication(job.company, job.title, "SAVED");
    const fetchedApps = await getJobApplications();
    setApplications(fetchedApps);
  };

  const handleApply = async (job: ApiJob) => {
    await addManualApplication(job.company, job.title, "APPLIED");
    const fetchedApps = await getJobApplications();
    setApplications(fetchedApps);
    if (job.url && job.url !== "#") {
      window.open(job.url, "_blank");
    }
  };

  // We can't strictly match RapidAPI job IDs with DB application job IDs unless we store them. 
  // We'll match by title and company for the live board UI state.
  const getApplicationStatus = (job: ApiJob) => {
    const app = applications.find(a => a.jobTitle === job.title && a.companyName === job.company);
    return app?.status || null;
  };

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
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-2xl text-slate-900">Job Board</span>
          </div>
          <p className="text-slate-500 text-sm">
            Browse open positions from top companies and easily apply with your crafted resume and cover letters.
          </p>
        </div>
        <div>
          <Link href="/dashboard/tracker">
            <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold h-12 rounded-lg transition-colors border border-slate-200">
              Go to Job Tracker
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10 relative">
        <div className="max-w-4xl mx-auto pb-20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-slate-900">Recommended Jobs</h1>
          </div>

          <form onSubmit={handleSearch} className="mb-8 flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Role / Keyword</label>
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Software Engineer" 
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Location</label>
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. Remote, New York" 
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isSearching} className="h-10 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold">
                {isSearching ? "Searching..." : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Automated Agent Configuration Card */}
          <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                Automated Job Search Agent 
                {agentIsActive && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider animate-pulse">
                    Active
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-600">
                Let the agent run daily searches for <span className="font-semibold">"{query}"</span> in <span className="font-semibold">"{location || 'Anywhere'}"</span>. 
                New matches will be automatically added to your Job Tracker.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasAgentPref ? (
                <Button 
                  onClick={handleToggleAgent} 
                  disabled={isUpdatingAgent}
                  variant="outline"
                  className={`border-2 ${agentIsActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                >
                  {isUpdatingAgent ? "Updating..." : agentIsActive ? "Stop Agent" : "Start Agent"}
                </Button>
              ) : null}
              
              <Button 
                onClick={handleUpdateAgent} 
                disabled={isUpdatingAgent}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdatingAgent ? "Saving..." : (hasAgentPref ? "Update Preferences" : "Enable Agent")}
              </Button>
            </div>
          </div>

          {loading || isSearching ? (
            <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading live jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs found</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Try adjusting your search criteria to find more opportunities.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => {
                const status = getApplicationStatus(job);
                return (
                  <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-4">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                          <div className="flex items-center text-slate-700">
                            <Building className="w-4 h-4 mr-1.5" /> {job.company}
                          </div>
                          {job.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1.5" /> {job.location}
                            </div>
                          )}
                          {job.salary && (
                            <div className="flex items-center text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs border border-green-100">
                              <DollarSign className="w-3.5 h-3.5 mr-0.5" /> {job.salary}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {status === 'APPLIED' ? (
                          <div className="px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-lg text-sm flex items-center border border-green-200">
                            Applied
                          </div>
                        ) : (
                          <>
                            <Button 
                              variant={status === 'SAVED' ? "default" : "outline"}
                              className={`rounded-lg ${status === 'SAVED' ? 'bg-slate-800 text-white hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:text-slate-900'}`}
                              onClick={() => handleSave(job)}
                              disabled={status === 'SAVED'}
                            >
                              <Bookmark className="w-4 h-4 mr-2" />
                              {status === 'SAVED' ? 'Saved' : 'Save'}
                            </Button>
                            <Button 
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleApply(job)}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Apply
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {job.description}
                    </p>
                    {job.url && job.url !== "#" && (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-semibold hover:underline inline-flex items-center">
                        View Original Posting <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
