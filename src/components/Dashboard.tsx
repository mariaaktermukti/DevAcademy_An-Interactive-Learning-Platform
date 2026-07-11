import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Brain, Terminal, Layout, Award, Play, ChevronRight, CheckCircle2, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { Course, Challenge, Language } from '../types';

interface DashboardProps {
  onSelectChallenge: (course: Course, challenge: Challenge) => void;
  userPoints: number;
  completedChallenges: string[];
}

export default function Dashboard({ onSelectChallenge, userPoints, completedChallenges }: DashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  // AI learning path states
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [studentLevel, setStudentLevel] = useState('Beginner');
  const [careerGoals, setCareerGoals] = useState('Build interactive SaaS applications and learn algorithms');
  const [aiPath, setAiPath] = useState<any[] | null>(null);
  const [generatingPath, setGeneratingPath] = useState(false);

  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(data => setLanguages(data))
      .catch(err => console.error("Error loading languages:", err));

    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoadingCourses(false);
      })
      .catch(err => {
        console.error("Error loading courses:", err);
        setLoadingCourses(false);
      });
  }, []);

  const handleGeneratePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingPath(true);
    setAiPath(null);

    try {
      const res = await fetch('/api/gemini/generate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang,
          level: studentLevel,
          interests: careerGoals
        })
      });
      const data = await res.json();
      if (data.path) {
        setAiPath(data.path);
      }
    } catch (err) {
      console.error("Error generating path:", err);
    } finally {
      setGeneratingPath(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-container">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-indigo-500/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6" id="welcome-hero">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-sm border border-indigo-500/20 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI-Engine Activated
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
            Welcome to <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Developer Academy</span>
          </h1>
          <p className="text-slate-300 max-w-xl text-base font-sans">
            Level up your programming skill with interactive code compilation checks, real-time sync quiz games, and mock interviews.
          </p>
        </div>

        {/* Quick point ledger */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-5 min-w-[200px]" id="point-ledger-card">
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">Honor Points</div>
            <div className="text-3xl font-extrabold text-white font-mono">{userPoints} pts</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedChallenges.length} challenges done
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard-columns">
        {/* Course Catalog (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6" id="course-catalog-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-sans">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Standard Training Tracks
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {courses.length} courses active
            </span>
          </div>

          {loadingCourses ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="courses-grid">
              {courses.map((course) => (
                <div 
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  id={`course-card-${course.id}`}
                >
                  <div>
                    <img 
                      src={course.coverUrl} 
                      alt={course.title} 
                      className="w-full h-40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                          {course.level}
                        </span>
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          ⏱️ {course.duration}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-50/80 mt-auto">
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 font-mono">Curriculum Modules</div>
                    <div className="space-y-1.5 mb-4">
                      {course.modules.slice(0, 2).map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate max-w-[180px] font-sans">📚 {m.title}</span>
                          <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {m.challenges.length} task(s)
                          </span>
                        </div>
                      ))}
                      {course.modules.length > 2 && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          + {course.modules.length - 2} more learning modules
                        </div>
                      )}
                    </div>
                    
                    {course.modules.length > 0 && course.modules[0].challenges.length > 0 ? (
                      <button 
                        onClick={() => onSelectChallenge(course, course.modules[0].challenges[0])}
                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-2.5 rounded-xl font-medium text-xs transition-colors duration-200 flex items-center justify-center gap-1.5"
                        id={`btn-course-start-${course.id}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Challenges
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full bg-slate-100 text-slate-400 py-2 rounded-xl text-xs cursor-not-allowed"
                        id={`btn-course-empty-${course.id}`}
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personalized AI learning paths (Right 1 Column) */}
        <div className="space-y-6" id="ai-path-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-sans">
              <Brain className="w-5 h-5 text-indigo-600" />
              Personalized AI Paths
            </h2>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4" id="ai-path-panel">
            <p className="text-xs text-slate-500">
              Generate a high-fidelity learning syllabus instantly structured for your career goals using the Google Gemini model.
            </p>

            <form onSubmit={handleGeneratePath} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 font-mono">Language Target</label>
                <select 
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                >
                  <option value="javascript">JavaScript (Web / Node)</option>
                  <option value="python">Python (Data / AI Systems)</option>
                  <option value="htmlcss">HTML & CSS (Design / UI)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 font-mono">Experience Level</label>
                <select 
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                >
                  <option value="Beginner">No experience (Zero to Hero)</option>
                  <option value="Intermediate">Some experience (Intermediate)</option>
                  <option value="Advanced">Experienced developer (Advanced Architect)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 font-mono">What do you want to build?</label>
                <textarea 
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                  placeholder="e.g. build dynamic dashboards or start machine learning modeling"
                />
              </div>

              <button 
                type="submit"
                disabled={generatingPath}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors duration-200 flex items-center justify-center gap-2"
                id="btn-generate-aipath"
              >
                {generatingPath ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    AI Architecting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Custom Syllabus
                  </>
                )}
              </button>
            </form>

            {/* Path Results */}
            {aiPath && (
              <div className="pt-4 border-t border-slate-200 space-y-4 animate-fade-in" id="ai-path-results">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                  <Award className="w-4 h-4 text-amber-500" />
                  Your Customized Curriculum
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {aiPath.map((module, i) => (
                    <div key={i} className="bg-white border border-indigo-100 rounded-xl p-3.5 space-y-2 relative shadow-xs">
                      <div className="absolute top-3 right-3 bg-indigo-50 text-indigo-600 text-[9px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {i + 1}
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs pr-6">{module.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">{module.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {module.skills?.map((sk: string, sIdx: number) => (
                          <span key={sIdx} className="text-[9px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            ✨ {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
