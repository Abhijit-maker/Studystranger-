import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, Target, History, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Clock, Trophy, 
  AlertCircle, Layout, Globe, BookOpen, Filter, X, Zap, ArrowRight, RotateCcw, 
  Sparkles, Award, Play, Check, Flame, Shield, HelpCircle, Layers, BarChart2
} from "lucide-react";
import { MCQQuestion, QuizDifficulty, MockTestConfig } from "../types";
import { generateMockTestQuestions } from "../services/geminiService";
import "katex/dist/katex.min.css";
import { MathText } from "./MathText";
import { nativeService } from "../services/nativeService";

interface MockTestProps {
  onClose: () => void;
  character: string;
  onPointsAwarded?: (points: number) => void;
  onCompleted?: (subject: string, score: number) => void;
  apiKey?: string;
  userName?: string;
  userId?: string;
}

const PRESET_TOPICS: Record<string, { name: string; bnName: string; tags: string[] }[]> = {
  "Biology": [
    { name: "Sexual Reproduction in Flowering Plants", bnName: "সসপুষ্পক উদ্ভিদের যৌন জনন", tags: ["Microsporogenesis", "Megasporogenesis", "Geitonogamy"] },
    { name: "Human Reproduction", bnName: "মানুষের জনন", tags: ["Gametogenesis", "Menstrual Cycle", "Fertilization & ZP3"] },
    { name: "Reproductive Health", bnName: "জননগত স্বাস্থ্য", tags: ["STDs", "Syphilis & Treponema", "Contraception"] },
    { name: "Genetics and Evolution", bnName: "বংশগতি ও বিবর্তন", tags: ["Mendel's Laws", "Linkage", "DNA Structure", "Oparin-Haldane"] }
  ],
  "Bengali": [
    { name: "আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)", bnName: "আদিরিনী গল্প", tags: ["জয়রাম মুখোপাধ্যায়", "হস্তিনী আদিরিনী", "উপন্যাস/গল্প"] },
    { name: "বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ)", bnName: "বাঙ্গালা ভাষা প্রবন্ধ", tags: ["জনসাধারণের ভাষা", "শিক্ষা ও ভাষা"] },
    { name: "ধর্ম (শ্রীজাত)", bnName: "ধর্ম কবিতা", tags: ["মানুষের ধর্ম", "মানবতা"] },
    { name: "ধ্বনিতত্ত্ব ও ভাষাবিজ্ঞান", bnName: "ভাষাবিজ্ঞান", tags: ["ধ্বনিতত্ত্ব", "শব্দার্থতত্ত্ব", "বাক্যতত্ত্ব"] }
  ],
  "English": [
    { name: "The Night Train at Deoli (Ruskin Bond)", bnName: "The Night Train at Deoli", tags: ["Deoli Station", "The Basket Girl", "Longing"] },
    { name: "Strong Roots (APJ Abdul Kalam)", bnName: "Strong Roots", tags: ["Rameswaram", "Jainulabdeen", "Spiritual Roots"] },
    { name: "The Bet (Anton Chekhov)", bnName: "The Bet", tags: ["2 Million Rubles", "15 Years", "Banker & Lawyer"] },
    { name: "Ulysses (Alfred Lord Tennyson)", bnName: "Ulysses", tags: ["To strive to seek", "Ithaca", "Heroic Verse"] },
    { name: "Our Casuarina Tree (Toru Dutt)", bnName: "Our Casuarina Tree", tags: ["Nostalgia", "Immortality of Nature"] }
  ],
  "Math": [
    { name: "Relations and Functions", bnName: "সম্পর্ক ও চিত্রণ", tags: ["Equivalence Relation", "Bijective"] },
    { name: "Matrices and Determinants", bnName: "ম্যাট্রিক্স ও নির্ণায়ক", tags: ["Cramer's Rule", "Inverse"] },
    { name: "Differential Calculus", bnName: "অবকলন", tags: ["Derivatives", "Continuity"] },
    { name: "Integral Calculus", bnName: "সমাকলন", tags: ["Definite Integral", "Area"] }
  ],
  "Physics": [
    { name: "Electrostatics & Capacitors", bnName: "স্থির তড়িৎ", tags: ["Coulomb's Law", "Gauss Theorem"] },
    { name: "Current Electricity", bnName: "প্রবাহী তড়িৎ", tags: ["Kirchhoff's Laws", "Potentiometer"] },
    { name: "Magnetism & EMI", bnName: "তড়িৎ চুম্বকত্ব", tags: ["Biot-Savart", "Faraday's Law"] }
  ],
  "Chemistry": [
    { name: "Solid State & Solutions", bnName: "কঠিন অবস্থা ও দ্রবণ", tags: ["Unit Cells", "Raoult's Law"] },
    { name: "Electrochemistry & Kinetics", bnName: "তড়িৎ রসায়ন", tags: ["Nernst Equation", "Rate Constant"] },
    { name: "Organic Chemistry", bnName: "জৈব রসায়ন", tags: ["Haloalkanes", "Aldehydes & Ketones"] }
  ],
  "Computer App": [
    { name: "Logic Gates & Combinational Circuits", bnName: "লজিক গেট", tags: ["Multiplexer", "Decoder", "Adder"] },
    { name: "Networking & HTML", bnName: "নেটওয়ার্কিং ও এইচটিএমএল", tags: ["TCP/IP", "Topology", "Forms"] },
    { name: "Database Management (DBMS)", bnName: "ডিবিএমএস", tags: ["SQL", "Relational Model", "Keys"] }
  ]
};

export const MockTest: React.FC<MockTestProps> = ({ 
  onClose, 
  character, 
  onPointsAwarded, 
  onCompleted, 
  apiKey, 
  userName = "Abhijit", 
  userId 
}) => {
  const [step, setStep] = useState<"config" | "loading" | "quiz" | "result">("config");
  const [config, setConfig] = useState<MockTestConfig>({
    topic: "Unit I: Reproduction (Sexual Reproduction in Flowering Plants)",
    subject: "Biology",
    difficulty: "medium",
    scope: "topic",
    isPYQ: false,
    yearRange: [2019, 2024]
  });

  const [questionCount, setQuestionCount] = useState<number>(40);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(40);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [testMode, setTestMode] = useState<"exam" | "practice">("exam");
  const [langMode, setLangMode] = useState<"bilingual" | "english" | "bengali">("bilingual");
  
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [flaggedIndexes, setFlaggedIndexes] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load test history from localStorage
  useEffect(() => {
    const testHistoryKey = userId ? `mock_test_history_${userId}` : "mock_test_history";
    const saved = localStorage.getItem(testHistoryKey);
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [userId]);

  // Scroll to top on index/step change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, step]);

  // Timer effect during quiz
  useEffect(() => {
    if (step === "quiz" && timeLimitMinutes > 0) {
      if (timeLeftSeconds > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeftSeconds(prev => prev - 1);
        }, 1000);
      } else if (timeLeftSeconds === 0 && questions.length > 0) {
        // Auto finish quiz on timeout
        finishQuiz();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, timeLeftSeconds]);

  const startQuiz = async () => {
    if (!config.topic && config.scope !== "syllabus") return;
    setStep("loading");
    try {
      const generatedQuestions = await generateMockTestQuestions(
        {
          ...config,
          topic: config.topic || `${config.subject} WBCHSE Class 12 Syllabus`
        }, 
        apiKey
      );

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("No questions could be generated for this topic.");
      }

      const slicedQuestions = generatedQuestions.slice(0, questionCount);
      setQuestions(slicedQuestions);
      setCurrentIndex(0);
      setUserAnswers(new Array(slicedQuestions.length).fill(-1));
      setFlaggedIndexes([]);
      setScore(0);
      setShowExplanation(false);
      setReviewMode(false);
      setShowPalette(false);
      setShowSubmitModal(false);
      
      if (timeLimitMinutes > 0) {
        setTimeLeftSeconds(timeLimitMinutes * 60);
      } else {
        setTimeLeftSeconds(0);
      }

      setStep("quiz");
      nativeService.triggerHaptic('success');
    } catch (error: any) {
      console.error("Failed to generate questions:", error);
      alert(`Dukkhoito ${userName}, ${error.message || "Test question generate korte problem holo"}. Re-trying...`);
      setStep("config");
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    
    if (testMode === "practice") {
      if (showExplanation) return;
      newAnswers[currentIndex] = optionIndex;
      setUserAnswers(newAnswers);
      setShowExplanation(true);

      if (optionIndex === questions[currentIndex].correctIndex) {
        setScore(s => s + 1);
        nativeService.triggerHaptic('success');
      } else {
        nativeService.triggerHaptic('failure');
        nativeService.showToast("Saved to Mistake Bank!");
        saveToMistakeBank(questions[currentIndex]);
      }
    } else {
      // Real Exam Mode: Allow changing selected option until submit
      newAnswers[currentIndex] = optionIndex;
      setUserAnswers(newAnswers);
      nativeService.triggerHaptic('success');
    }
  };

  const toggleFlagQuestion = (index: number) => {
    setFlaggedIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
    nativeService.triggerHaptic('success');
  };

  const saveToMistakeBank = (q: MCQQuestion) => {
    const mistakeBankKey = userId ? `mistake_bank_${userId}` : "mistake_bank";
    const currentMistakes = JSON.parse(localStorage.getItem(mistakeBankKey) || "[]");
    const alreadySaved = currentMistakes.find((m: any) => m.id === q.id);
    if (!alreadySaved) {
      const newMistake = {
        ...q,
        subject: config.subject,
        question: q.questionEn,
        options: q.optionsEn,
        correctAnswer: q.correctIndex,
        explanation: q.explanationEn
      };
      localStorage.setItem(mistakeBankKey, JSON.stringify([...currentMistakes, newMistake]));
    }
  };

  const finishQuiz = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Calculate final score
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        calculatedScore += 1;
      } else if (userAnswers[idx] !== -1) {
        saveToMistakeBank(q);
      }
    });
    
    setScore(calculatedScore);
    const totalQuestions = questions.length;
    const scorePercentage = Math.round((calculatedScore / totalQuestions) * 100);
    
    // Save test result to history
    const testHistoryKey = userId ? `mock_test_history_${userId}` : "mock_test_history";
    const testHistory = JSON.parse(localStorage.getItem(testHistoryKey) || "[]");
    const newResult = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      subject: config.subject,
      topic: config.topic || "Full Syllabus",
      score: calculatedScore,
      total: totalQuestions,
      percentage: scorePercentage,
      date: new Date().toISOString(),
      difficulty: config.difficulty,
      mode: testMode
    };
    
    const updatedHistory = [newResult, ...testHistory].slice(0, 50);
    localStorage.setItem(testHistoryKey, JSON.stringify(updatedHistory));
    setHistoryList(updatedHistory);

    setShowSubmitModal(false);
    setStep("result");
    nativeService.triggerHaptic('celebrate');
    nativeService.showToast(`Exam complete! Score: ${calculatedScore}/${totalQuestions}`);
    if (onPointsAwarded) {
      onPointsAwarded(calculatedScore * 15); // 15 PTS per correct answer
    }
    if (onCompleted) {
      onCompleted(config.subject, calculatedScore);
    }
  };

  const handlePrintScorecard = () => {
    window.print();
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(userAnswers[currentIndex + 1] !== -1);
    } else {
      finishQuiz();
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#090d16]/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-6 overflow-hidden text-slate-800 dark:text-slate-100 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full md:max-w-6xl md:h-[92vh] bg-white dark:bg-[#0d1322] md:rounded-[40px] border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* Dynamic Glow Accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Top Header */}
        <header className="px-5 py-4 md:px-8 md:py-5 bg-slate-50/90 dark:bg-[#080c16]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between relative z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Trophy size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                  Mock Test <span className="text-indigo-600 dark:text-indigo-400">Dashboard</span>
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  WBCHSE Sem 3
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                Student Portal • Abhijit (Class 12)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step === "quiz" && timeLimitMinutes > 0 && (
              <div className={`px-4 py-2 rounded-2xl border font-mono font-black text-xs md:text-sm flex items-center gap-2 shadow-sm transition-colors ${
                timeLeftSeconds < 60 
                  ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-400 animate-pulse" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400"
              }`}>
                <Clock size={16} />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            )}

            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-300 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all active:scale-95 border border-slate-200 dark:border-slate-700/50"
              title="Close Mock Test"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div ref={containerRef} className="flex-1 overflow-y-auto relative z-10 touch-pan-y overscroll-contain">
          <AnimatePresence mode="wait">

            {/* STEP 1: CONFIGURATION & LAUNCHER */}
            {step === "config" && (
              <motion.div 
                key="config"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 md:p-8 max-w-5xl mx-auto space-y-8"
              >
                {/* Hero Banner */}
                <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-indigo-100">
                      <Sparkles size={12} /> Class 12 WBCHSE AI Mock Test Generator
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight italic">
                      Prepare with Precision. Master Your WBCHSE Sem 3 Exams.
                    </h1>
                    <p className="text-xs md:text-sm font-medium text-indigo-100/90 max-w-2xl">
                      Select your subject and topic below to generate instant bilingual MCQs with step-by-step Bengali & English explanations!
                    </p>
                  </div>
                </div>

                {/* Configuration Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column (Subject & Topic Selection) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Subject Selector Pills */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>01. Select Subject</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{config.subject} Selected</span>
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Biology", "Bengali", "English", "Math", "Physics", "Chemistry", "Computer App"].map(s => {
                          const isSelected = config.subject === s;
                          return (
                            <button
                              key={s}
                              onClick={() => {
                                const defaultTopic = PRESET_TOPICS[s]?.[0]?.name || "";
                                setConfig({ ...config, subject: s, topic: defaultTopic });
                              }}
                              className={`p-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center text-center ${
                                isSelected 
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]" 
                                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Preset Topics */}
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>02. WBCHSE Sem 3 Topic Shortcuts</span>
                        <span className="text-[10px] text-slate-400 font-bold">One-Tap Load</span>
                      </label>

                      <div className="grid grid-cols-1 gap-2.5">
                        {(PRESET_TOPICS[config.subject] || []).map((t, idx) => {
                          const isSelected = config.topic === t.name;
                          return (
                            <div
                              key={idx}
                              onClick={() => setConfig({ ...config, topic: t.name })}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                isSelected 
                                  ? "bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800 shadow-sm" 
                                  : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                              }`}
                            >
                              <div className="space-y-1">
                                <h4 className={`text-xs font-extrabold ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"}`}>
                                  {t.name}
                                </h4>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic">
                                  {t.bnName}
                                </p>
                              </div>

                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"
                              }`}>
                                {isSelected && <Check size={12} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Topic Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Or Type Custom Topic / Chapter Name:
                      </label>
                      <input 
                        type="text"
                        value={config.topic}
                        onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                        placeholder="e.g. Microsporogenesis or Oparin-Haldane Theory"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Right Column (Exam Parameters & History) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="p-5 md:p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-5">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Target size={18} className="text-indigo-600 dark:text-indigo-400" /> Exam Parameters
                      </h3>

                      {/* Test Mode */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Mode & Environment</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setTestMode("exam")}
                            className={`py-2 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                              testMode === "exam" 
                                ? "bg-amber-500 text-slate-950 font-black shadow-md" 
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <Shield size={14} /> Full Exam Mode
                          </button>
                          <button
                            type="button"
                            onClick={() => setTestMode("practice")}
                            className={`py-2 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
                              testMode === "practice" 
                                ? "bg-indigo-600 text-white font-black shadow-md" 
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <Zap size={14} /> Practice Mode
                          </button>
                        </div>
                      </div>

                      {/* Question Count */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Question Count / Marks</label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[5, 10, 15, 20, 40].map(cnt => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => {
                                setQuestionCount(cnt);
                                if (cnt === 40) setTimeLimitMinutes(40);
                              }}
                              className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                                questionCount === cnt 
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-2 ring-indigo-500" 
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {cnt === 40 ? "40 (Full)" : `${cnt} Qs`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time Limit */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Time Limit</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { m: 0, label: "Untimed" },
                            { m: 10, label: "10 Mins" },
                            { m: 20, label: "20 Mins" },
                            { m: 40, label: "40 Mins" }
                          ].map(t => (
                            <button
                              key={t.m}
                              type="button"
                              onClick={() => setTimeLimitMinutes(t.m)}
                              className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                timeLimitMinutes === t.m 
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Difficulty Standard</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "easy", label: "Board Standard" },
                            { id: "medium", label: "WBCHSE Sem 3" },
                            { id: "hard", label: "Advanced Level" }
                          ].map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => setConfig({ ...config, difficulty: d.id as QuizDifficulty })}
                              className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                config.difficulty === d.id 
                                  ? "bg-indigo-600 text-white shadow-md" 
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Launch Button */}
                      <button
                        type="button"
                        onClick={startQuiz}
                        disabled={!config.topic && config.scope !== "syllabus"}
                        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      >
                        <Play size={16} className="fill-white" />
                        <span>START MOCK TEST NOW</span>
                      </button>
                    </div>

                    {/* Past Test History */}
                    {historyList.length > 0 && (
                      <div className="p-5 rounded-[2rem] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <History size={16} className="text-amber-500" /> Recent Attempt History
                        </h4>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {historyList.slice(0, 4).map((h, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-slate-200">{h.subject} - {h.topic}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{new Date(h.date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-indigo-600 dark:text-indigo-400">{h.score}/{h.total}</span>
                                <span className="text-[10px] text-emerald-500 font-bold block">{h.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: LOADING STATE */}
            {step === "loading" && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[500px]"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-200 dark:border-indigo-950 border-t-indigo-600 animate-spin" />
                  <Brain size={36} className="absolute inset-0 m-auto text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>

                <div className="space-y-3 max-w-md">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Generating Questions...
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Synthesizing WBCHSE Class 12 exam questions for <span className="font-bold text-indigo-600 dark:text-indigo-400">{config.subject}</span> ({config.topic}).
                  </p>
                  <div className="inline-block px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold mt-4">
                    💡 Tip: Read the Bengali translations carefully for maximum conceptual clarity!
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ACTIVE QUIZ */}
            {step === "quiz" && questions.length > 0 && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 md:p-8 max-w-4xl mx-auto space-y-6"
              >
                {/* Question Progress & Timer Header */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                      {currentIndex + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {currentIndex + 1} / {questions.length}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                        {testMode === "exam" ? "Full Exam Mode" : "Practice Mode"}
                      </span>
                    </div>
                  </div>

                  {/* Timer & Controls */}
                  <div className="flex items-center gap-2">
                    {timeLimitMinutes > 0 && (
                      <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 border ${
                        timeLeftSeconds < 180 
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                      }`}>
                        <Clock size={14} />
                        <span>
                          {Math.floor(timeLeftSeconds / 60).toString().padStart(2, '0')}:
                          {(timeLeftSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleFlagQuestion(currentIndex)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        flaggedIndexes.includes(currentIndex)
                          ? "bg-amber-500 text-slate-950 font-black border-amber-500"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-amber-500"
                      }`}
                    >
                      <Flame size={14} />
                      <span>{flaggedIndexes.includes(currentIndex) ? "Flagged" : "Flag"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPalette(!showPalette)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <Layout size={14} />
                      <span>Q Palette ({userAnswers.filter(a => a !== -1).length}/{questions.length})</span>
                    </button>
                  </div>
                </div>

                {/* Question Palette Drawer Grid */}
                <AnimatePresence>
                  {showPalette && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
                        <span>Question Palette (Q1 to Q{questions.length})</span>
                        <div className="flex gap-3 text-[10px]">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> Answered</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> Flagged</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"/> Pending</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                        {questions.map((_, qIdx) => {
                          const isAnswered = userAnswers[qIdx] !== -1;
                          const isFlagged = flaggedIndexes.includes(qIdx);
                          const isActive = qIdx === currentIndex;

                          let bgStyle = "bg-slate-800 text-slate-400";
                          if (isAnswered) bgStyle = "bg-emerald-600 text-white font-black";
                          if (isFlagged) bgStyle = "bg-amber-500 text-slate-950 font-black";
                          if (isActive) bgStyle += " ring-2 ring-white scale-105";

                          return (
                            <button
                              key={qIdx}
                              onClick={() => {
                                setCurrentIndex(qIdx);
                                setShowExplanation(testMode === "practice" && userAnswers[qIdx] !== -1);
                              }}
                              className={`h-9 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer ${bgStyle}`}
                            >
                              {qIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                {/* Question Box */}
                <div className="p-6 md:p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6">
                  
                  {/* English Question */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">English</span>
                    <MathText 
                      text={questions[currentIndex].questionEn} 
                      className="text-base md:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed block" 
                    />
                  </div>

                  {/* Bengali Translation */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                    <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest block">বাংলা অনুবাদ</span>
                    <MathText 
                      text={questions[currentIndex].questionBn} 
                      className="text-sm md:text-base font-bold text-indigo-900 dark:text-indigo-200 leading-relaxed italic block" 
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {questions[currentIndex].optionsEn.map((opt, idx) => {
                      const isSelected = userAnswers[currentIndex] === idx;
                      const isCorrect = questions[currentIndex].correctIndex === idx;

                      let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-300";

                      if (testMode === "practice" && showExplanation) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold shadow-sm";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200 font-bold";
                        } else {
                          btnStyle = "opacity-40 border-slate-200 dark:border-slate-800";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-100 font-bold shadow-md ring-2 ring-indigo-500/30";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={testMode === "practice" && showExplanation}
                          className={`w-full p-4 md:p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${btnStyle}`}
                        >
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected 
                              ? "bg-indigo-600 text-white" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>

                          <div className="flex-1 space-y-1">
                            <MathText text={opt} className="text-xs md:text-sm font-bold block" />
                            {questions[currentIndex].optionsBn[idx] && (
                              <MathText text={questions[currentIndex].optionsBn[idx]} className="text-[11px] text-slate-500 dark:text-slate-400 italic block" />
                            )}
                          </div>

                          {testMode === "practice" && showExplanation && isCorrect && (
                            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                          )}
                          {testMode === "practice" && showExplanation && isSelected && !isCorrect && (
                            <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-2">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => {
                        setCurrentIndex(c => Math.max(0, c - 1));
                        setShowExplanation(testMode === "practice" && userAnswers[currentIndex - 1] !== -1);
                      }}
                      className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    {testMode === "exam" ? (
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Shield size={15} /> Submit Exam
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{currentIndex < questions.length - 1 ? "Next" : "Finish"}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Explanation Section (Practice Mode Only) */}
                  <AnimatePresence>
                    {testMode === "practice" && showExplanation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-3"
                      >
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                          <AlertCircle size={16} /> Explanation & Solution Details
                        </div>

                        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <MathText text={questions[currentIndex].explanationEn} className="block leading-relaxed" />
                          {questions[currentIndex].explanationBn && (
                            <MathText text={questions[currentIndex].explanationBn} className="block leading-relaxed text-slate-500 dark:text-slate-400 italic" />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Submit Confirmation Overlay */}
            {showSubmitModal && (
              <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <Shield size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Submit WBCHSE Exam?</h3>
                    <p className="text-xs text-slate-500 font-medium">Are you sure you want to finish and submit your exam paper?</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 grid grid-cols-3 gap-2 text-xs font-bold">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Answered</span>
                      <span className="text-emerald-500 font-black text-base">{userAnswers.filter(a => a !== -1).length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Unanswered</span>
                      <span className="text-rose-500 font-black text-base">{userAnswers.filter(a => a === -1).length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">Flagged</span>
                      <span className="text-amber-500 font-black text-base">{flaggedIndexes.length}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSubmitModal(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase"
                    >
                      Continue Test
                    </button>
                    <button
                      onClick={finishQuiz}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase shadow-lg shadow-amber-500/20"
                    >
                      Yes, Submit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: FINAL RESULTS */}
            {step === "result" && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 md:p-12 max-w-2xl mx-auto space-y-8 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
                  <Trophy size={48} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Mock Test Complete!
                  </h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Subject: {config.subject} • {config.topic}
                  </p>
                </div>

                {/* Score Summary Box */}
                <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Score</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{score}/{questions.length}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Accuracy</span>
                    <span className="text-2xl font-black text-emerald-500">{Math.round((score / questions.length) * 100)}%</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Points</span>
                    <span className="text-2xl font-black text-amber-500">+{score * 15} PTS</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrintScorecard}
                    className="flex-1 py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Award size={16} />
                    <span>Print Scorecard & Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("config")}
                    className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>Try Another Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Back to Dashboard</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
