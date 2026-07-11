import React, { useState, useEffect, useRef } from 'react';
import { Tv, MessageSquare, Send, Users, Radio, Edit3, Trash2, Camera, HelpCircle, Loader2 } from 'lucide-react';
import { LiveStreamState } from '../types';

interface LiveStreamProps {
  studentName: string;
}

export default function LiveStream({ studentName }: LiveStreamProps) {
  const [streamState, setStreamState] = useState<LiveStreamState | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Whiteboard Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#6366f1');

  // Load stream state and poll every 2 seconds
  useEffect(() => {
    const fetchState = () => {
      fetch('/api/live-stream/state')
        .then(res => res.json())
        .then(data => {
          setStreamState(data);
          setLoading(false);
        })
        .catch(err => console.error("Error reading stream state:", err));
    };

    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sync canvas drawings if whiteboard states are loaded
  useEffect(() => {
    if (canvasRef.current && streamState?.whiteboardPoints) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw all vectors
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        streamState.whiteboardPoints.forEach((pt: any, i: number) => {
          if (i === 0 || !pt.drawing) {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.strokeStyle = pt.color || '#6366f1';
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
          }
        });
      }
    }
  }, [streamState?.whiteboardPoints]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !streamState) return;

    try {
      const res = await fetch('/api/live-stream/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: studentName || 'Student_Anon',
          text: chatInput
        })
      });
      const data = await res.json();
      setStreamState(data);
      setChatInput('');
    } catch (e) {
      console.error(e);
    }
  };

  // Click & Drag Canvas Local Whiteboard drawing
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!streamState?.streaming) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const updatedPoints = [...(streamState.whiteboardPoints || []), { x, y, drawing: false, color: brushColor }];
      sendWhiteboardPointsToServer(updatedPoints);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !streamState?.streaming) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const updatedPoints = [...(streamState.whiteboardPoints || []), { x, y, drawing: true, color: brushColor }];
      sendWhiteboardPointsToServer(updatedPoints);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvasOnServer = () => {
    sendWhiteboardPointsToServer([]);
  };

  const sendWhiteboardPointsToServer = async (points: any[]) => {
    try {
      const res = await fetch('/api/live-stream/whiteboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
      });
      const data = await res.json();
      setStreamState(data);
    } catch (err) {
      console.error("Error drawing on whiteboard:", err);
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in" id="livestream-root">
      {/* Stream Player & Whiteboard (Left 3 Columns) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg" id="stream-player-panel">
          {/* Stream Header Status */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {streamState?.streaming ? (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              ) : (
                <span className="h-3 w-3 rounded-full bg-slate-600 inline-block"></span>
              )}
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                {streamState?.streaming ? 'Live Lecture Room' : 'Broadcast Closed'}
              </span>
            </div>

            {streamState?.streaming && (
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-950/60 px-3 py-1 rounded-md border border-slate-800">
                <Users className="w-4 h-4 text-slate-400" />
                {streamState.viewers} watching
              </div>
            )}
          </div>

          {/* Player Feed Aspect Ratio */}
          <div className="relative bg-slate-950 h-[340px] md:h-[400px] flex items-center justify-center text-white" id="video-canvas-overlay">
            {streamState?.streaming ? (
              <div className="w-full h-full relative">
                {/* Simulated webcam video capture preview/simulation */}
                <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3 z-10 shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold font-sans shadow-inner">
                    SJ
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-none text-slate-200">{streamState.instructorName}</h4>
                    <span className="text-[10px] font-mono text-indigo-400 mt-1 block">Course Instructor</span>
                  </div>
                </div>

                {/* Real-time Interactive Whiteboard Layer */}
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={400}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="absolute inset-0 w-full h-full z-0 bg-slate-900/40 cursor-crosshair"
                  id="whiteboard-live-canvas"
                />

                {/* Whiteboard Drawing Tools Overlay */}
                <div className="absolute bottom-4 left-4 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3 z-10 shadow-lg">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 uppercase font-bold">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Interactive Chalkboard
                  </div>
                  <div className="w-px h-4 bg-slate-800"></div>
                  
                  <div className="flex gap-1.5">
                    {['#6366f1', '#f59e0b', '#10b981', '#f43f5e'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                          brushColor === color ? 'border-white scale-125' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  <button 
                    onClick={clearCanvasOnServer}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
                    title="Clear Board"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Inactive Stream Feed Cover */
              <div className="text-center space-y-4 p-8" id="stream-offline-cover">
                <div className="bg-slate-900 p-4 rounded-full inline-block border border-slate-800">
                  <Radio className="w-10 h-10 text-slate-600 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold">Broadcast Offline</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    The instructor stream channel is currently quiet. Log into the "Instructor Portal" view to launch a lecture!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stream Details Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3" id="stream-metadata">
          <h2 className="text-lg font-extrabold text-slate-800 leading-tight">
            {streamState?.title || "Classroom Broadcast Channel"}
          </h2>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">⏱️ Scheduled: Everyday</span>
            <span className="flex items-center gap-1.5">🔑 Access: Open Enrollment</span>
            <span className="flex items-center gap-1.5">📚 Topic: Frontend Architecture & Visual Alignment</span>
          </div>
        </div>
      </div>

      {/* Stream Chat Feed (Right 1 Column) */}
      <div className="space-y-6" id="stream-chat-col">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm h-[520px] flex flex-col justify-between overflow-hidden" id="stream-chat-panel">
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Lesson Stream Chat
            </h3>
            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">
              Synced Room
            </span>
          </div>

          {/* Message List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5" id="stream-chat-message-list">
            {streamState?.chat.map((msg) => (
              <div key={msg.id} className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 font-sans">{msg.user}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{msg.time}</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-sans bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Form message submission */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
            <input
              type="text"
              value={chatInput}
              disabled={!streamState?.streaming}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={streamState?.streaming ? "Type your comment..." : "Chat locked. Stream offline"}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={!streamState?.streaming || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white p-2 rounded-xl transition-colors duration-200 flex items-center justify-center shrink-0"
              id="btn-stream-chat-send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
