import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, Users, Award, Play, RotateCcw, CheckCircle2, XCircle, ArrowRight, Loader2, Star } from 'lucide-react';
import { Quiz, LiveQuizState } from '../types';

interface LiveQuizProps {
  studentName: string;
}

export default function LiveQuiz({ studentName }: LiveQuizProps) {
  const [userName, setUserName] = useState(studentName || 'Student_Anon');
  const [joined, setJoined] = useState(false);
  const [quizState, setQuizState] = useState<LiveQuizState & { quiz?: Quiz } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredThisQuestion, setAnsweredThisQuestion] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; scoreAdded: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll quiz state from server every 1.5 seconds to make it synchronous and live
  useEffect(() => {
    const fetchState = () => {
      fetch('/api/live-quiz/state')
        .then(res => res.json())
        .then(data => {
          setQuizState(data);
          setLoading(false);
        })
        .catch(err => console.error("Error loading quiz state:", err));
    };

    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, []);

  // Reset answer states when the active question indices change
  useEffect(() => {
    setSelectedAnswer(null);
    setAnsweredThisQuestion(false);
    setFeedback(null);
  }, [quizState?.currentQuestionIndex]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    try {
      const res = await fetch('/api/live-quiz/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName })
      });
      const data = await res.json();
      setJoined(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitAnswer = async (ansIdx: number) => {
    if (answeredThisQuestion || !quizState?.active) return;
    setSelectedAnswer(ansIdx);
    setAnsweredThisQuestion(true);

    try {
      const res = await fetch('/api/live-quiz/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, answerIndex: ansIdx })
      });
      const data = await res.json();
      setFeedback({
        isCorrect: data.isCorrect,
        scoreAdded: data.scoreAdded
      });
    } catch (err) {
      console.error("Error submitting quiz answer:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // If not joined, show a join lobby form
  if (!joined) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden animate-fade-in" id="quiz-join-form-card">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 text-white text-center">
          <HelpCircle className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold tracking-tight">Live Quiz Arena</h2>
          <p className="text-xs text-indigo-200 mt-1">Challenge fellow students in synchronous programming trivia games!</p>
        </div>

        <form onSubmit={handleJoin} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Your Avatar Handle</label>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. CodeWarrior"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors duration-200 flex items-center justify-center gap-2"
          >
            Enter Arena Lobby <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </form>
      </div>
    );
  }

  const hasQuiz = quizState?.quiz;
  const qIndex = quizState?.currentQuestionIndex ?? -1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="quiz-arena-root">
      {/* Quiz Active Question (Left 2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        {quizState?.active && hasQuiz && qIndex >= 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6" id="active-question-card">
            {/* Countdown timer & Score */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Trivia Question {qIndex + 1} of {hasQuiz.questions.length}
              </span>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md font-bold">
                  +{hasQuiz.questions[qIndex].points} pts
                </span>
                <div className={`flex items-center gap-1 text-xs font-bold font-mono px-3 py-1 rounded-full ${
                  quizState.secondsLeft <= 5 ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {quizState.secondsLeft}s
                </div>
              </div>
            </div>

            {/* The Question */}
            <h2 className="text-lg md:text-xl font-extrabold text-slate-800 leading-snug">
              {hasQuiz.questions[qIndex].question}
            </h2>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasQuiz.questions[qIndex].options.map((opt, oIdx) => {
                const isSelected = selectedAnswer === oIdx;
                const showCorrect = answeredThisQuestion && oIdx === hasQuiz.questions[qIndex].correctAnswerIndex;
                const showIncorrect = answeredThisQuestion && isSelected && oIdx !== hasQuiz.questions[qIndex].correctAnswerIndex;

                let btnStyles = "border-slate-200/80 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300";
                if (isSelected && !answeredThisQuestion) {
                  btnStyles = "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold";
                } else if (showCorrect) {
                  btnStyles = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20";
                } else if (showIncorrect) {
                  btnStyles = "border-rose-500 bg-rose-50 text-rose-800 font-bold ring-2 ring-rose-500/20";
                } else if (answeredThisQuestion) {
                  btnStyles = "border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSubmitAnswer(oIdx)}
                    disabled={answeredThisQuestion}
                    className={`p-4 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-3 leading-normal ${btnStyles}`}
                  >
                    <span>{opt}</span>
                    {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {showIncorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answer Response Feedback */}
            {feedback && (
              <div className={`p-4 rounded-xl border animate-fade-in ${
                feedback.isCorrect 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50/50 border-rose-200 text-rose-800'
              }`}>
                <div className="text-xs font-bold flex items-center gap-1">
                  {feedback.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Answer matches expected returns! Excellent (+{feedback.scoreAdded} pts)
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500" />
                      Expected return failed. Check logic criteria and try again.
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : qIndex === -1 ? (
          /* Lobby Waiting State */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center space-y-6" id="lobby-waiting-panel">
            <div className="inline-flex bg-indigo-50 p-4 rounded-full border border-indigo-100">
              <RotateCcw className="w-10 h-10 text-indigo-600 animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800">Waiting for Quiz to Begin...</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The synchronized instructor has not activated the countdown yet. Hang tight or toggle to "Instructor" view to initiate the challenge!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Users className="w-4 h-4 text-slate-500" /> Current Lobbies: {quizState?.participants.length} developers joined
            </div>
          </div>
        ) : (
          /* Quiz Completed Report Board */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center space-y-6" id="quiz-completed-panel">
            <div className="inline-flex bg-amber-50 p-4 rounded-full border border-amber-100">
              <Award className="w-10 h-10 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800">Live Quiz Concluded!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Excellent logic tests. Your responses have been indexed and saved to the academy database score sheet.
              </p>
            </div>

            {/* Quick stats banner */}
            <div className="bg-indigo-950 text-white rounded-xl p-4 inline-flex items-center gap-5">
              <div className="text-left">
                <span className="text-[9px] font-mono block text-indigo-300 uppercase">Your Grade Score</span>
                <span className="text-lg font-bold">100% Correct</span>
              </div>
              <div className="w-px h-8 bg-indigo-800"></div>
              <div className="text-left">
                <span className="text-[9px] font-mono block text-indigo-300 uppercase">Awarded Bonus</span>
                <span className="text-lg font-bold text-amber-400">+30 pts</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Synchronized Scoreboard (Right 1 Column) */}
      <div className="space-y-6" id="quiz-scoreboard-col">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4" id="scoreboard-panel">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" /> Live Scoreboard
            </h3>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {quizState?.participants.length} Active
            </span>
          </div>

          <div className="space-y-2.5">
            {quizState?.participants
              .sort((a, b) => b.score - a.score)
              .map((p, idx) => {
                const isMe = p.name === userName;
                
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isMe 
                        ? 'bg-indigo-50/50 border-indigo-200 font-semibold' 
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-slate-700">{p.name} {isMe && <span className="text-[9px] font-mono text-indigo-500">(you)</span>}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 font-mono">{p.score} pts</span>
                      {quizState.active && (
                        <span className={`w-2 h-2 rounded-full ${
                          p.answered ? (p.lastCorrect ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-slate-300'
                        }`} title={p.answered ? 'Answered' : 'Thinking...'} />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
