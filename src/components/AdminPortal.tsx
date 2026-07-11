import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Briefcase, Cpu, Database, Loader2, Check, X, 
  RefreshCw, ShieldAlert, Plus, Search, Settings, Shield, Trash2, 
  Sparkles, HardDrive, CheckCircle2, AlertTriangle, Play, HelpCircle
} from 'lucide-react';
import { Course, Job, Language } from '../types';

interface AuditLog {
  id: string;
  time: string;
  type: 'SUCCESS' | 'INFO' | 'SYNC' | 'WARNING';
  message: string;
}

export default function AdminPortal() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [studentStats, setStudentStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Forms and Expansion States
  const [showAddCompiler, setShowAddCompiler] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);

  // Add Compiler fields
  const [newLangId, setNewLangId] = useState('');
  const [newLangName, setNewLangName] = useState('');
  const [newLangDesc, setNewLangDesc] = useState('');
  const [newLangColor, setNewLangColor] = useState('#6366F1');

  // Add Job fields
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobSalary, setNewJobSalary] = useState('$90,000 - $110,000');
  const [newJobType, setNewJobType] = useState('Full-time');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobReqs, setNewJobReqs] = useState('');

  // Compiler VM Tweaks State
  const [vmMemory, setVmMemory] = useState<number>(256);
  const [vmTimeout, setVmTimeout] = useState<number>(5000);
  const [vmStrict, setVmStrict] = useState<boolean>(true);

  // Logs terminal state
  const [searchQuery, setSearchQuery] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<string>('ALL');
  const [logs, setLogs] = useState<AuditLog[]>([
    { id: '1', time: '10:47:12 AM', type: 'SUCCESS', message: 'isPalindrome tests passed for student@devacademy.edu' },
    { id: '2', time: '10:47:04 AM', type: 'INFO', message: 'Saved Resume Profile for David Mercer' },
    { id: '3', time: '10:46:50 AM', type: 'SYNC', message: 'Synchronized live quiz lobby for quiz-js-basics' },
    { id: '4', time: '10:46:41 AM', type: 'SUCCESS', message: 'twoSum tests passed for Emily Watson' },
    { id: '5', time: '10:45:10 AM', type: 'WARNING', message: 'V8 compilation peak memory usage exceeded 150MB' },
    { id: '6', time: '10:44:02 AM', type: 'INFO', message: 'Database data_store.json file persistence completed successfully' }
  ]);

  // Toast State
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'info' | 'warning' }[]>([]);

  const addToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const resCourses = await fetch('/api/courses');
      const dataCourses = await resCourses.json();
      setCourses(dataCourses);

      const resJobs = await fetch('/api/jobs');
      const dataJobs = await resJobs.json();
      setJobs(dataJobs);

      const resLanguages = await fetch('/api/languages');
      const dataLanguages = await resLanguages.json();
      setLanguages(dataLanguages);

      const resStats = await fetch('/api/student/stats');
      const dataStats = await resStats.json();
      setStudentStats(dataStats);
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading admin stats:", err);
      addToast("Failed to fetch server data. Reverting to local fallback.", "warning");
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApproveJob = async (jobId: string, company: string, title: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/approve`, { method: 'POST' });
      if (res.ok) {
        addToast(`Successfully approved and published "${title}" at ${company}!`, 'success');
        
        // Add log entry
        const timeNow = new Date().toLocaleTimeString();
        setLogs(prev => [
          { id: Date.now().toString(), time: timeNow, type: 'SUCCESS', message: `Approved job post "${title}" at ${company}` },
          ...prev
        ]);
        
        fetchStats();
      } else {
        throw new Error("Failed to approve");
      }
    } catch (e) {
      // Local state fallback
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Not Applied' } : j));
      addToast(`Approved "${title}" (Local fallback)`, 'success');
    }
  };

  const handleDeclineJob = async (jobId: string, company: string, title: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`Declined and removed "${title}" from the queue.`, 'info');
        
        // Add log entry
        const timeNow = new Date().toLocaleTimeString();
        setLogs(prev => [
          { id: Date.now().toString(), time: timeNow, type: 'WARNING', message: `Declined job posting ID: ${jobId} ("${title}")` },
          ...prev
        ]);

        fetchStats();
      } else {
        throw new Error("Failed to decline");
      }
    } catch (e) {
      // Local fallback
      setJobs(prev => prev.filter(j => j.id !== jobId));
      addToast(`Declined "${title}" from view.`, 'info');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobCompany.trim()) {
      addToast("Please fill out Title and Company fields.", "warning");
      return;
    }

    const reqsArray = newJobReqs
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const payload = {
      title: newJobTitle,
      company: newJobCompany,
      location: newJobLocation,
      salary: newJobSalary,
      type: newJobType,
      description: newJobDesc || "Dynamic interactive placement opportunities.",
      requirements: reqsArray.length > 0 ? reqsArray : ["Professional fullstack experience"]
    };

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        addToast(`Registered job vacancy "${newJobTitle}" successfully!`, 'success');
        
        // Add log entry
        const timeNow = new Date().toLocaleTimeString();
        setLogs(prev => [
          { id: Date.now().toString(), time: timeNow, type: 'INFO', message: `Registered new job "${newJobTitle}" at ${newJobCompany}` },
          ...prev
        ]);

        setNewJobTitle('');
        setNewJobCompany('');
        setNewJobDesc('');
        setNewJobReqs('');
        setShowAddJob(false);
        fetchStats();
      }
    } catch (e) {
      addToast("Failed to register job. Local storage constraint occurred.", "warning");
    }
  };

  const handleRegisterCompiler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangId.trim() || !newLangName.trim()) {
      addToast("Please input a compiler identifier and a reader name.", "warning");
      return;
    }

    const payload = {
      id: newLangId.trim().toLowerCase(),
      name: newLangName.trim(),
      description: newLangDesc || "Isolated virtual sandbox compilation engine.",
      color: newLangColor,
      icon: 'Cpu'
    };

    try {
      const res = await fetch('/api/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast(`Compiler "${newLangName}" deployed successfully!`, 'success');
        
        // Add log
        const timeNow = new Date().toLocaleTimeString();
        setLogs(prev => [
          { id: Date.now().toString(), time: timeNow, type: 'SUCCESS', message: `Deployed compiler sandbox for ${newLangName} (${payload.id})` },
          ...prev
        ]);

        setNewLangId('');
        setNewLangName('');
        setNewLangDesc('');
        setShowAddCompiler(false);
        fetchStats();
      } else {
        const errData = await res.json();
        addToast(errData.error || "Failed to register compiler", "warning");
      }
    } catch (e) {
      addToast("Compiler registry server offline.", "warning");
    }
  };

  const handleSaveVMSettings = () => {
    if (!selectedLang) return;
    addToast(`Successfully saved secure VM constraints for ${selectedLang.name}!`, 'success');
    
    // Add log
    const timeNow = new Date().toLocaleTimeString();
    setLogs(prev => [
      { id: Date.now().toString(), time: timeNow, type: 'INFO', message: `Updated VM constraints: Memory=${vmMemory}MB, Timeout=${vmTimeout}ms, SandboxStrict=${vmStrict}` },
      ...prev
    ]);

    setSelectedLang(null);
  };

  const triggerMockEvent = () => {
    const mockEvents: Omit<AuditLog, 'id' | 'time'>[] = [
      { type: 'SUCCESS', message: 'All 4 unit tests passed for user carlos@devacademy.edu in python-fizzbuzz' },
      { type: 'INFO', message: 'Cleaned node_modules cache inside v8-sandbox-isolate' },
      { type: 'WARNING', message: 'High CPU core temperature detected on cluster host-02 (89°C)' },
      { type: 'SYNC', message: 'Synchronized real-time whiteboard payload stream (24 points, 15 viewers)' },
      { type: 'SUCCESS', message: 'Successfully generated custom resume portfolio PDF for Emily Watson' }
    ];

    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    const timeNow = new Date().toLocaleTimeString();
    
    setLogs(prev => [
      { id: Date.now().toString(), time: timeNow, ...randomEvent },
      ...prev
    ]);
    
    addToast("Injected simulated sandbox activity event!", "info");
  };

  const clearAllLogs = () => {
    setLogs([]);
    addToast("Cleared local terminal audit records.", "info");
  };

  // Filter logs based on search and selected filter type
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = logTypeFilter === 'ALL' || log.type === logTypeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-mono text-slate-500">Loading Admin Secure Isolate Data...</p>
      </div>
    );
  }

  // Count the pending partner jobs (in current DB, jobs with status starting with 'Applied' or we can just filter all)
  const pendingJobs = jobs.filter(j => j.status === 'Applied');
  const activeJobs = jobs.filter(j => j.status !== 'Applied');

  return (
    <div className="space-y-8 animate-fade-in" id="admin-root-container">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" id="admin-toasts-portal">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-fade-in-up transition-all ${
              t.type === 'success' ? 'bg-white border-emerald-100 text-slate-800 shadow-emerald-500/5' :
              t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              'bg-indigo-900 border-indigo-800 text-white'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
            {t.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-300 shrink-0" />}
            <span className="text-xs font-semibold">{t.text}</span>
          </div>
        ))}
      </div>

      {/* Header Overview Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="admin-welcome-banner">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-400/20 rounded-full px-3 py-1 text-indigo-300 text-[10px] font-mono uppercase tracking-wider font-bold">
            <Shield className="w-3.5 h-3.5" /> Root Administrator
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">Academy Operations Console</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Configure secure compiler VM sandboxes, verify partner employment vacancy queues, and audit live user actions.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          <button
            onClick={() => { setShowAddCompiler(!showAddCompiler); setShowAddJob(false); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              showAddCompiler 
                ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{showAddCompiler ? 'Collapse Registry' : 'Register Compiler'}</span>
          </button>

          <button
            onClick={() => { setShowAddJob(!showAddJob); setShowAddCompiler(false); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              showAddJob 
                ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{showAddJob ? 'Collapse Form' : 'Submit Job Post'}</span>
          </button>
        </div>
      </div>

      {/* 4 Analytics Grid Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" id="admin-analytics-grid">
        <div className="bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 shrink-0">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[9px] md:text-[10px] font-mono font-bold text-slate-400 block uppercase">Active Students</span>
            <span className="text-base md:text-xl font-extrabold text-slate-800">1,240 devs</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 hover:border-emerald-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 shrink-0">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[9px] md:text-[10px] font-mono font-bold text-slate-400 block uppercase">Active Courses</span>
            <span className="text-base md:text-xl font-extrabold text-slate-800">{courses.length} Tracks</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 hover:border-amber-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 shrink-0">
            <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-[9px] md:text-[10px] font-mono font-bold text-slate-400 block uppercase">Partner Vacancies</span>
            <span className="text-base md:text-xl font-extrabold text-slate-800">{jobs.length} open</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 hover:border-rose-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 shrink-0">
            <Database className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />
          </div>
          <div>
            <span className="text-[9px] md:text-[10px] font-mono font-bold text-slate-400 block uppercase">Sandboxed Tests</span>
            <span className="text-base md:text-xl font-extrabold text-slate-800">
              {studentStats?.submissions?.length || 18} runs
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Form: Register Compiler Sandbox */}
      {showAddCompiler && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4 animate-fade-in" id="add-compiler-panel">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-sm">Deploy New Runtime Sandbox Compiler</h3>
          </div>
          <form onSubmit={handleRegisterCompiler} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Compiler ID (Unique)</label>
              <input 
                type="text" 
                placeholder="e.g. go, rust, cplusplus" 
                value={newLangId}
                onChange={e => setNewLangId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Compiler Reader Name</label>
              <input 
                type="text" 
                placeholder="e.g. Go Compiler Core" 
                value={newLangName}
                onChange={e => setNewLangName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Compiler Scope / Description</label>
              <input 
                type="text" 
                placeholder="Secure sandboxed compilation for concurrency logic programs." 
                value={newLangDesc}
                onChange={e => setNewLangDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div className="md:col-span-4 flex justify-between items-center pt-2 gap-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 font-semibold block uppercase">Brand Highlight:</span>
                <input 
                  type="color" 
                  value={newLangColor} 
                  onChange={e => setNewLangColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompiler(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition-all"
                >
                  Deploy Compiler Engine
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Expandable Form: Submit Job Post */}
      {showAddJob && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-md space-y-4 animate-fade-in" id="add-job-panel">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-sm">Submit Employment Vacancy to Queue</h3>
          </div>
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Job Position Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Backend Engineer (Go/Node)" 
                  value={newJobTitle}
                  onChange={e => setNewJobTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Hiring Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Apex Software" 
                  value={newJobCompany}
                  onChange={e => setNewJobCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Type</label>
                  <select 
                    value={newJobType}
                    onChange={e => setNewJobType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Location</label>
                  <input 
                    type="text" 
                    value={newJobLocation}
                    onChange={e => setNewJobLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Estimated Salary Range</label>
                <input 
                  type="text" 
                  placeholder="e.g. $95,000 - $120,000" 
                  value={newJobSalary}
                  onChange={e => setNewJobSalary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Requirements (one per line)</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Strong React hooks knowledge&#10;Experience with Node backend API routes" 
                  value={newJobReqs}
                  onChange={e => setNewJobReqs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Role Scope / Description Summary</label>
              <textarea 
                rows={2}
                placeholder="Provide a brief summary of team responsibilities and primary engineering workflows..." 
                value={newJobDesc}
                onChange={e => setNewJobDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowAddJob(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md shadow-indigo-600/10 transition-all"
              >
                Submit to Pending Approval Queue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Core Display Section: Left (Compilers and Job Queues) - Right (Audit Terminal log) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side (8/12 Columns) */}
        <div className="lg:col-span-7 space-y-8" id="left-admin-column">
          
          {/* Languages & Compilers Support Manager */}
          <div className="space-y-4" id="languages-support-manager">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Cpu className="w-4.5 h-4.5 text-indigo-500" /> Sandboxed Compiler Runtimes
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Click a compiler module card to configure its micro Virtual Machine container.</p>
              </div>
              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 font-bold">
                {languages.length} Virtual Environments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map((lang) => (
                <div 
                  key={lang.id} 
                  onClick={() => {
                    setSelectedLang(lang);
                    // Preset default simulated values depending on runtime
                    setVmMemory(lang.id === 'python' ? 512 : lang.id === 'javascript' ? 256 : 128);
                    setVmTimeout(lang.id === 'python' ? 8000 : 5000);
                  }}
                  className="bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-4 flex items-start gap-4 transition-all hover:shadow-md cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-45 transition-transform" />
                  </div>

                  <div 
                    style={{ color: lang.color, borderColor: `${lang.color}20` }}
                    className="bg-slate-50 border p-3 rounded-xl text-xs font-extrabold font-mono shrink-0 w-11 h-11 flex items-center justify-center uppercase"
                  >
                    {lang.id.slice(0, 3)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-xs leading-none group-hover:text-indigo-600 transition-colors">{lang.name} Engine</h4>
                    <p className="text-[11px] text-slate-500 leading-snug truncate pr-3">{lang.description}</p>
                    <div className="pt-1.5 flex items-center gap-1.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-slate-400 font-medium">
                        VM ISOLATE ONLINE
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Postings Verification Approvals Queue */}
          <div className="space-y-4" id="placement-queue-manager">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500" /> Partner Vacancy Verification Queue
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Approve, decline, or purge submitted roles from the student placement deck.</p>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold px-2.5 py-1 rounded-md">
                {pendingJobs.length} Pending
              </span>
            </div>

            {pendingJobs.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3.5 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                  <Check className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Clear Approvals Queue</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    All partner job vacancies are validated and actively posted inside the primary placement feed records.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingJobs.map((job) => (
                  <div key={job.id} className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                    <div className="flex items-center gap-3">
                      <img 
                        src={job.logo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100"} 
                        alt={job.company} 
                        className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 text-xs truncate">{job.title}</h4>
                          <span className="text-[8px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded uppercase font-semibold">
                            {job.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {job.company} &bull; <span className="text-indigo-600 font-semibold">{job.salary}</span> &bull; {job.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleDeclineJob(job.id, job.company, job.title)}
                        className="flex-1 sm:flex-none border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                        title="Decline and remove from portal"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => handleApproveJob(job.id, job.company, job.title)}
                        className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors shadow-xs"
                        title="Approve and publish role"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Placements Deck (Optional reference) */}
          <div className="space-y-4" id="placement-active-deck">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase font-mono">
                  <Check className="w-4 h-4 text-emerald-500" /> Published Live Placements ({activeJobs.length})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeJobs.map((job) => (
                <div key={job.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-700 text-xs truncate leading-snug">{job.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{job.company} &bull; {job.location}</p>
                    <span className="inline-block text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded font-mono font-bold mt-1.5 uppercase">
                      ACTIVE DEPLOYED
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeclineJob(job.id, job.company, job.title)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Archive Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side Database Log & Audit Terminal Console (5/12 Columns) */}
        <div className="lg:col-span-5 space-y-6" id="database-audit-log-col">
          
          <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 md:p-6 text-slate-300 space-y-4 shadow-xl" id="audit-log-panel">
            
            {/* Console Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-850 pb-4">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-indigo-400 uppercase font-mono">
                  <Database className="w-4.5 h-4.5 animate-pulse" /> Sandbox Audit Records
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Real-time V8 isolated log event listener.</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={triggerMockEvent}
                  className="bg-slate-900 hover:bg-slate-850 text-indigo-300 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all"
                  title="Manually inject system event"
                >
                  + Inject Log
                </button>
                <button 
                  onClick={clearAllLogs}
                  className="bg-slate-900 hover:bg-slate-850 text-rose-300 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Live Search and Filters */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Query system log trace..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-[11px] font-mono outline-none text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Logs filter tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-850">
                {['ALL', 'SUCCESS', 'INFO', 'WARNING', 'SYNC'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setLogTypeFilter(lvl)}
                    className={`flex-1 text-center py-1 rounded text-[8px] font-mono font-bold tracking-tight uppercase transition-all ${
                      logTypeFilter === lvl 
                        ? 'bg-slate-800 text-indigo-300 border border-slate-700/50' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Log Terminal Lines */}
            <div className="bg-slate-900 rounded-xl border border-slate-850/80 p-4 space-y-3 max-h-[360px] overflow-y-auto font-mono text-[10px] leading-relaxed relative" style={{ scrollbarWidth: 'thin' }}>
              
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600 space-y-2">
                  <Database className="w-8 h-8 text-slate-800" />
                  <p className="text-center">No terminal logs match filter parameters.</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  let badgeColor = "text-indigo-400";
                  if (log.type === 'SUCCESS') badgeColor = "text-emerald-400";
                  if (log.type === 'WARNING') badgeColor = "text-amber-500";
                  if (log.type === 'SYNC') badgeColor = "text-cyan-400";
                  
                  return (
                    <div key={log.id} className="border-b border-slate-950/40 pb-2.5 last:border-0 last:pb-0 flex items-start gap-2 animate-fade-in">
                      <span className="text-slate-600 select-none shrink-0">[{log.time}]</span>
                      <span className={`${badgeColor} font-bold shrink-0`}>{log.type}:</span>
                      <span className="text-slate-300 break-words">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Refresh / Reload triggers */}
            <button 
              onClick={fetchStats}
              disabled={isRefreshing}
              className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 border border-slate-850 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} /> 
              <span>{isRefreshing ? 'Re-compiling Cluster Metrics...' : 'Flush & Refresh Logs'}</span>
            </button>
          </div>

          {/* Infrastructure Health Stats Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4.5 h-4.5 text-indigo-500" /> Sandbox Core Health
            </h4>
            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>SANDBOX RAM ALLOCATION</span>
                  <span className="font-bold text-slate-700">712MB / 2.0GB</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>CONTAINER CPU WORKLOAD</span>
                  <span className="font-bold text-slate-700">4.2% Peak load</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Advanced Sandbox VM Config HUD Overlay Modal */}
      {selectedLang && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in" id="compiler-config-modal">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Aesthetic highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold">
                  Secure VM Isolate Is-2
                </div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" /> {selectedLang.name} Sandbox config
                </h3>
                <p className="text-xs text-slate-400">Control runtime compute constraints for compilation cycles.</p>
              </div>
              <button 
                onClick={() => setSelectedLang(null)}
                className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Sandbox details */}
            <div className="space-y-5 text-sm">
              
              {/* RAM Constraint Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-300 font-bold uppercase">Memory Allocation Limit</span>
                  <span className="text-indigo-400 font-bold font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {vmMemory} MB
                  </span>
                </div>
                <input 
                  type="range" 
                  min={64} 
                  max={1024} 
                  step={64}
                  value={vmMemory}
                  onChange={e => setVmMemory(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>64MB (Sparsely isolated)</span>
                  <span>1024MB (Denser processing)</span>
                </div>
              </div>

              {/* Compile Cycle Timeout Limit */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-300 font-bold uppercase">Compilation Timeout</span>
                  <span className="text-cyan-400 font-bold font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    {vmTimeout} ms
                  </span>
                </div>
                <input 
                  type="range" 
                  min={1000} 
                  max={15000} 
                  step={500}
                  value={vmTimeout}
                  onChange={e => setVmTimeout(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>1s (Defensive)</span>
                  <span>15s (Verbose runs)</span>
                </div>
              </div>

              {/* Strict Sandbox toggle */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex items-center justify-between gap-3">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-white block">Strict Sandbox Protection</span>
                  <p className="text-[10px] text-slate-400">Block file system interactions, active web hooks, and raw socket sockets.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setVmStrict(!vmStrict)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${vmStrict ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${vmStrict ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Simulated active graph chart */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Isolate Telemetry Feed</span>
                <div className="flex items-end justify-between h-14 pt-2 px-1">
                  {[20, 15, 30, 45, 60, 40, 25, 35, 55, 75, 45, 20, 15, 40, 25].map((val, idx) => (
                    <div 
                      key={idx} 
                      style={{ height: `${val}%` }} 
                      className={`w-1.5 rounded-t-sm transition-all duration-300 ${
                        val > 70 ? 'bg-amber-500' : val > 40 ? 'bg-indigo-500' : 'bg-indigo-400/50'
                      }`} 
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-600">
                  <span>Core-0 V8 thread</span>
                  <span>Active load state: NORMAL</span>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedLang(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Discard Constraints
              </button>
              <button
                onClick={handleSaveVMSettings}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-all"
              >
                Deploy Secure VM Constraints
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
