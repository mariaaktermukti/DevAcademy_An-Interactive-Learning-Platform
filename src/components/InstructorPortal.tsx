import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Plus, Tv, Radio, HelpCircle, Users, CheckCircle2, Sliders, Play, RotateCcw, ChevronRight, Loader2, ListPlus, Send, Trash2, Search, Database, Trophy, Zap, Timer, Check } from 'lucide-react';
import { Course, Quiz, LiveQuizState, LiveStreamState } from '../types';

export default function InstructorPortal() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [liveQuiz, setLiveQuiz] = useState<LiveQuizState & { quiz?: Quiz } | null>(null);
  const [streamState, setStreamState] = useState<LiveStreamState | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states - Course creation
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseLang, setNewCourseLang] = useState('javascript');
  const [newCourseLevel, setNewCourseLevel] = useState('Beginner');
  const [newCourseDuration, setNewCourseDuration] = useState('10 Hours');
  const [newCourseCover, setNewCourseCover] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400');

  // Course Bank UI states
  const [activeLeftTab, setActiveLeftTab] = useState<'create' | 'bank'>('create');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCourse, setCreatedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Challenge creation success states
  const [showChallengeSuccessModal, setShowChallengeSuccessModal] = useState(false);
  const [createdChallengeData, setCreatedChallengeData] = useState<{
    title: string;
    courseTitle: string;
    points: number;
    difficulty: string;
    targetCourseId: string;
  } | null>(null);

  // Live Sync Quiz Remote Console state
  const [showQuizRemoteModal, setShowQuizRemoteModal] = useState(false);
  const [isSimulatingParticipants, setIsSimulatingParticipants] = useState(false);

  // Form states - Challenge creation
  const [targetCourseId, setTargetCourseId] = useState('');
  const [targetModuleId, setTargetModuleId] = useState('');
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDesc, setNewChallengeDesc] = useState('');
  const [newChallengeCode, setNewChallengeCode] = useState('');
  const [newChallengePoints, setNewChallengePoints] = useState(50);
  const [newChallengeDiff, setNewChallengeDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [tcInput1, setTcInput1] = useState('');
  const [tcOutput1, setTcOutput1] = useState('');
  const [tcInput2, setTcInput2] = useState('');
  const [tcOutput2, setTcOutput2] = useState('');

  // active course select helper for modules
  const activeCourseObj = courses.find(c => c.id === targetCourseId);

  // Poll stream and quiz states periodically to sync dashboard
  useEffect(() => {
    const loadInitials = async () => {
      try {
        const cRes = await fetch('/api/courses');
        const cData = await cRes.json();
        setCourses(cData);
        if (cData.length > 0) {
          setTargetCourseId(cData[0].id);
        }

        const qRes = await fetch('/api/quizzes');
        const qData = await qRes.json();
        setQuizzes(qData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading instructor tools:", err);
        setLoading(false);
      }
    };

    loadInitials();

    const fetchSyncState = () => {
      fetch('/api/live-quiz/state')
        .then(res => res.json())
        .then(data => setLiveQuiz(data));

      fetch('/api/live-stream/state')
        .then(res => res.json())
        .then(data => setStreamState(data));
    };

    fetchSyncState();
    const interval = setInterval(fetchSyncState, 2000);
    return () => clearInterval(interval);
  }, []);

  const simulateStudentsJoining = async () => {
    setIsSimulatingParticipants(true);
    const names = ["Anya Chen", "Chloe Bennett", "Devon Cole", "Ravi Patel", "Sarah Jenkins"];
    for (const name of names) {
      try {
        await fetch('/api/live-quiz/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
      } catch (err) {
        console.error(err);
      }
    }
    try {
      const res = await fetch('/api/live-quiz/state');
      const data = await res.json();
      setLiveQuiz(data);
    } catch (e) {
      console.error(e);
    }
    setIsSimulatingParticipants(false);
  };

  const simulateStudentAnswers = async () => {
    if (!liveQuiz || !liveQuiz.quiz || liveQuiz.currentQuestionIndex < 0) return;
    const currentQuestion = liveQuiz.quiz.questions[liveQuiz.currentQuestionIndex];
    const participants = liveQuiz.participants || [];
    
    for (const p of participants) {
      const isCorrect = Math.random() > 0.3; // 70% chance of correct
      const answerIndex = isCorrect 
        ? currentQuestion.correctAnswerIndex 
        : (currentQuestion.correctAnswerIndex + 1) % currentQuestion.options.length;
      
      try {
        await fetch('/api/live-quiz/submit-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: p.name, answerIndex })
        });
      } catch (err) {
        console.error(err);
      }
    }
    
    try {
      const res = await fetch('/api/live-quiz/state');
      const data = await res.json();
      setLiveQuiz(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle,
          description: newCourseDesc,
          languageId: newCourseLang,
          level: newCourseLevel,
          coverUrl: newCourseCover,
          duration: newCourseDuration
        })
      });
      const data = await res.json();
      setCourses(prev => [...prev, data]);
      setTargetCourseId(data.id);
      
      // Auto-create a default Module for the course
      const modRes = await fetch(`/api/courses/${data.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Module 1: General Core', description: 'Core topics' })
      });
      const modData = await modRes.json();
      
      // reload courses
      const reloadRes = await fetch('/api/courses');
      const reloadData = await reloadRes.json();
      setCourses(reloadData);

      // Find the fully reloaded course record with modules inside it
      const completeNewCourse = reloadData.find((c: Course) => c.id === data.id) || data;

      setNewCourseTitle('');
      setNewCourseDesc('');
      setCreatedCourse(completeNewCourse);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course track? This will delete all modules and challenges inside it.")) {
      return;
    }
    setIsDeleting(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        if (targetCourseId === courseId) {
          const remaining = courses.filter(c => c.id !== courseId);
          setTargetCourseId(remaining.length > 0 ? remaining[0].id : '');
        }
      } else {
        alert("Failed to delete course track.");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCourseId || !newChallengeTitle.trim()) {
      alert("Please enter a challenge title and select a track");
      return;
    }

    // Default target moduleId to first module if none selected
    let modId = targetModuleId;
    if (!modId && activeCourseObj && activeCourseObj.modules.length > 0) {
      modId = activeCourseObj.modules[0].id;
    }

    if (!modId) {
      alert("Please ensure the course has at least one Module defined first");
      return;
    }

    const testCasesPayload = [
      { id: 't-new1', input: tcInput1 || '5', expectedOutput: tcOutput1 || '10', isPublic: true },
      { id: 't-new2', input: tcInput2 || '10', expectedOutput: tcOutput2 || '20', isPublic: false }
    ];

    try {
      const res = await fetch(`/api/courses/${targetCourseId}/modules/${modId}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChallengeTitle,
          description: newChallengeDesc,
          problemStatement: newChallengeCode || `function myFunc(x) {\n  return x;\n}`,
          initialCode: newChallengeCode || `function myFunc(x) {\n  return x;\n}`,
          testCases: testCasesPayload,
          points: Number(newChallengePoints),
          difficulty: newChallengeDiff
        })
      });
      const data = await res.json();
      
      // update courses list
      const reloadRes = await fetch('/api/courses');
      const reloadData = await reloadRes.json();
      setCourses(reloadData);

      const targetCourse = reloadData.find((c: Course) => c.id === targetCourseId);
      setCreatedChallengeData({
        title: newChallengeTitle,
        courseTitle: targetCourse ? targetCourse.title : "Selected Track",
        points: Number(newChallengePoints),
        difficulty: newChallengeDiff,
        targetCourseId: targetCourseId
      });

      setNewChallengeTitle('');
      setNewChallengeDesc('');
      setNewChallengeCode('');
      setTcInput1('');
      setTcOutput1('');
      setTcInput2('');
      setTcOutput2('');
      setShowChallengeSuccessModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuizAction = async (action: 'start' | 'next' | 'reset', quizId?: string) => {
    try {
      const res = await fetch('/api/live-quiz/host-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, quizId })
      });
      const data = await res.json();
      setLiveQuiz(data);

      if (action === 'start') {
        setShowQuizRemoteModal(true);
        simulateStudentsJoining();
      } else if (action === 'reset') {
        setShowQuizRemoteModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStreamAction = async (action: 'start' | 'stop') => {
    try {
      const res = await fetch('/api/live-stream/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setStreamState(data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = langFilter === 'all' || c.languageId === langFilter;
    return matchesSearch && matchesLang;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="instructor-root">
      
      {/* Course & Challenge Form Builders (Left Panel, 7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Tab Controls for Creators Studio vs Course Bank */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60" id="left-panel-tabs">
          <button
            onClick={() => setActiveLeftTab('create')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeLeftTab === 'create'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" /> Creators Studio
          </button>
          <button
            onClick={() => setActiveLeftTab('bank')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeLeftTab === 'bank'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" /> Course Bank ({courses.length})
          </button>
        </div>

        {activeLeftTab === 'bank' ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 animate-fade-in" id="course-bank-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Database className="w-4.5 h-4.5 text-indigo-500" /> Published Course Bank
                </h3>
                <p className="text-[10px] text-slate-400">View and manage all course tracks currently published on DevAcademy.</p>
              </div>
              <button
                onClick={() => setActiveLeftTab('create')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Publish New Track
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search course tracks..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none"
                />
              </div>
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none font-medium text-slate-600"
              >
                <option value="all">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="htmlcss">HTML & CSS</option>
              </select>
            </div>

            {/* Courses grid */}
            {filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                <Database className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-semibold text-slate-500">No published courses match your filters.</p>
                <button
                  onClick={() => { setSearchQuery(''); setLangFilter('all'); }}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((c) => {
                  const challengesCount = c.modules.reduce((acc, m) => acc + (m.challenges?.length || 0), 0);
                  return (
                    <div key={c.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <img 
                          src={c.coverUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'} 
                          alt={c.title} 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200/50 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                              c.languageId === 'javascript' ? 'bg-amber-100 text-amber-800 border border-amber-200/40' :
                              c.languageId === 'python' ? 'bg-sky-100 text-sky-800 border border-sky-200/40' :
                              'bg-rose-100 text-rose-800 border border-rose-200/40'
                            }`}>
                              {c.languageId === 'htmlcss' ? 'HTML & CSS' : c.languageId === 'javascript' ? 'JavaScript' : 'Python'}
                            </span>
                            <span className="text-[9px] font-bold bg-slate-100 border border-slate-200/30 text-slate-600 px-2 py-0.5 rounded-md">
                              {c.level}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-xs mt-1 truncate" title={c.title}>{c.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
                          
                          <div className="flex items-center gap-3 text-[9px] text-slate-400 font-medium font-mono mt-2">
                            <span>Duration: {c.duration}</span>
                            <span>&bull;</span>
                            <span>Modules: {c.modules.length}</span>
                            <span>&bull;</span>
                            <span>Challenges: {challengesCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100/80">
                        <button
                          onClick={() => {
                            setTargetCourseId(c.id);
                            setActiveLeftTab('create');
                            // Scroll to challenge form
                            setTimeout(() => {
                              const form = document.getElementById('challenge-builder-form');
                              form?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="flex-1 sm:flex-none text-center bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap shadow-xs"
                        >
                          <Plus className="w-3 h-3" /> Add Challenge
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          disabled={isDeleting === c.id}
                          className="flex-1 sm:flex-none text-center bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          {isDeleting === c.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete Track
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Track Form builder */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-fade-in" id="course-builder-form">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <BookOpen className="w-4.5 h-4.5 text-indigo-500" /> Create New Course Track
              </h3>

              <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Course Title</label>
                    <input 
                      type="text" 
                      value={newCourseTitle}
                      onChange={(e) => setNewCourseTitle(e.target.value)}
                      placeholder="e.g. Master Algorithmic Closures"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Language</label>
                    <select
                      value={newCourseLang}
                      onChange={(e) => setNewCourseLang(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="htmlcss">HTML & CSS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Curriculum Summary</label>
                  <textarea 
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    placeholder="Course outline metrics..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Level</label>
                    <select
                      value={newCourseLevel}
                      onChange={(e: any) => setNewCourseLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Duration</label>
                    <input 
                      type="text" 
                      value={newCourseDuration}
                      onChange={(e) => setNewCourseDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Cover URL</label>
                    <input 
                      type="text" 
                      value={newCourseCover}
                      onChange={(e) => setNewCourseCover(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm">
                  Publish Course Track <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Challenge Form builder */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-fade-in" id="challenge-builder-form">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <ListPlus className="w-4.5 h-4.5 text-indigo-500" /> Write Coding Challenge
              </h3>

              <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Target Course Track</label>
                    <select
                      value={targetCourseId}
                      onChange={(e) => {
                        setTargetCourseId(e.target.value);
                        setTargetModuleId('');
                      }}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Target Module</label>
                    <select
                      value={targetModuleId}
                      onChange={(e) => setTargetModuleId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="">-- First Module --</option>
                      {activeCourseObj?.modules.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Challenge Title</label>
                    <input 
                      type="text" 
                      value={newChallengeTitle}
                      onChange={(e) => setNewChallengeTitle(e.target.value)}
                      placeholder="e.g. Reverse a string"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Difficulty / XP</label>
                    <div className="flex gap-1">
                      <select
                        value={newChallengeDiff}
                        onChange={(e: any) => setNewChallengeDiff(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-1.5 py-1.5 text-xs focus:outline-none font-bold"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <input 
                        type="number" 
                        value={newChallengePoints}
                        onChange={(e) => setNewChallengePoints(Number(e.target.value))}
                        className="w-12 bg-slate-50 border border-slate-100 rounded-xl px-1 py-1.5 text-center text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Problem Statement Description</label>
                  <textarea 
                    value={newChallengeDesc}
                    onChange={(e) => setNewChallengeDesc(e.target.value)}
                    placeholder="Describe parameter expectations, Big-O metrics, and target inputs..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Initial Template Code Editor</label>
                  <textarea 
                    value={newChallengeCode}
                    onChange={(e) => setNewChallengeCode(e.target.value)}
                    placeholder={`function checkString(str) {\n  // Your template\n}`}
                    rows={3}
                    className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-4 text-xs font-mono focus:outline-none resize-none"
                  />
                </div>

                {/* Test case builders */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Test Case Definitions</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Public Test Case</span>
                      <input 
                        type="text" 
                        value={tcInput1}
                        onChange={(e) => setTcInput1(e.target.value)}
                        placeholder="Input (e.g. 'racecar')"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={tcOutput1}
                        onChange={(e) => setTcOutput1(e.target.value)}
                        placeholder="Expected Output (e.g. true)"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Secret Test Case</span>
                      <input 
                        type="text" 
                        value={tcInput2}
                        onChange={(e) => setTcInput2(e.target.value)}
                        placeholder="Input (e.g. 'hello')"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={tcOutput2}
                        onChange={(e) => setTcOutput2(e.target.value)}
                        placeholder="Expected Output (e.g. false)"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm">
                  Upload Challenge <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </>
        )}

      </div>

      {/* Synchronized Lobby Controllers (Right Panel, 5 cols) */}
      <div className="lg:col-span-5 space-y-6" id="synchronized-controllers">
        
        {/* Sync Stream Broadcast Control */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4" id="instructor-stream-panel">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Radio className="w-4.5 h-4.5 text-indigo-500 animate-pulse" /> Live Stream Controller
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-0.5">Stream Channel Status</span>
                <span className={`font-bold ${streamState?.streaming ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
                  ● {streamState?.streaming ? 'BROADCASTING LIVE' : 'CHANNEL IDLE'}
                </span>
              </div>

              {streamState?.streaming ? (
                <button
                  onClick={() => handleStreamAction('stop')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Kill Broadcast
                </button>
              ) : (
                <button
                  onClick={() => handleStreamAction('start')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Launch Broadcast
                </button>
              )}
            </div>

            {streamState?.streaming && (
              <div className="space-y-2 text-xs border border-indigo-100 p-3.5 bg-indigo-50/20 rounded-xl">
                <div className="flex justify-between font-bold">
                  <span className="text-indigo-800">Viewer Meter:</span>
                  <span className="font-mono text-slate-700">{streamState.viewers} Connected</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-indigo-800">Chalkboard:</span>
                  <span className="font-mono text-slate-700">{streamState.whiteboardPoints.length} Vectors drawn</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sync Trivia Quiz Control */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4" id="instructor-quiz-panel">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <HelpCircle className="w-4.5 h-4.5 text-indigo-500" /> Synchronous Quiz Remote
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Active Quiz</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Lobby Index</span>
              </div>
              
              <div className="font-bold text-slate-700 text-sm">
                {liveQuiz?.active ? `${liveQuiz.quiz?.title}` : 'No Quiz Active'}
              </div>

              {liveQuiz?.active && (
                <div className="text-[11px] text-slate-500 font-mono">
                  Currently serving Question {liveQuiz.currentQuestionIndex + 1} | Timer: {liveQuiz.secondsLeft}s
                </div>
              )}
            </div>

            {/* Action controls */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuizAction('start', 'quiz-js-basics')}
                disabled={liveQuiz?.active}
                className="bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                title="Trigger Lobby"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Launch
              </button>
              
              <button
                onClick={() => handleQuizAction('next')}
                disabled={!liveQuiz?.active}
                className="bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                title="Send Next Question"
              >
                <ChevronRight className="w-3.5 h-3.5" /> Next
              </button>

              <button
                onClick={() => handleQuizAction('reset')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                title="Reset Room"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {liveQuiz?.active && (
              <button
                onClick={() => setShowQuizRemoteModal(true)}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs border border-indigo-200/50 mt-2"
              >
                <Tv className="w-4 h-4 text-indigo-600" /> Open Remote Console HUD
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 5. Publish Success Popup Modal */}
      {showSuccessModal && createdCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="publish-success-modal">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden transform scale-100 transition-all space-y-5">
            
            {/* Celebration background highlight */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg font-sans">Course Track Published!</h3>
              <p className="text-xs text-slate-500 px-2">
                Your new learning curriculum was successfully compiled and listed in the academy index record.
              </p>
            </div>

            {/* Mini preview card */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/80 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                  createdCourse.languageId === 'javascript' ? 'bg-amber-100 text-amber-800 border border-amber-200/30' :
                  createdCourse.languageId === 'python' ? 'bg-sky-100 text-sky-800 border border-sky-200/30' :
                  'bg-rose-100 text-rose-800 border border-rose-200/30'
                }`}>
                  {createdCourse.languageId === 'htmlcss' ? 'HTML & CSS' : createdCourse.languageId === 'javascript' ? 'JavaScript' : 'Python'}
                </span>
                <span className="text-[8px] font-bold bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                  {createdCourse.level}
                </span>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 text-xs truncate">{createdCourse.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{createdCourse.description}</p>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-slate-400 font-mono pt-1">
                <span>Duration: {createdCourse.duration}</span>
                <span>&bull;</span>
                <span>Modules: {createdCourse.modules?.length || 1}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Close & Create More
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveLeftTab('bank');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-1"
              >
                View Course Bank <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Upload Success Popup Modal */}
      {showChallengeSuccessModal && createdChallengeData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="challenge-success-modal">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden transform scale-100 transition-all space-y-5">
            
            {/* Celebration background highlight */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-indigo-500 to-sky-500" />
            
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 animate-bounce">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg font-sans">Coding Challenge Compiled!</h3>
              <p className="text-xs text-slate-500 px-2">
                Your coding challenge has been uploaded, validated, and compiled into the course modules database.
              </p>
            </div>

            {/* Mini preview card */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/80 space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                  {createdChallengeData.difficulty}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  +{createdChallengeData.points} XP Points
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">COURSE TRACK</span>
                <h4 className="font-bold text-slate-800 text-xs truncate">{createdChallengeData.courseTitle}</h4>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">CHALLENGE TITLE</span>
                <p className="font-bold text-indigo-600 text-xs truncate">{createdChallengeData.title}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowChallengeSuccessModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Close & Create More
              </button>
              <button
                onClick={() => {
                  setShowChallengeSuccessModal(false);
                  setActiveLeftTab('bank');
                  // Filter for this course track automatically!
                  setSearchQuery(createdChallengeData.courseTitle);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-1"
              >
                View Course Bank <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Synchronous Quiz Remote HUD Console Modal */}
      {showQuizRemoteModal && liveQuiz && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in" id="quiz-remote-console-modal">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Top cosmic background bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 animate-pulse" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase font-bold">Live Synced Host Remote</span>
                </div>
                <h3 className="text-xl font-sans font-extrabold text-white mt-1 flex items-center gap-2">
                  <Tv className="w-5.5 h-5.5 text-indigo-400" /> Live Quiz Console Remote
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Host and manage active class trivia in real-time.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-300">
                  Quiz: {liveQuiz.quiz?.title || 'Basics Quiz'}
                </span>
                <button
                  onClick={() => setShowQuizRemoteModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-slate-700/50 transition-colors"
                >
                  Minimize HUD
                </button>
              </div>
            </div>

            {/* Main content grid */}
            {liveQuiz.currentQuestionIndex === -2 ? (
              /* Quiz Finished Podium State */
              <div className="text-center py-8 space-y-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-bounce">
                  <Trophy className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white">Quiz Completed Successfully!</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    All students completed the challenge run. Below is the active classroom lobby leaderboard records.
                  </p>
                </div>

                {/* Final Leaderboard / podium preview */}
                <div className="w-full max-w-md bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-2.5 text-left">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">Final Top Standings</span>
                  {(liveQuiz.participants || [])
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map((p, idx) => (
                      <div key={p.name} className="flex justify-between items-center bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                            idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/40' :
                            'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-200">{p.name}</span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-indigo-400">{p.score} pts</span>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => handleQuizAction('reset')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/10"
                >
                  Clear & Close Remote Session
                </button>
              </div>
            ) : (
              /* Active Hosting View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left: Active Question and Options */}
                <div className="lg:col-span-7 bg-slate-950/50 rounded-2xl border border-slate-800 p-5 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                        Serving Question {liveQuiz.currentQuestionIndex + 1} of {liveQuiz.quiz?.questions.length || 5}
                      </span>
                      
                      {/* Timer visual */}
                      <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 border border-amber-500/20 rounded-lg px-2.5 py-1 text-xs font-mono font-bold">
                        <Timer className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                        <span>{liveQuiz.secondsLeft}s Left</span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white leading-relaxed">
                      {liveQuiz.quiz?.questions[liveQuiz.currentQuestionIndex]?.question || "No question text loaded."}
                    </h4>

                    {/* Options list for Instructor reference */}
                    <div className="space-y-2.5 pt-2">
                      {liveQuiz.quiz?.questions[liveQuiz.currentQuestionIndex]?.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === liveQuiz.quiz?.questions[liveQuiz.currentQuestionIndex]?.correctAnswerIndex;
                        return (
                          <div 
                            key={opt}
                            className={`px-4 py-2.5 rounded-xl text-xs flex justify-between items-center transition-all border ${
                              isCorrect 
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' 
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && (
                              <span className="text-[9px] font-bold uppercase font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Simulator Control Trigger */}
                  <div className="border-t border-slate-800/80 pt-4 mt-4 flex items-center justify-between gap-3 bg-slate-900/30 p-5 rounded-b-2xl">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Demo Simulation Helper</span>
                      <p className="text-[10px] text-slate-400">Instantly generate student response submissions for interactive review.</p>
                    </div>
                    <button
                      onClick={simulateStudentAnswers}
                      disabled={isSimulatingParticipants || (liveQuiz.participants || []).length === 0}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current text-amber-300" /> Auto-Answer (Simulate)
                    </button>
                  </div>
                </div>

                {/* Right: Active Leaderboard and Participant stats */}
                <div className="lg:col-span-5 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Classroom Audience Lobby</span>
                      <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-md text-indigo-400 font-mono font-bold">
                        {(liveQuiz.participants || []).length} Joined
                      </span>
                    </div>

                    {/* Participants list */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {(liveQuiz.participants || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                          <Users className="w-10 h-10 text-slate-700" />
                          <p className="text-xs text-slate-500 font-medium font-sans">Waiting for students to sync into this lobby...</p>
                          <button
                            onClick={simulateStudentsJoining}
                            disabled={isSimulatingParticipants}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg border border-slate-700 transition-all"
                          >
                            {isSimulatingParticipants ? "Joining..." : "Simulate Student Joins"}
                          </button>
                        </div>
                      ) : (
                        (liveQuiz.participants || [])
                          .sort((a, b) => b.score - a.score)
                          .map((p) => (
                            <div key={p.name} className="flex justify-between items-center bg-slate-900/50 px-3.5 py-2.5 rounded-xl border border-slate-800/80">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 font-mono">
                                  {p.name.charAt(0)}
                                </div>
                                <span className="text-xs text-slate-200 font-bold">{p.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                                  p.answered 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                                }`}>
                                  {p.answered ? 'Submitted' : 'Thinking...'}
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-300">{p.score} pts</span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Remote host trigger controls */}
                  <div className="grid grid-cols-2 gap-3 border-t border-slate-800/50 pt-4 mt-4">
                    <button
                      onClick={() => handleQuizAction('reset')}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold py-2.5 rounded-xl text-xs border border-slate-800 transition-colors"
                    >
                      Terminate Session
                    </button>
                    <button
                      onClick={() => handleQuizAction('next')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1"
                    >
                      <span>
                        {liveQuiz.currentQuestionIndex === (liveQuiz.quiz?.questions.length || 5) - 1 
                          ? 'Finish Live Quiz' 
                          : 'Next Question'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
