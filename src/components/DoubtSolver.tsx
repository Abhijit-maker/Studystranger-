import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, Sparkles, User, Brain, BookOpen, AlertCircle, Bookmark } from "lucide-react";
import { getStrangerResponse } from "../services/geminiService";
import { AIMemoryVault } from "./AIMemoryVault";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

interface DoubtSolverProps {
  onClose: () => void;
  initialSubject?: string;
  apiKey?: string;
  userName?: string;
  userId?: string;
}

export const DoubtSolver: React.FC<DoubtSolverProps> = ({ 
  onClose, 
  initialSubject = "Bengali", 
  apiKey, 
  userName = "Abhijit",
  userId = "default"
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: `Hello ${userName}! Ami tomar ${initialSubject} doubt solver. Ki jante chao? (I'm your ${initialSubject} doubt solver. What do you want to know?)`
    }
  ]);
  const [input, setInput] = useState(() => localStorage.getItem("draft_doubt_input") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryVault, setShowMemoryVault] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: "user",
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    localStorage.removeItem("draft_doubt_input");
    setIsLoading(true);

    try {
      // Use Gemini to get explanation focusing on WBCHSE Sem 3 with account memory support
      const response = await getStrangerResponse(
        `Answer as a helpful tutor for WBCHSE Class 12 Semester 3. Subject: ${initialSubject}. Question: ${input}. (App Developer: Darkness)`,
        messages.map(m => ({ id: m.id, sender: m.sender === 'bot' ? 'stranger' : 'user', text: m.text })),
        "stranger",
        apiKey,
        userName,
        userId
      );

      const botMsg: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: "bot",
        text: response
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Doubt Solver Error:", error);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: "bot",
        text: "Sorry, error hoyeche. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AIMemoryVault 
        isOpen={showMemoryVault} 
        onClose={() => setShowMemoryVault(false)} 
        userId={userId} 
        userName={userName} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
      >
        <div className="bg-white w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <Bot size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 leading-none">DoubtBuddy</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{initialSubject} Expert</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMemoryVault(true)}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border border-indigo-100"
                title="Manage AI Account Memory"
              >
                <Brain size={14} className="text-indigo-600" />
                <span>Memory Core</span>
              </button>

              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all hover:bg-rose-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.map((msg, idx) => (
            <motion.div
              key={`doubt-${msg.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === "user" ? "bg-slate-900 text-white" : "bg-white text-blue-600 border border-slate-100"
              }`}>
                {msg.sender === "user" ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                msg.sender === "user" 
                  ? "bg-slate-900 text-white rounded-tr-none" 
                  : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-blue-600 border border-slate-100 flex items-center justify-center animate-pulse shadow-sm">
                <Brain size={16} />
              </div>
              <div className="bg-white text-slate-400 p-4 rounded-2xl rounded-tl-none border border-slate-100 italic text-sm shadow-sm">
                Analyzing doubt...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                const val = e.target.value;
                setInput(val);
                localStorage.setItem("draft_doubt_input", val);
              }}
              placeholder="Ask anything about your syllabus..."
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
            />
            <button
              disabled={isLoading || !input.trim()}
              className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-slate-900/10"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-4 flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest justify-center">
            <div className="flex items-center gap-2">
              <BookOpen size={10} />
              MCQ Focused
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <AlertCircle size={10} />
              Instant Help
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </>
  );
};
