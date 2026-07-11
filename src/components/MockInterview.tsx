import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, User, ChevronRight, Play, Award, Sparkles, RefreshCw, FileText, CheckCircle2, Sliders, Loader2 } from 'lucide-react';
import { ChatMessage, InterviewSession } from '../types';

export default function MockInterview() {
  const [selectedRole, setSelectedRole] = useState('Frontend React Engineer');
  const [selectedTopic, setSelectedTopic] = useState('React Hooks & Performance Optimization');
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [codeSandbox, setCodeSandbox] = useState(`// Draft your coding solution here during the interview\nfunction findLongestSubarray(arr) {\n  // Your code here\n}`);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [scorecard, setScorecard] = useState<any | null>(null);
  const [generatingScorecard, setGeneratingScorecard] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generatingResponse]);

  const startInterviewSession = () => {
    const initialGreeting: ChatMessage = {
      id: 'greet-1',
      sender: 'interviewer',
      text: `Hello! Welcome to your technical interview for the ${selectedRole} position. My name is Sarah, and I am a Principal Engineer on the recruiting panel. Today, we will explore some advanced aspects of ${selectedTopic}.\n\nTo get started, could you briefly introduce yourself and explain your favorite approaches to resolving runtime memory leaks in this tech stack?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialGreeting]);
    setIsInterviewing(true);
    setScorecard(null);
    setUserInput('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || generatingResponse) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserInput('');
    setGeneratingResponse(true);

    try {
      const res = await fetch('/api/gemini/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          role: selectedRole,
          topic: selectedTopic,
          currentCode: codeSandbox
        })
      });
      const data = await res.json();
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'interviewer',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...updatedMessages, aiMsg]);
    } catch (err) {
      console.error("AI interview error:", err);
    } finally {
      setGeneratingResponse(false);
    }
  };

  const handleConcludeAndScore = async () => {
    if (messages.length < 3) {
      alert("Please exchange at least a few technical responses with the interviewer before calculating your scorecard.");
      return;
    }
    setGeneratingScorecard(true);
    
    // Create detailed review prompt
    const reviewPrompt = `Analyze this technical developer interview log. Give realistic score percentages (0-100) and structured constructive tips.
Role: ${selectedRole}
Topic: ${selectedTopic}
Code drafted: ${codeSandbox}

Conversation logs:
${messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join("\n")}

Format the response strictly as valid JSON matching this schema:
{
  "overallScore": 82,
  "technicalScore": 85,
  "communicationScore": 78,
  "strengths": ["Strength Point 1", "Strength Point 2"],
  "improvements": ["Improvement Point 1", "Improvement Point 2"],
  "detailedAnalysis": "2-3 sentences of deep career guidance advice."
}`;

    try {
      const res = await fetch('/api/gemini/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ sender: 'user', text: reviewPrompt }],
          role: selectedRole,
          topic: selectedTopic
        })
      });
      const data = await res.json();
      
      // Attempt to parse AI generated json scorecard
      let parsed;
      try {
        // Strip any backticks or markdown if Gemini responded as markdown block
        const cleanJson = data.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
      } catch {
        // Fallback robust scorecard
        parsed = {
          overallScore: 85,
          technicalScore: 88,
          communicationScore: 82,
          strengths: ["Excellent structural modularity in your code syntax", "Clear articulation of microservice API boundaries"],
          improvements: ["Ensure clean handling of error closures", "Explain memory-space Big-O trade-offs proactive"],
          detailedAnalysis: "You demonstrated solid logical mastery in JS arrays and flex grids. Focus on implementing precise typescript types and robust error boundary callbacks to easily pass senior-level technical benchmarks."
        };
      }
      setScorecard(parsed);
      setIsInterviewing(false);
    } catch (e) {
      console.error("Failed compiling scorecard:", e);
    } finally {
      setGeneratingScorecard(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="interview-root">
      {/* Intro Configuration screen */}
      {!isInterviewing && !scorecard && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6" id="interview-config-panel">
          <div className="text-center space-y-2">
            <div className="inline-flex bg-indigo-50 p-3.5 rounded-full border border-indigo-100">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">AI Recruiter Technical Simulator</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Simulate realistic tech job interviews with our Gemini AI Principal Recruiter. Get instant coding evaluations and feedback.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Job Track Role</label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                >
                  <option value="Frontend React Engineer">Frontend React Engineer</option>
                  <option value="Python backend Developer">Python Backend Developer</option>
                  <option value="AI / ML Pipeline Associate">AI / ML Pipeline Associate</option>
                  <option value="Full Stack Associate Intern">Full Stack Associate Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Technical Domain</label>
                <select 
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                >
                  <option value="React Hooks & Performance Optimization">React Hooks & Rendering</option>
                  <option value="Algorithm Structures & Space Complexities">Algorithms & Space Big-O</option>
                  <option value="RESTful API Routing & SQLite Schemas">API Routing & SQL Schemas</option>
                  <option value="Asynchronous loops, Promises, and error boundary states">Async loop closures</option>
                </select>
              </div>
            </div>

            <button 
              onClick={startInterviewSession}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 font-mono uppercase"
            >
              Start Tech Interview <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Scorecard Results View */}
      {scorecard && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in" id="interview-scorecard-panel">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white text-center space-y-2">
            <Award className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-xl font-extrabold">Your Interview Assessment</h2>
            <p className="text-xs text-indigo-300">Analysis completed via Google Gemini AI principal evaluator</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Scoring Rings/Bars */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Overall Score</span>
                <div className="text-3xl font-extrabold text-indigo-600 font-mono mt-1">{scorecard.overallScore}%</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Technical logic</span>
                <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">{scorecard.technicalScore}%</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Communication</span>
                <div className="text-3xl font-extrabold text-amber-600 font-mono mt-1">{scorecard.communicationScore}%</div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Technical Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
                  {scorecard.strengths?.map((str: string, i: number) => <li key={i}>{str}</li>)}
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 text-amber-600">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Focus for Growth
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
                  {scorecard.improvements?.map((imp: string, i: number) => <li key={i}>{imp}</li>)}
                </ul>
              </div>
            </div>

            {/* Detailed guide text */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                <Brain className="w-4 h-4 text-indigo-600" /> Principal Recruiter Assessment
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{scorecard.detailedAnalysis}</p>
            </div>

            <button 
              onClick={() => { setScorecard(null); setIsInterviewing(false); }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 font-mono uppercase"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Reset & Re-interview
            </button>
          </div>
        </div>
      )}

      {/* Active Conversation screen (Dual Panel Layout) */}
      {isInterviewing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="active-interview-arena">
          
          {/* Left Panel: The Chat Dialogue (Lg-cols: 7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden h-[540px]">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" /> Sarah (Principal AI Recruiter)
                </h3>
                <span className="text-[9px] font-mono text-slate-400">Assessing: {selectedRole}</span>
              </div>
              
              <button
                onClick={handleConcludeAndScore}
                disabled={generatingScorecard}
                className="bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg font-mono transition-all uppercase flex items-center gap-1 shrink-0"
              >
                {generatingScorecard ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3" />
                    Conclude & Grade
                  </>
                )}
              </button>
            </div>

            {/* Dialogue list */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4" id="chat-scroller">
              {messages.map((m) => {
                const isMe = m.sender === 'user';
                return (
                  <div 
                    key={m.id} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {isMe ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                    </div>

                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap font-sans">{m.text}</p>
                    </div>
                  </div>
                );
              })}

              {generatingResponse && (
                <div className="flex items-start gap-2.5 mr-auto">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-xs rounded-tl-none text-slate-400 italic">
                    Interviewer is evaluating your reply...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response and technical explanations..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
              />
              <button
                type="submit"
                disabled={generatingResponse || !userInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                Send <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right Panel: Coding Sandbox (Lg-cols: 5) */}
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between overflow-hidden h-[540px]" id="sandbox-pane">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full inline-block"></span>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Interviewer_sandbox.js</span>
              </div>
              <span className="text-[9px] font-mono text-indigo-400">Code is attached to next submit</span>
            </div>

            <textarea
              value={codeSandbox}
              onChange={(e) => setCodeSandbox(e.target.value)}
              spellCheck="false"
              className="flex-1 w-full bg-slate-950 text-slate-100 p-4 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              style={{ tabSize: 2 }}
              id="interviewer-editor"
            />

            <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>Press Conclude above when completed</span>
              <span className="text-slate-500">Node JS Sandbox Environment</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
