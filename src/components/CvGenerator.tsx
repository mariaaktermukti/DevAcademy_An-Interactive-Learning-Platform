import React, { useState } from 'react';
import { FileText, Sparkles, Plus, Trash2, Download, Copy, Layout, Sliders, RefreshCw, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react';
import { ResumeProfile } from '../types';
import html2pdf from 'html2pdf.js';

export default function CvGenerator() {
  const [profile, setProfile] = useState<ResumeProfile>({
    fullName: 'David Mercer',
    email: 'david.m@devacademy.edu',
    github: 'github.com/daviddev',
    linkedin: 'linkedin.com/in/david-mercer',
    role: 'Full Stack Software Engineer',
    summary: 'Proactive and logical software engineer with experience building reactive single page applications, caching databases, and high-performance server loops.',
    skills: ['JavaScript ES6+', 'React', 'Node.js', 'Express', 'Tailwind CSS', 'SQLite', 'Python'],
    experience: [
      {
        id: 'exp1',
        title: 'Junior Web Developer',
        company: 'CloudCore Solutions',
        duration: '2024 - Present',
        bullets: [
          'Designed high-performance web dashboard charts using Recharts and Tailwind CSS.',
          'Optimized database tables, resulting in faster visual layout rendering.'
        ]
      }
    ],
    projects: [
      {
        id: 'proj1',
        name: 'TaskGrid SaaS Portal',
        description: 'An interactive multi-role whiteboard and task manager incorporating state managers and secure cookie configurations.',
        tech: ['React', 'Express', 'Tailwind', 'SQLite'],
        link: 'https://github.com/daviddev/taskgrid'
      }
    ],
    theme: 'modern'
  });

  const [rawTextHelper, setRawTextHelper] = useState('');
  const [experienceTargetIdx, setExperienceTargetIdx] = useState<number>(0);
  const [optimizing, setOptimizing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleFieldChange = (field: keyof ResumeProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      title: 'Software Developer',
      company: 'Enterprise Inc',
      duration: '2025 - Present',
      bullets: ['Responsible for writing modular clean functions.']
    };
    setProfile(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const handleRemoveExperience = (id: string) => {
    setProfile(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const handleExperienceChange = (idx: number, field: string, value: any) => {
    const updated = [...profile.experience];
    updated[idx] = { ...updated[idx], [field]: value };
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  const handleAddProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      name: 'Interactive Dev Academy',
      description: 'A robust coding workspace with AI interviewers and responsive resume grids.',
      tech: ['React', 'TypeScript', 'Node.js'],
      link: 'https://github.com'
    };
    setProfile(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const handleRemoveProject = (id: string) => {
    setProfile(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const handleProjectChange = (idx: number, field: string, value: any) => {
    const updated = [...profile.projects];
    updated[idx] = { ...updated[idx], [field]: value };
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Optimize raw bullet text using Gemini AI API
  const handleOptimizeExperience = async () => {
    if (!rawTextHelper.trim()) {
      alert("Please write down your raw experience description first.");
      return;
    }
    setOptimizing(true);

    try {
      const res = await fetch('/api/gemini/resume-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: profile.role,
          rawExperience: rawTextHelper
        })
      });
      const data = await res.json();
      
      if (data.bullets && data.bullets.length > 0) {
        const updatedExp = [...profile.experience];
        updatedExp[experienceTargetIdx] = {
          ...updatedExp[experienceTargetIdx],
          bullets: data.bullets
        };
        setProfile(prev => ({ ...prev, experience: updatedExp }));
        setRawTextHelper('');
      }
    } catch (e) {
      console.error("AI Resume optimizer failed:", e);
    } finally {
      setOptimizing(false);
    }
  };

  // Generate self-contained standalone downloadable responsive HTML file!
  const generateHTMLCode = (): string => {
    const isTech = profile.theme === 'tech';
    const isSerif = profile.theme === 'serif';
    const isMinimal = profile.theme === 'minimalist';

    let bodyStyle = "font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; padding: 40px 20px;";
    let containerStyle = "max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);";
    let accentColor = "#4f46e5";
    let titleStyle = "color: #0f172a; font-size: 32px; font-weight: 800; margin: 0 0 5px 0;";
    let roleStyle = "color: #4f46e5; font-size: 16px; font-weight: 600; text-transform: uppercase; tracking-wider: 0.05em; margin-bottom: 20px;";
    
    if (isTech) {
      bodyStyle = "font-family: 'Inter', sans-serif; background-color: #030712; color: #f3f4f6; padding: 40px 20px;";
      containerStyle = "max-width: 800px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1f2937; border-radius: 16px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);";
      accentColor = "#6366f1";
      titleStyle = "color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 5px 0;";
      roleStyle = "color: #818cf8; font-size: 16px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px;";
    } else if (isSerif) {
      bodyStyle = "font-family: 'Playfair Display', Georgia, serif; background-color: #fdfdfd; color: #1c1917; padding: 50px 20px;";
      containerStyle = "max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7e5e4; padding: 50px;";
      accentColor = "#1c1917";
      titleStyle = "color: #1c1917; font-size: 36px; font-family: 'Playfair Display', serif; margin: 0 0 8px 0; border-bottom: 2px solid #1c1917; pb: 10px;";
      roleStyle = "color: #78716c; font-size: 14px; font-weight: 500; font-style: italic; margin-bottom: 25px;";
    } else if (isMinimal) {
      bodyStyle = "font-family: 'Inter', sans-serif; background-color: #ffffff; color: #000000; padding: 40px 20px;";
      containerStyle = "max-width: 800px; margin: 0 auto; padding: 20px;";
      accentColor = "#000000";
      titleStyle = "color: #000000; font-size: 28px; font-weight: 700; margin: 0 0 4px 0; letter-spacing: -0.02em;";
      roleStyle = "color: #666666; font-size: 14px; font-weight: 500; margin-bottom: 20px;";
    }

    const experienceHTML = profile.experience.map(exp => `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 15px; font-weight: 700; margin: 0; color: ${isTech ? '#ffffff' : '#1e293b'}">${exp.title}</h3>
          <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">${exp.duration}</span>
        </div>
        <div style="font-size: 13px; color: ${accentColor}; font-weight: 500; margin-top: 2px;">${exp.company}</div>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: ${isTech ? '#9ca3af' : '#475569'}; line-height: 1.6;">
          ${exp.bullets.map(b => `<li style="margin-bottom: 5px;">${b}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    const projectsHTML = profile.projects.map(proj => `
      <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid ${isTech ? '#1f2937' : '#f1f5f9'}; background-color: ${isTech ? '#111827' : '#fafafa'}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 14px; font-weight: 700; margin: 0; color: ${isTech ? '#ffffff' : '#0f172a'}">${proj.name}</h3>
          ${proj.link ? `<a href="${proj.link}" target="_blank" style="font-size: 11px; color: ${accentColor}; text-decoration: none;">Link &rarr;</a>` : ''}
        </div>
        <p style="font-size: 12px; color: ${isTech ? '#9ca3af' : '#475569'}; margin: 5px 0 10px 0; line-height: 1.5;">${proj.description}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
          ${proj.tech.map(t => `<span style="font-size: 10px; font-family: monospace; background-color: ${isTech ? '#1f2937' : '#e2e8f0'}; color: ${isTech ? '#d1d5db' : '#475569'}; padding: 2px 6px; border-radius: 4px;">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profile.fullName} - Professional Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
</head>
<body style="${bodyStyle}">
  <div style="${containerStyle}">
    <!-- Header Section -->
    <header style="margin-bottom: 30px; border-bottom: 1px solid ${isTech ? '#1f2937' : '#e2e8f0'}; padding-bottom: 25px;">
      <h1 style="${titleStyle}">${profile.fullName}</h1>
      <div style="${roleStyle}">${profile.role}</div>
      <div style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 12px; color: ${isTech ? '#9ca3af' : '#64748b'}; margin-top: 10px; font-family: monospace;">
        <span>📧 <a href="mailto:${profile.email}" style="color: inherit; text-decoration: none; border-bottom: 1px dotted currentColor;">${profile.email}</a></span>
        ${profile.github ? `<span>🔗 <a href="${profile.github.startsWith('http') ? profile.github : 'https://' + profile.github}" target="_blank" style="color: inherit; text-decoration: none; border-bottom: 1px dotted currentColor;">${profile.github}</a></span>` : ''}
        ${profile.linkedin ? `<span>👔 <a href="${profile.linkedin.startsWith('http') ? profile.linkedin : 'https://' + profile.linkedin}" target="_blank" style="color: inherit; text-decoration: none; border-bottom: 1px dotted currentColor;">${profile.linkedin}</a></span>` : ''}
      </div>
    </header>

    <!-- Professional Summary -->
    <section style="margin-bottom: 30px;">
      <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; tracking-wider: 0.1em; color: ${accentColor}; margin-bottom: 10px; font-family: monospace;">Executive Summary</h2>
      <p style="font-size: 13.5px; line-height: 1.6; color: ${isTech ? '#d1d5db' : '#334155'}; margin: 0;">${profile.summary}</p>
    </section>

    <!-- Technical Skills -->
    <section style="margin-bottom: 30px;">
      <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; margin-bottom: 15px; font-family: monospace;">Technical Expertise</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${profile.skills.map(s => `<span style="font-size: 11px; font-family: monospace; background-color: ${isTech ? '#1f2937' : '#f1f5f9'}; color: ${isTech ? '#ffffff' : '#334155'}; padding: 4px 10px; border: 1px solid ${isTech ? '#374151' : '#e2e8f0'}; border-radius: 6px;">${s}</span>`).join('')}
      </div>
    </section>

    <!-- Work History -->
    <section style="margin-bottom: 30px;">
      <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; margin-bottom: 15px; font-family: monospace;">Professional Experience</h2>
      ${experienceHTML}
    </section>

    <!-- Key Engineering Projects -->
    <section style="margin-bottom: 10px;">
      <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; margin-bottom: 15px; font-family: monospace;">Software Projects</h2>
      ${projectsHTML}
    </section>
  </div>
</body>
</html>`;
  };

  const handleDownload = () => {
    const htmlCode = generateHTMLCode();
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.fullName.toLowerCase().replace(/\s+/g, '_')}_portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const cvElement = document.getElementById('cv-frame-box');
      if (!cvElement) {
        throw new Error("Preview element not found");
      }

      // 1. Store original styles of the preview container
      const originalMaxHeight = cvElement.style.maxHeight;
      const originalOverflowY = cvElement.style.overflowY;
      const originalHeight = cvElement.style.height;
      const originalBoxShadow = cvElement.style.boxShadow;
      const originalBorder = cvElement.style.border;
      const originalBorderRadius = cvElement.style.borderRadius;

      // 2. Temporarily adjust styles for perfect full-page PDF rendering
      cvElement.style.maxHeight = 'none';
      cvElement.style.overflowY = 'visible';
      cvElement.style.height = 'auto';
      cvElement.style.boxShadow = 'none';
      cvElement.style.border = 'none';
      cvElement.style.borderRadius = '0';

      // 3. Setup configuration options
      const opt = {
        margin:       0.4,
        filename:     `${profile.fullName.toLowerCase().replace(/\s+/g, '_')}_portfolio.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          logging: false,
          useOverflow: true,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };

      // 4. Run generator directly on the visible, expanded DOM element
      await html2pdf().set(opt).from(cvElement).save();
      
      // 5. Restore original styles immediately after saving
      cvElement.style.maxHeight = originalMaxHeight;
      cvElement.style.overflowY = originalOverflowY;
      cvElement.style.height = originalHeight;
      cvElement.style.boxShadow = originalBoxShadow;
      cvElement.style.border = originalBorder;
      cvElement.style.borderRadius = originalBorderRadius;
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Downloading standard HTML version instead.");
      handleDownload();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyCode = () => {
    const htmlCode = generateHTMLCode();
    navigator.clipboard.writeText(htmlCode);
    alert("Responsive HTML portfolio code successfully copied to your clipboard!");
  };

  const isTechTheme = profile.theme === 'tech';
  const isSerifTheme = profile.theme === 'serif';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="cvgenerator-root">
      {/* Editor Form Columns (Left, 5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5" id="cv-editor-panel">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" /> Resume Profile Data
            </h3>
            
            {/* Theme switcher inside panel */}
            <select
              value={profile.theme}
              onChange={(e: any) => handleFieldChange('theme', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-2 py-1 text-[10px] font-bold font-mono focus:outline-none"
            >
              <option value="modern">Modern Light</option>
              <option value="tech">Tech Dark</option>
              <option value="serif">Classic Serif</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {/* Core Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={profile.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role Title</label>
                <input 
                  type="text" 
                  value={profile.role}
                  onChange={(e) => handleFieldChange('role', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input 
                  type="text" 
                  value={profile.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-xs text-slate-700"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">GitHub</label>
                <input 
                  type="text" 
                  value={profile.github}
                  onChange={(e) => handleFieldChange('github', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-xs text-slate-700"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">LinkedIn</label>
                <input 
                  type="text" 
                  value={profile.linkedin}
                  onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 text-xs text-slate-700"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Executive Summary</label>
              <textarea 
                value={profile.summary}
                onChange={(e) => handleFieldChange('summary', e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700"
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expertise Skills</label>
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input 
                  type="text" 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Next.js, Docker"
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-700"
                />
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold">+</button>
              </form>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((s) => (
                  <span key={s} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="text-slate-400 hover:text-rose-500">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* AI Experience optimizer tool */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Bullet-point Booster
                </span>
                <select
                  value={experienceTargetIdx}
                  onChange={(e: any) => setExperienceTargetIdx(Number(e.target.value))}
                  className="bg-white border border-slate-200 text-slate-600 text-[9px] font-mono px-2 py-0.5 rounded"
                >
                  {profile.experience.map((e, idx) => (
                    <option key={e.id} value={idx}>{e.company}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={rawTextHelper}
                onChange={(e) => setRawTextHelper(e.target.value)}
                placeholder="Write what you did raw (e.g. 'I fixed loading speeds on the charts and improved db structure.')"
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700"
              />
              <button
                type="button"
                onClick={handleOptimizeExperience}
                disabled={optimizing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5"
              >
                {optimizing ? (
                  <>
                    <Loader2 className="w-3 animate-spin" /> Optimizing metrics...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Boost with Gemini AI
                  </>
                )}
              </button>
            </div>

            {/* Dynamic Experience Lists */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Professional Roles</span>
                <button type="button" onClick={handleAddExperience} className="text-[10px] text-indigo-600 hover:underline font-bold">+ Add Role</button>
              </div>

              {profile.experience.map((exp, idx) => (
                <div key={exp.id} className="bg-slate-50 p-3 rounded-xl space-y-2 relative border border-slate-100">
                  <button type="button" onClick={() => handleRemoveExperience(exp.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={exp.title} 
                      onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                      placeholder="Title"
                      className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold"
                    />
                    <input 
                      type="text" 
                      value={exp.company} 
                      onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                      placeholder="Company"
                      className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={exp.duration} 
                    onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                    placeholder="Duration"
                    className="w-full bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1 text-slate-700 font-mono"
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Live Visual Card Preview Panel (Right, 7 cols) */}
      <div className="lg:col-span-7 space-y-4 flex flex-col justify-between" id="cv-preview-panel">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Layout className="w-4 h-4" /> Live Responsive Portfolio Rendering
          </span>

          <div className="flex gap-2">
            <button 
              onClick={handleCopyCode}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Copy HTML
            </button>
            <button 
              onClick={handleDownload}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Exporter Code
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Outer Frame with CSS styling responsive preset */}
        <div 
          className={`flex-1 rounded-2xl border p-8 shadow-sm overflow-y-auto max-h-[580px] min-h-[480px] ${
            isTechTheme ? 'bg-slate-950 border-slate-800 text-slate-200' :
            isSerifTheme ? 'bg-amber-50/20 border-slate-200 text-stone-900 font-serif' :
            'bg-white border-slate-200/80 text-slate-700'
          }`}
          id="cv-frame-box"
        >
          {/* Header section of Portfolio card */}
          <div className={`border-b pb-5 mb-5 ${isTechTheme ? 'border-slate-800' : 'border-slate-100'}`}>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isTechTheme ? 'text-white' : 'text-slate-900'}`}>{profile.fullName}</h1>
            <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${isTechTheme ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {profile.role}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-3 text-[10px] font-mono text-slate-400">
              <a 
                href={`mailto:${profile.email}`}
                className="hover:text-indigo-500 transition-all duration-200 flex items-center gap-1 cursor-pointer"
              >
                <span>📧</span> {profile.email}
              </a>
              {profile.github && (
                <a 
                  href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-indigo-500 transition-all duration-200 flex items-center gap-1 cursor-pointer"
                >
                  <span>🔗</span> {profile.github}
                </a>
              )}
              {profile.linkedin && (
                <a 
                  href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-indigo-500 transition-all duration-200 flex items-center gap-1 cursor-pointer"
                >
                  <span>👔</span> {profile.linkedin}
                </a>
              )}
            </div>
          </div>

          {/* Executive summary */}
          <div className="space-y-1.5 mb-6">
            <h4 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isTechTheme ? 'text-indigo-400' : 'text-indigo-500'}`}>Executive Summary</h4>
            <p className="text-xs leading-relaxed opacity-90">{profile.summary}</p>
          </div>

          {/* Core expertise tags */}
          <div className="space-y-2 mb-6">
            <h4 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isTechTheme ? 'text-indigo-400' : 'text-indigo-500'}`}>Core Technical Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span 
                  key={s} 
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-md border ${
                    isTechTheme 
                      ? 'bg-slate-900/60 border-slate-800 text-indigo-300' 
                      : 'bg-slate-50 border-slate-200/60 text-slate-600'
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Work History */}
          <div className="space-y-4 mb-6">
            <h4 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isTechTheme ? 'text-indigo-400' : 'text-indigo-500'}`}>Professional Experience</h4>
            
            {profile.experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold">{exp.title}</span>
                  <span className="text-[10px] font-mono opacity-60">{exp.duration}</span>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wide ${isTechTheme ? 'text-indigo-300' : 'text-indigo-600'}`}>{exp.company}</div>
                <ul className="list-disc pl-4 text-xs space-y-1 opacity-90 pt-1.5">
                  {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="space-y-4">
            <h4 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isTechTheme ? 'text-indigo-400' : 'text-indigo-500'}`}>Key Software Projects</h4>
            
            {profile.projects.map((proj) => (
              <div key={proj.id} className={`p-4 rounded-xl border ${isTechTheme ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'} space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">{proj.name}</span>
                  {proj.link && (
                    <span className="text-[9px] font-mono opacity-50 flex items-center gap-1">
                      <LinkIcon className="w-2.5 h-2.5" /> link
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-80">{proj.description}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.tech.map((t) => <span key={t} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-1.5 py-0.5 rounded">{t}</span>)}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
