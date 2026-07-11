import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, CheckCircle2, Sparkles, Send, Loader2, Award, Info } from 'lucide-react';
import { Job } from '../types';

interface PlacementsProps {
  onAppliedJob: () => void;
}

export default function Placements({ onAppliedJob }: PlacementsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading job board:", err);
        setLoading(false);
      });
  }, []);

  const handleApply = async (id: string) => {
    setApplyingId(id);
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id })
      });
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        onAppliedJob(); // trigger points refresh on top-level state
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="placements-root">
      {/* Placement Header Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="placements-header-overview">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5 font-sans">
            <Briefcase className="w-5 h-5 text-indigo-600" /> Career Placement Center
          </h2>
          <p className="text-xs text-slate-500">
            Browse corporate vacancies, verify technical alignment metrics, and submit resumes directly to partner recruiters.
          </p>
        </div>

        {/* Dynamic score summary */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2.5">
          <Award className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-[9px] font-mono block text-slate-400 uppercase font-bold">Placements Status</span>
            <span className="text-xs font-bold text-slate-700">Interview invitations: 1 Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Listings Column (Left, 2 columns) */}
        <div className="lg:col-span-2 space-y-4" id="job-postings-list">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4"
              id={`job-post-card-${job.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={job.logo} 
                    alt={job.company} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{job.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">{job.company}</div>
                  </div>
                </div>

                {/* Score badge */}
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-2 py-1 text-xs font-bold font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> {job.matchScore}% Match
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">{job.datePosted}</span>
                </div>
              </div>

              {/* Attributes block */}
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 font-medium font-mono pb-2 border-b border-slate-50">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.type}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-500 font-semibold" /> {job.salary}</span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs text-slate-600 leading-normal font-sans">{job.description}</p>
                
                {/* Requirements list tags */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {job.requirements.map((r, rIdx) => (
                    <span key={rIdx} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      🛠️ {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Apply releases resume file automatically</span>
                
                {job.status === 'Applied' ? (
                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Applied (HR Screening)
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingId === job.id}
                    className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5"
                    id={`btn-apply-${job.id}`}
                  >
                    {applyingId === job.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying...
                      </>
                    ) : (
                      <>
                        Apply Now <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Career Advisory Info Box (Right, 1 column) */}
        <div className="space-y-6" id="career-advisory-col">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl border border-slate-800 shadow-sm p-5 text-white space-y-4" id="advisory-panel">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-indigo-300">
              <Info className="w-4 h-4" /> Career Placement Guide
            </h3>

            <div className="space-y-3.5 text-xs leading-normal">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-indigo-400 block mb-0.5">1. Match Analysis</span>
                We index your portfolio skills against corporate job criteria to calculate realistic hiring margins.
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-indigo-400 block mb-0.5">2. Interview Invitations</span>
                High scores on coding playground tasks prompt automated vetting alerts directly to partner firms.
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-indigo-400 block mb-0.5">3. Fast Track Placements</span>
                Graduate with &gt;500 honor points to unlock direct referral sessions with TechCorp.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
