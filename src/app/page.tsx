"use client";

import { useState, useEffect } from "react";
import { Email } from "@/lib/mock-data";
import { Mail, Loader2, Send, Edit, RefreshCw, CheckCircle, ShieldAlert, Zap } from "lucide-react";

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
      setEmails(data);
    } catch (e) {
      console.error(e);
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

  const handleApproveAndSend = () => {
    if (!selectedEmail) return;
    alert("Email sent successfully!");
    setEmails(emails.filter(e => e.id !== selectedEmail.id));
    setSelectedEmail(null);
    setAnalysis(null);
    setDraft("");
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar / Email List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <h1 className="text-xl font-bold">Bionic Inbox</h1>
          </div>
          <button onClick={fetchEmails} className="hover:bg-blue-700 p-1 rounded transition-colors" title="Refresh Inbox">
            <RefreshCw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => handleSelectEmail(email)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedEmail?.id === email.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"}`}
            >
              <div className="flex justify-between mb-1">
                <span className={`font-semibold ${!email.read ? "text-black" : "text-gray-600"}`}>{email.senderName}</span>
                <span className="text-xs text-gray-500">{new Date(email.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p className={`text-sm truncate ${!email.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{email.subject}</p>
              <p className="text-sm text-gray-500 truncate mt-1">{email.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-2/3 flex flex-col h-screen">
        {selectedEmail ? (
          <>
            {/* Email Detail View */}
            <div className="p-6 bg-white flex-1 overflow-y-auto shadow-sm z-10">
              <h2 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h2>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedEmail.senderName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{selectedEmail.senderName}</div>
                  <div className="text-sm text-gray-500">&lt;{selectedEmail.senderEmail}&gt;</div>
                </div>
              </div>
              <div className="prose max-w-none text-gray-800 whitespace-pre-wrap border-l-2 border-gray-200 pl-4">
                {selectedEmail.body}
              </div>
            </div>

            {/* AI Staging / HITL Dashboard */}
            <div className="h-1/2 bg-gray-50 border-t border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Agent Staging Area (HITL)</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <span className="text-gray-600">Tone:</span>
                    <select 
                      className="border border-gray-300 rounded px-2 py-1 bg-white"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="direct">Direct</option>
                    </select>
                  </label>
                  <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {analysis ? "Re-Analyze" : "Analyze Intent"}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex gap-4">
                {/* Analysis Panel */}
                <div className="w-1/3 space-y-4">
                  {analysis ? (
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">AI Analysis</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="block text-gray-500 text-xs uppercase mb-1">Intent</span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium border border-gray-200 capitalize">{analysis.intent}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 text-xs uppercase mb-1">Urgency</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getUrgencyColor(analysis.urgency)} capitalize`}>{analysis.urgency}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 text-xs uppercase mb-1">Category</span>
                          <span className="font-medium text-gray-800">{analysis.category}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 text-xs uppercase mb-1">Sender Type</span>
                          <span className="font-medium text-gray-800 capitalize">{analysis.senderType}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      <Mail className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Click "Analyze Intent" to extract context and categorize this email.</p>
                    </div>
                  )}
                </div>

                {/* Draft Panel */}
                <div className="w-2/3 flex flex-col">
                  {draft ? (
                    <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
                        <span>Generated Draft</span>
                        <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Ready for review
                        </span>
                      </div>
                      <textarea 
                        className="flex-1 w-full p-4 resize-none focus:outline-none text-gray-800"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                      <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
                          <Edit className="w-4 h-4" /> Edit Manually
                        </button>
                        <button 
                          onClick={handleApproveAndSend}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" /> Approve & Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      {analysis ? (
                        <>
                          <Zap className="w-8 h-8 mb-4 text-blue-400" />
                          <p className="text-sm mb-4">Context extracted. Ready to generate a contextual response.</p>
                          <button 
                            onClick={handleDraft}
                            disabled={isDrafting}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
                          >
                            {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                            {isDrafting ? "Drafting..." : "Generate AI Draft"}
                          </button>
                        </>
                      ) : (
                        <p className="text-sm">Analyze the email first to unlock AI drafting capabilities.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Mail className="w-16 h-16 mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-500">Select an email to view</h2>
            <p className="text-sm mt-2 max-w-xs text-center">The Bionic Inbox agent is standing by to process your messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
