import React from "react";
import { 
  Bot, 
  Sparkles, 
  BookOpen, 
  Target, 
  Shield, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Brain, 
  BarChart3, 
  PenTool, 
  Zap, 
  Award, 
  GraduationCap, 
  Code2, 
  Lock, 
  HelpCircle,
  ExternalLink,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

interface LandingPageProps {
  onStartLogin: () => void;
  onOpenPrivacy: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartLogin, onOpenPrivacy }) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/10 blur-[160px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot size={24} />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block leading-none">
              STUDY STRANGER
            </span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              WBCHSE Sem 3 Companion
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenPrivacy}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors hidden sm:flex items-center gap-1.5 px-3 py-2"
          >
            <Shield size={14} className="text-indigo-400" />
            <span>Privacy & Security</span>
          </button>

          <button
            onClick={onStartLogin}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            <span>Sign In / Join</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
        >
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>Class 12 WBCHSE Semester 3 Exam Engine</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.15]"
        >
          Prepare Smarter with <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
            Your Personal AI Mentor
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Tailored specifically for West Bengal Class 12 students. Master <strong className="text-white">Biology</strong>, <strong className="text-white">Bengali A</strong>, and <strong className="text-white">English B</strong> with instant AI doubt clearing, MCQ practice tests, interactive whiteboards, and mistake trackers.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <button
            onClick={onStartLogin}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3"
          >
            <Bot size={20} />
            <span>Launch AI Mentor & Practice</span>
            <ArrowRight size={18} />
          </button>

          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-4 bg-white/5 border border-white/10 text-slate-200 hover:text-white rounded-2xl font-bold text-sm transition-all hover:bg-white/10 flex items-center justify-center gap-2"
          >
            <span>Explore App Capabilities</span>
          </a>
        </motion.div>

        {/* Live Metrics Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left"
        >
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <div className="text-2xl font-black text-indigo-400">WBCHSE</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Semester 3 Syllabus</div>
          </div>
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <div className="text-2xl font-black text-purple-400">100% Free</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Gemini AI Assistance</div>
          </div>
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <div className="text-2xl font-black text-emerald-400">MCQ Engine</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Timed Practice & Bank</div>
          </div>
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <div className="text-2xl font-black text-amber-400">Encrypted</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Firebase Sync & Storage</div>
          </div>
        </motion.div>
      </section>

      {/* App Capabilities / Features Grid */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] block">
            Powerful Features Built For Success
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Everything You Need for WBCHSE Semester 3
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Engineered with modern AI tools and interactive modules designed specifically for Bengali-medium & English-medium Class 12 students.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl hover:border-indigo-500/50 transition-all group">
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bot size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Mentor & Doubt Solver</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ask doubts in Bengali or English. Get instant step-by-step explanations for Biology (Microsporogenesis, Mendel's laws), Bengali Literature, and English prose & poetry.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl hover:border-purple-500/50 transition-all group">
            <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Timed MCQ Test Engine</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Topic-wise Semester 3 MCQs with instant scoring, timer challenges, and detailed rationale for every answer to build exam speed.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl hover:border-emerald-500/50 transition-all group">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PenTool size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive Whiteboard</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Draw and practice biological structures (sperm cell acrosome, flower anatomy, DNA double helix) on an interactive canvas with color brushes.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl hover:border-amber-500/50 transition-all group">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Mistake Bank</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every incorrect question is automatically stored in your personal Mistake Bank so you can retry and turn weaknesses into top scores.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl hover:border-cyan-500/50 transition-all group">
            <div className="w-14 h-14 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gamified XP & Streaks</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Maintain daily study streaks, earn XP badges, track total hours spent studying, and view performance charts on your student dashboard.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl hover:border-rose-500/50 transition-all group">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Encrypted Account Sync</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Sign in with Google or username to save your notes, test results, and customized Gemini API Key securely in Google Firebase Cloud.
            </p>
          </div>
        </div>
      </section>

      {/* Syllabus Focus Showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/50 to-slate-900 border border-indigo-500/20 rounded-[3rem] p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">
                Targeted Curriculum
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white">
                WBCHSE Class 12 Semester 3 Subjects
              </h3>
            </div>
            <button
              onClick={onStartLogin}
              className="px-6 py-3 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-all self-start md:self-auto shrink-0 shadow-lg"
            >
              Start Practice Test
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* Subject 1 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-base">
                <BookOpen size={20} />
                <span>1. Biology (জীববিদ্যা)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li>Microsporogenesis & Megasporogenesis</li>
                <li>Human Reproduction (Gametogenesis, LH Surge on 14th day)</li>
                <li>Genetics & DNA replication (SSB protein, TATA box)</li>
                <li>Evolution (Oparin-Haldane, Homologous organs)</li>
              </ul>
            </div>

            {/* Subject 2 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-purple-400 font-bold text-base">
                <BookOpen size={20} />
                <span>2. Bengali A (বাংলা এ)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li>প্রবন্ধ/গল্প: আদিরিনী (জয়রাম মোক্তার), বাঙ্গালা ভাষা</li>
                <li>কবিতা: ধর্ম (শ্রীজাত), দিগ্বিজয়ের রূপকথা</li>
                <li>আন্তর্জাতিক/অনুবাদ: পোটরাজ, তার সঙ্গে</li>
                <li>ভাষাবিজ্ঞান: ধ্বনিতত্ত্ব, শব্দার্থতত্ত্ব</li>
              </ul>
            </div>

            {/* Subject 3 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-indigo-400 font-bold text-base">
                <BookOpen size={20} />
                <span>3. English B</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li>Prose: 'The Night Train at Deoli', 'Strong Roots', 'The Bet'</li>
                <li>Verse: 'Ulysses' (Tennyson), 'Our Casuarina Tree'</li>
                <li>Play: 'Riders to the Sea' (J.M. Synge)</li>
                <li>Vocabulary & Grammar Practice</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Developer & Ownership Spotlight */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-[2.5rem] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-400/20">
            <Code2 size={12} />
            <span>Official Developer & Creator</span>
          </div>
          <h3 className="text-2xl font-black text-white">
            Created & Developed by <span className="text-amber-400">Darkness</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            Crafted with passion to help Class 12 West Bengal Council of Higher Secondary Education students achieve outstanding academic results in Semester 3.
          </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="p-10 md:p-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[3rem] text-white shadow-2xl shadow-indigo-600/30 space-y-6">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            Ready to Ace Your Semester 3 Exams?
          </h2>
          <p className="text-indigo-100 text-sm max-w-xl mx-auto font-medium">
            Join now, set up your profile, and start chatting with your personal AI Study Mentor in less than 30 seconds.
          </p>
          <button
            onClick={onStartLogin}
            className="px-10 py-5 bg-white text-indigo-950 font-black text-sm uppercase tracking-wider rounded-2xl hover:bg-amber-300 transition-all shadow-xl active:scale-95 inline-flex items-center gap-3"
          >
            <Bot size={22} className="text-indigo-600" />
            <span>Get Started Free Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © 2026 Study Stranger • Developed by <strong className="text-slate-300">Darkness</strong>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onOpenPrivacy}
            className="hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <Shield size={12} />
            <span>Privacy Policy & Terms</span>
          </button>
          <button 
            onClick={onStartLogin}
            className="hover:text-indigo-400 transition-colors font-bold"
          >
            Sign In / Register
          </button>
        </div>
      </footer>
    </div>
  );
};
