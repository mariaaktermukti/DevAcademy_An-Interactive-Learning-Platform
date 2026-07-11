import React, { useState } from 'react';
import { 
  Terminal, Shield, Users, UserCheck, Mail, Lock, User as UserIcon, 
  ArrowRight, Sparkles, AlertCircle, Loader2, CheckCircle2 
} from 'lucide-react';
import { Role, User } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [role, setRole] = useState<Role>('student');
  
  // Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Please provide your full name to register.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(isLogin ? "Welcome back! Redirecting..." : "Account created successfully!");
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 800);
      } else {
        setError(data.error || "Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection offline. Reverting to local state session.");
      
      // Fallback local registration/login helper
      if (isLogin) {
        if (email.includes('student')) {
          onAuthSuccess({ id: 'usr-student', name: 'Suresh Kumar', email, role: 'student', points: 120 });
        } else if (email.includes('instructor')) {
          onAuthSuccess({ id: 'usr-instructor', name: 'Dr. Jane Dev', email, role: 'instructor', points: 450 });
        } else {
          onAuthSuccess({ id: 'usr-admin', name: 'Admin Chief', email, role: 'admin', points: 1000 });
        }
      } else {
        onAuthSuccess({ id: `usr-${Date.now()}`, name, email, role, points: 120 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (presetEmail: string, presetPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: presetEmail, password: presetPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Logged in as demo ${data.user.role}!`);
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 600);
      } else {
        setError(data.error || "Failed preset login.");
      }
    } catch (e) {
      // Local preset bypass
      const presetRole = presetEmail.split('@')[0] as Role;
      onAuthSuccess({
        id: `usr-${presetRole}`,
        name: presetRole === 'student' ? 'Suresh Kumar' : presetRole === 'instructor' ? 'Dr. Jane Dev' : 'Admin Chief',
        email: presetEmail,
        role: presetRole,
        points: presetRole === 'student' ? 120 : presetRole === 'instructor' ? 450 : 1000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white" id="auth-root-container">
      
      {/* Absolute Aesthetic Glow Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Auth Screen Content wrapper */}
      <div className="w-full max-w-md relative z-10 space-y-6" id="auth-card-wrapper">
        
        {/* Brand Logo and Header */}
        <div className="text-center space-y-3" id="auth-brand-header">
          <div className="inline-flex bg-gradient-to-tr from-indigo-600 via-indigo-700 to-pink-500 p-3.5 rounded-2xl text-white shadow-xl shadow-indigo-600/20 mb-1 animate-fade-in">
            <Terminal className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              DevAcademy Gateway
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Unified platform for students, instructors, and operations admin.
            </p>
          </div>
        </div>

        {/* Primary Auth Form Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6" id="auth-interactive-card">
          
          {/* Aesthetic top boundary line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Tab switches */}
          <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-850" id="auth-tab-bar">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                isLogin 
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                !isLogin 
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Register Account
            </button>
          </div>

          {/* On-screen Notification Alerts */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in" id="auth-error-alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in" id="auth-success-alert">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-main-form">
            
            {/* Registration Role Selection: shown on Register tab */}
            {!isLogin && (
              <div className="space-y-2 animate-fade-in" id="register-role-picker">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Select System Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      role === 'student' 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('instructor')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      role === 'instructor' 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300' 
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Instructor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      role === 'admin' 
                        ? 'border-pink-500 bg-pink-500/10 text-pink-300' 
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-bold">Admin</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form Fields Inputs */}
            <div className="space-y-3.5">
              
              {/* Full Name (Registration only) */}
              {!isLogin && (
                <div className="space-y-1.5 animate-fade-in" id="field-name-container">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5" id="field-email-container">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="e.g. student@devacademy.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5" id="field-password-container">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200"
                    required
                  />
                </div>
              </div>

            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition-all mt-6"
              id="auth-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring Isolate...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Enter Workspace' : 'Create Secure Profile'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Demo Fast Preset Accounts HUD */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3 shadow-xl" id="auth-demo-presets-panel">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] font-mono uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Instant Demo Presets (1-Click Login)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('student@devacademy.edu', 'student123')}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2 rounded-xl text-center transition-all group"
              title="Suresh Kumar (Student)"
            >
              <span className="text-[10px] font-bold text-slate-300 block group-hover:text-indigo-400">Student</span>
              <span className="text-[8px] text-slate-500 block mt-0.5">Suresh Kumar</span>
            </button>

            <button
              onClick={() => handleDemoLogin('instructor@devacademy.edu', 'instructor123')}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2 rounded-xl text-center transition-all group"
              title="Dr. Jane Dev (Instructor)"
            >
              <span className="text-[10px] font-bold text-slate-300 block group-hover:text-purple-400">Instructor</span>
              <span className="text-[8px] text-slate-500 block mt-0.5">Dr. Jane Dev</span>
            </button>

            <button
              onClick={() => handleDemoLogin('admin@devacademy.edu', 'admin123')}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2 rounded-xl text-center transition-all group"
              title="Admin Chief (Admin)"
            >
              <span className="text-[10px] font-bold text-slate-300 block group-hover:text-pink-400">Admin</span>
              <span className="text-[8px] text-slate-500 block mt-0.5">Admin Chief</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
