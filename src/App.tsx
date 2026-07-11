import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Terminal, HelpCircle, Radio, Brain, FileText, Briefcase, 
  Settings, Users, Trophy, ChevronRight, UserCheck, Shield, Sparkles, LogOut, CheckCircle2 
} from 'lucide-react';
import { Course, Challenge, Role, User } from './types';

import AuthScreen from './components/AuthScreen';

// Import our beautifully designed sub-portals
import Dashboard from './components/Dashboard';
import Playground from './components/Playground';
import LiveQuiz from './components/LiveQuiz';
import LiveStream from './components/LiveStream';
import MockInterview from './components/MockInterview';
import CvGenerator from './components/CvGenerator';
import Placements from './components/Placements';
import InstructorPortal from './components/InstructorPortal';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('dev_academy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem('dev_academy_user');
      return saved ? JSON.parse(saved).role : 'student';
    } catch {
      return 'student';
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('dev_academy_user');
      const r = saved ? JSON.parse(saved).role : 'student';
      return r === 'student' ? 'courses' : r === 'instructor' ? 'instructor-dashboard' : 'admin-dashboard';
    } catch {
      return 'courses';
    }
  });
  
  // Playground active challenge
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Gamification Metrics State
  const [userPoints, setUserPoints] = useState(120);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  // Periodically fetch student points and compiled submissions from local JSON database
  const refreshStudentStats = () => {
    fetch('/api/student/stats')
      .then(res => res.json())
      .then(data => {
        if (data.scores) {
          setUserPoints(data.scores.points);
        }
        if (data.submissions) {
          const passedIds = data.submissions
            .filter((s: any) => s.status === 'passed')
            .map((s: any) => s.challengeId);
          setCompletedChallenges(passedIds);
        }
      })
      .catch(err => console.error("Error refreshing stats:", err));
  };

  useEffect(() => {
    refreshStudentStats();
    const interval = setInterval(refreshStudentStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectChallenge = (course: Course, challenge: Challenge) => {
    setSelectedCourse(course);
    setSelectedChallenge(challenge);
    setActiveTab('playground');
  };

  const handleCompletedChallenge = (id: string) => {
    if (!completedChallenges.includes(id)) {
      setCompletedChallenges(prev => [...prev, id]);
    }
    refreshStudentStats();
  };

  const handleAppliedJob = () => {
    // Award standard placement bonus
    refreshStudentStats();
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('dev_academy_user', JSON.stringify(user));
    setActiveRole(user.role);
    if (user.role === 'student') {
      setActiveTab('courses');
    } else if (user.role === 'instructor') {
      setActiveTab('instructor-dashboard');
    } else if (user.role === 'admin') {
      setActiveTab('admin-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dev_academy_user');
  };

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white" id="main-applet-root">
      
      {/* 1. Global Navigation Hub Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="main-navigation-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Platform Branding logo */}
          <div className="flex items-center gap-2.5" id="branding-logo">
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-700 to-pink-500 p-2 rounded-xl text-white shadow-md shadow-indigo-600/10">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-800 text-sm md:text-base font-sans block">DevAcademy</span>
              <span className="text-[9px] font-mono font-bold uppercase text-indigo-600 leading-none">Interactive Learning</span>
            </div>
          </div>

          {/* Gamified point display */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full" id="stats-badge">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-mono font-bold text-slate-700">{userPoints} XP earned</span>
          </div>

          {/* Role selector panel */}
          {(currentUser.role === 'admin' || currentUser.role === 'instructor') && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/50" id="role-selector-tab">
              <button
                onClick={() => { setActiveRole('student'); setActiveTab('courses'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeRole === 'student' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/30' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Student
              </button>
              
              <button
                onClick={() => { setActiveRole('instructor'); setActiveTab('instructor-dashboard'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeRole === 'instructor' 
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/30' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Instructor
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => { setActiveRole('admin'); setActiveTab('admin-dashboard'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    activeRole === 'admin' 
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/30' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Admin
                </button>
              )}
            </div>
          )}

          {/* User Profile Info & Logout system */}
          <div className="flex items-center gap-3" id="header-user-profile">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</span>
              <span className="text-[9px] font-mono font-bold uppercase text-indigo-600 mt-1">{currentUser.role} Account</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-rose-100/50"
              id="header-logout-btn"
              title="Logout from DevAcademy"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Secondary Tab Switcher under Student Role */}
      {activeRole === 'student' && (
        <div className="bg-white border-b border-slate-200" id="student-tab-strip">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-6 text-xs" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-3.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'courses' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4.5 h-4.5" /> Dashboard & Paths
            </button>
            
            {selectedChallenge && (
              <button
                onClick={() => setActiveTab('playground')}
                className={`py-3.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'playground' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Terminal className="w-4.5 h-4.5" /> Code Playground
              </button>
            )}

            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-3.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'quiz' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-4.5 h-4.5" /> Live Quiz
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`py-3.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'live' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Radio className="w-4.5 h-4.5" /> Interactive Classroom
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`py-3.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'interview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Brain className="w-4.5 h-4.5" /> AI Interview Prep
            </button>

            <button
              onClick={() => setActiveTab('cv')}
              className={`py-3.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'cv' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4.5 h-4.5" /> Portfolio Generator
            </button>

            <button
              onClick={() => setActiveTab('placements')}
              className={`py-3.5 border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'placements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4.5 h-4.5" /> Job Placements
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Display Arena Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="display-arena">
        {/* Render portal screens based on roles and tabs */}
        {activeRole === 'student' && (
          <>
            {activeTab === 'courses' && (
              <Dashboard 
                onSelectChallenge={handleSelectChallenge} 
                userPoints={userPoints}
                completedChallenges={completedChallenges}
              />
            )}
            {activeTab === 'playground' && selectedCourse && selectedChallenge && (
              <Playground 
                course={selectedCourse} 
                challenge={selectedChallenge} 
                onBack={() => setActiveTab('courses')}
                onCompletedChallenge={handleCompletedChallenge}
              />
            )}
            {activeTab === 'quiz' && <LiveQuiz studentName={currentUser.name} />}
            {activeTab === 'live' && <LiveStream studentName={currentUser.name} />}
            {activeTab === 'interview' && <MockInterview />}
            {activeTab === 'cv' && <CvGenerator />}
            {activeTab === 'placements' && <Placements onAppliedJob={handleAppliedJob} />}
          </>
        )}

        {activeRole === 'instructor' && <InstructorPortal />}

        {activeRole === 'admin' && <AdminPortal />}
      </main>

      {/* 4. Academy Footer */}
      <footer className="bg-white border-t border-slate-200 py-6" id="academy-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">DevAcademy System Logs &bull;</span>
            <span className="font-mono text-[10px]">Version 1.0.4 (Secure sandbox compilation)</span>
          </div>
          <div>
            <span>Powered by server-side Google Gemini 3.5 AI Core</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
