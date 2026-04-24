"use client";

import { useState } from "react";
import { Send, CheckCircle, Mail, Zap } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    subject: "",
    body: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsSuccess(true);
      setFormData({ senderName: "", senderEmail: "", subject: "", body: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10"></div>
        <div className="max-w-md w-full glass-panel p-10 rounded-2xl text-center relative z-10 border border-emerald-500/30">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-3 tracking-tight">Transmission Secured</h2>
          <p className="text-slate-400 mb-8 font-mono text-sm">Data packet delivered to Bionic Agent.</p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="text-emerald-400 font-bold tracking-widest text-sm hover:text-emerald-300 transition-colors uppercase border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 rounded-lg hover:bg-emerald-500/20"
          >
            Initiate New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-12 p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <div className="max-w-xl w-full glass-panel p-10 rounded-2xl relative z-10">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-4 inline-block">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 tracking-tight mb-2">Establish Uplink</h1>
          <p className="text-slate-400 font-mono text-sm">Transmit data to the Bionic Agent for processing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">Entity ID</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                placeholder="John Doe"
                value={formData.senderName}
                onChange={(e) => setFormData({...formData, senderName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">Comms Channel</label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                placeholder="john@example.com"
                value={formData.senderEmail}
                onChange={(e) => setFormData({...formData, senderEmail: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">Data Classification</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
              placeholder="How can we help?"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">Payload Array</label>
            <textarea 
              required
              rows={5}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none text-slate-100 placeholder-slate-600 transition-all custom-scrollbar"
              placeholder="Input payload..."
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
            />
          </div>

          <button 
            disabled={isSubmitting}
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold tracking-widest text-sm py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] uppercase mt-4"
          >
            {isSubmitting ? "Transmitting..." : (
              <>
                <Send className="w-5 h-5" /> Execute Transmission
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
