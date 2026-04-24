"use client";

import { useState, useEffect } from "react";
import { Email } from "@/lib/mock-data";
import { Mail, Loader2, Send, Edit, RefreshCw, CheckCircle, ShieldAlert, Zap, Cpu, Activity, User, Tag } from "lucide-react";

type Analysis = {
  intent: string;
  urgency: string;
  category: string;
  senderType: string;
  summary: string;
} | null;

export default function InboxDashboard() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);

  const fetchEmails = async () => {
    setIsLoadingEmails(true);
    try {
      const res = await fetch("/api/emails");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmails(data);
      } else {
        console.error("Failed to fetch emails:", data);
        alert(data.error || "Failed to connect to Gmail.");
        setEmails([]);
      }
    } catch (e) {
      console.error("Network error:", e);
      setEmails([]);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  const [analysis, setAnalysis] = useState<Analysis>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [draft, setDraft] = useState<string>("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [tone, setTone] = useState("professional");

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setAnalysis(null);
    setDraft("");
    // mark as read
    setEmails(emails.map(e => e.id === email.id ? { ...e, read: true } : e));
  };

  const handleAnalyze = async () => {
    if (!selectedEmail) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setDraft("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailBody: selectedEmail.body,
          senderName: selectedEmail.senderName,
          subject: selectedEmail.subject,
        }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDraft = async () => {
    if (!selectedEmail || !analysis) return;
    setIsDrafting(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailBody: selectedEmail.body,
          senderName: selectedEmail.senderName,
          subject: selectedEmail.subject,
          analysis,
          tone,
        }),
      });
      const data = await res.json();
      setDraft(data.draft);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleApproveAndSend = async () => {
    if (!selectedEmail || !draft) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedEmail.senderEmail,
          subject: `Re: ${selectedEmail.subject.replace(/^Re:\s*/i, '')}`,
          body: draft
        }),
      });
      if (res.ok) {
        alert("Email sent successfully!");
        setEmails(emails.filter(e => e.id !== selectedEmail.id));
        setSelectedEmail(null);
        setAnalysis(null);
        setDraft("");
      } else {
        const errData = await res.json();
        alert(`Failed to send: ${errData.error || "Unknown error"}`);
      }
    } catch (e) {
      alert("An error occurred while sending.");
    } finally {
      setIsSending(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
      case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
      case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
      default: return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar / Email List */}
      <div className="w-1/3 bg-slate-900/40 border-r border-slate-800 backdrop-blur-xl flex flex-col z-20">
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Zap className="w-5 h-5 text-blue-400 animate-pulse-slow" />
            </div>
            <h1 className="text-xl font-bold tracking-wide neon-text-blue text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Bionic Inbox</h1>
          </div>
          <button onClick={fetchEmails} className="hover:bg-slate-800 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-700 group" title="Refresh Inbox">
            <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-blue-400 ${isLoadingEmails ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {isLoadingEmails ? (
            <div className="p-8 flex flex-col items-center justify-center text-slate-500 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500/50" />
              <span className="text-sm tracking-widest uppercase">Initializing Stream...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-slate-500 h-full">
              <CheckCircle className="w-12 h-12 mb-4 opacity-20" />
              <p>Inbox zero achieved.</p>
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={`p-5 border-b border-slate-800/50 cursor-pointer transition-all duration-300 relative group
                  ${selectedEmail?.id === email.id 
                    ? "bg-blue-900/20 border-l-4 border-l-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]" 
                    : "hover:bg-slate-800/40 border-l-4 border-l-transparent"}`}
              >
                {!email.read && (
                  <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>
                )}
                <div className="flex justify-between mb-2">
                  <span className={`font-semibold tracking-wide ${!email.read ? "text-slate-100" : "text-slate-400"}`}>{email.senderName}</span>
                  <span className="text-xs text-slate-500 font-mono bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">{new Date(email.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className={`text-sm truncate mb-1.5 ${!email.read ? "font-bold text-blue-100" : "font-medium text-slate-300"}`}>{email.subject}</p>
                <p className="text-sm text-slate-500 truncate group-hover:text-slate-400 transition-colors">{email.body}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-2/3 flex flex-col h-screen relative bg-slate-950/80">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

        {selectedEmail ? (
          <>
            {/* Email Detail View */}
            <div className="p-8 flex-1 overflow-y-auto z-10 custom-scrollbar">
              <h2 className="text-3xl font-bold mb-6 text-slate-100 tracking-tight">{selectedEmail.subject}</h2>
              <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  {selectedEmail.senderName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-lg">{selectedEmail.senderName}</div>
                  <div className="text-sm text-slate-400 font-mono">&lt;{selectedEmail.senderEmail}&gt;</div>
                </div>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
                {selectedEmail.body}
              </div>
            </div>

            {/* AI Staging / HITL Dashboard */}
            <div className="h-1/2 glass-panel border-t border-slate-700/50 flex flex-col z-20 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
              
              <div className="p-4 border-b border-slate-700/50 bg-slate-900/60 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-violet-400" />
                  <span className="font-bold tracking-widest uppercase text-sm text-slate-200 neon-text-purple">Neural Processing Core</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-950/50 rounded-lg border border-slate-700/50 p-1">
                    <span className="text-slate-400 text-xs uppercase px-2 font-bold tracking-wider">Tone</span>
                    <select 
                      className="bg-slate-800 text-slate-200 text-sm rounded px-3 py-1 outline-none border border-transparent focus:border-slate-600 transition-colors"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="direct">Direct</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="relative overflow-hidden bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 px-5 py-2 rounded-lg font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 group"
                  >
                    {isAnalyzing && <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>}
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4 group-hover:animate-pulse" />}
                    <span className="relative z-10 tracking-wide">{analysis ? "RE-CALCULATE" : "ANALYZE INTENT"}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-5 flex gap-5">
                {/* Analysis Panel */}
                <div className="w-1/3 flex flex-col gap-4">
                  {analysis ? (
                    <div className="glass-card p-5 rounded-xl flex-1 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
                      <h3 className="font-bold text-slate-300 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-400" /> Metrics Extracted
                      </h3>
                      <div className="space-y-4 text-sm flex-1">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><Tag className="w-3 h-3"/> Intent</span>
                          <span className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 capitalize w-fit font-medium shadow-inner">{analysis.intent}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><Activity className="w-3 h-3"/> Priority</span>
                          <span className={`px-3 py-1.5 rounded-lg border capitalize w-fit font-bold tracking-wide ${getUrgencyColor(analysis.urgency)}`}>{analysis.urgency}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><Cpu className="w-3 h-3"/> Category</span>
                          <span className="text-blue-300 font-medium bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">{analysis.category}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><User className="w-3 h-3"/> Entity</span>
                          <span className="text-violet-300 font-medium capitalize bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-500/20">{analysis.senderType}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full border border-dashed border-slate-700/50 bg-slate-900/20 rounded-xl flex flex-col items-center justify-center text-slate-500 p-6 text-center transition-all hover:bg-slate-900/40 hover:border-slate-600">
                      <ShieldAlert className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm font-medium tracking-wide">Awaiting Analysis Directive.</p>
                      <p className="text-xs mt-2 opacity-70">Initialize scan to extract parameters.</p>
                    </div>
                  )}
                </div>

                {/* Draft Panel */}
                <div className="w-2/3 flex flex-col">
                  {draft ? (
                    <div className="flex-1 flex flex-col glass-card rounded-xl overflow-hidden relative">
                      <div className="bg-slate-900/80 px-5 py-3 border-b border-slate-700/50 flex justify-between items-center backdrop-blur-md">
                        <span className="font-bold text-slate-300 text-xs tracking-widest uppercase flex items-center gap-2">
                          <Edit className="w-4 h-4 text-emerald-400" /> Output Buffer
                        </span>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <CheckCircle className="w-3 h-3" /> VERIFIED
                        </span>
                      </div>
                      <textarea 
                        className="flex-1 w-full p-5 resize-none bg-transparent focus:outline-none text-slate-200 font-mono text-sm leading-relaxed custom-scrollbar"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        spellCheck={false}
                      />
                      <div className="bg-slate-900/80 p-4 border-t border-slate-700/50 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-mono">Manual override engaged</span>
                        <div className="flex gap-3">
                          <button 
                            onClick={handleApproveAndSend}
                            disabled={isSending}
                            className="px-6 py-2 text-sm font-bold tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg hover:from-emerald-300 hover:to-cyan-300 flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
                          >
                            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {isSending ? "TRANSMITTING..." : "EXECUTE & SEND"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full border border-dashed border-slate-700/50 bg-slate-900/20 rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 text-center transition-all">
                      {analysis ? (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                            <Zap className="w-12 h-12 mb-6 text-blue-400 relative z-10 animate-pulse" />
                          </div>
                          <p className="text-base mb-6 font-medium tracking-wide text-slate-300">Parameters locked. Generative core ready.</p>
                          <button 
                            onClick={handleDraft}
                            disabled={isDrafting}
                            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border border-blue-400/50 px-8 py-3 rounded-lg font-bold tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center gap-3 disabled:opacity-50"
                          >
                            {isDrafting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                            {isDrafting ? "SYNTHESIZING..." : "INITIALIZE GENERATOR"}
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center opacity-40">
                          <Edit className="w-10 h-10 mb-4" />
                          <p className="text-sm tracking-wide">Synthesizer offline. Requires intent analysis.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative z-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150"></div>
              <div className="w-32 h-32 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm relative z-10">
                <Mail className="w-12 h-12 text-slate-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-300 tracking-wider mb-2">SYSTEM STANDBY</h2>
            <p className="text-sm mt-2 max-w-sm text-center text-slate-500 font-mono bg-slate-900/50 p-3 rounded border border-slate-800">
              Select an incoming transmission to engage the Bionic Agent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
