import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, RefreshCw, CheckCircle2, XCircle, ChevronLeft, ArrowRight, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Course, Challenge, TestCase, Submission } from '../types';

interface PlaygroundProps {
  course: Course;
  challenge: Challenge;
  onBack: () => void;
  onCompletedChallenge: (challengeId: string) => void;
}

export default function Playground({ course, challenge, onBack, onCompletedChallenge }: PlaygroundProps) {
  const [code, setCode] = useState(challenge.initialCode);
  const [running, setRunning] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<'problem' | 'testcases'>('problem');
  
  useEffect(() => {
    setCode(challenge.initialCode);
    setSubmission(null);
  }, [challenge]);

  const handleReset = () => {
    if (confirm("Reset code editor back to default challenge template?")) {
      setCode(challenge.initialCode);
      setSubmission(null);
    }
  };

  const handleRunSubmit = async (isSubmit: boolean) => {
    setRunning(true);
    setSubmission(null);

    try {
      const res = await fetch('/api/submit-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          code: code,
          language: challenge.language,
          testCases: challenge.testCases
        })
      });
      const data = await res.json();
      setSubmission(data);
      if (data.status === 'passed') {
        onCompletedChallenge(challenge.id);
      }
    } catch (err) {
      console.error("Code compilation error:", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-fade-in" id="playground-root">
      {/* Header Back Button */}
      <div className="w-full lg:hidden" id="mobile-back-header">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium hover:text-indigo-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      {/* Left Pane - Instructions */}
      <div className="w-full lg:w-[40%] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]" id="left-instructions-pane">
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between" id="instructions-tab-bar">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('problem')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'problem' 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Problem Description
            </button>
            <button 
              onClick={() => setActiveTab('testcases')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'testcases' 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Verification Tests ({challenge.testCases.length})
            </button>
          </div>
          
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md font-bold uppercase">
            +{challenge.points} XP
          </span>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-5" id="instructions-content">
          {activeTab === 'problem' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full ${
                  challenge.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  challenge.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Track: {course.title}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-800 leading-tight">{challenge.title}</h2>
              
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>{challenge.description}</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5 text-slate-500" />
                  Target Language Parameters
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono">Interpreter:</span>
                    <span className="font-semibold text-slate-700 ml-1.5 font-sans capitalize">{challenge.language}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono">Sandbox:</span>
                    <span className="font-semibold text-slate-700 ml-1.5 font-sans">Isolated Node/Sim</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Target Verification Conditions</h3>
              <p className="text-xs text-slate-500">Your compilation suite must execute clean returns on the following input parameters:</p>
              
              <div className="space-y-3">
                {challenge.testCases.map((tc, idx) => (
                  <div key={tc.id} className="border border-slate-100 rounded-xl p-3.5 space-y-2 bg-slate-50/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-indigo-500 font-bold uppercase text-[10px]">Test Case {idx + 1}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tc.isPublic ? 'Public Assessment' : 'Secret Benchmark'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono">
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block mb-0.5 uppercase font-bold">Input:</span>
                        <code className="text-slate-700">{tc.input}</code>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block mb-0.5 uppercase font-bold">Expected:</span>
                        <code className="text-slate-800 font-bold">{tc.expectedOutput}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 hidden lg:block" id="desktop-back-footer">
          <button 
            onClick={onBack}
            className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Right Pane - Code Editor and Terminal */}
      <div className="flex-1 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 shadow-lg overflow-hidden min-h-[500px]" id="right-editor-pane">
        {/* Editor Toolbars */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between" id="editor-actions-header">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
            <span className="text-xs font-mono text-slate-400 ml-2 font-bold uppercase tracking-wider">{challenge.language}_editor.ts</span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              disabled={running}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Reset Code Templates"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
            
            <button 
              onClick={() => handleRunSubmit(true)}
              disabled={running}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
              id="btn-execute-code"
            >
              {running ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Evaluate & Submit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text Area Code Editor */}
        <div className="flex-1 relative" id="code-textarea-container">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            className="w-full h-[320px] bg-slate-950 text-slate-100 p-6 font-mono text-xs focus:outline-none resize-none leading-relaxed"
            style={{ tabSize: 2, WebkitTextFillColor: 'unset' }}
            id="code-text-editor"
          />
        </div>

        {/* Output Panel / Console */}
        <div className="border-t border-slate-800 bg-slate-900" id="terminal-pane">
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5" />
              Evaluation Sandbox Output Console
            </span>
            {submission && (
              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                submission.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                Result: {submission.status}
              </span>
            )}
          </div>

          <div className="p-5 font-mono text-xs h-[180px] overflow-y-auto space-y-3 bg-slate-950" id="terminal-text-area">
            {submission ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border ${
                  submission.status === 'passed' 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/5 border-red-500/20 text-red-400'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                    {submission.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    Challenge Submission Completed
                  </div>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                    {submission.output}
                  </pre>
                </div>
                
                {submission.status === 'passed' && (
                  <div className="bg-indigo-600 text-white p-4 rounded-xl flex items-center justify-between gap-4 shadow-lg shadow-indigo-600/10 animate-bounce">
                    <div>
                      <div className="font-bold text-sm">🎉 Superb Logic! All Test Cases Passed!</div>
                      <div className="text-[11px] opacity-90 mt-0.5">Your score has increased by +{challenge.points} Honor Points. This has been updated to your student record.</div>
                    </div>
                    <button 
                      onClick={onBack}
                      className="bg-white text-indigo-600 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-lg shrink-0 flex items-center gap-1 transition-all"
                    >
                      Continue Academy <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic flex flex-col items-center justify-center h-full gap-2">
                <AlertCircle className="w-6 h-6 text-slate-700" />
                <span className="text-[11px]">No log outputs. Write your function code and click Evaluate above to execute.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
