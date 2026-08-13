import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { nativeService } from "../services/nativeService";
import { 
  BookOpen, 
  Brain, 
  Calculator, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Star,
  ChevronRight,
  History,
  Target,
  BarChart3,
  Camera,
  Calendar,
  Trophy,
  Activity,
  Zap,
  Bot,
  PenTool,
  LogIn,
  LogOut,
  Users,
  Search,
  Paintbrush,
  ShieldAlert,
  Megaphone,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Settings2,
  Layout,
  Database,
  Save,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  Download,
  Loader2,
  Flame,
  Award,
  Bell,
  Check,
  Moon,
  Sun,
  Mic,
  MessageSquare,
  Compass,
  Layers,
  HelpCircle,
  Share2,
  FileSpreadsheet,
  FileQuestion,
  GraduationCap,
  Briefcase,
  ThumbsUp,
  Rocket,
  Lightbulb,
  Play,
  CloudSun,
  X,
  Sparkle,
  SunMedium,
  Command,
  ArrowRight,
  CheckSquare
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area,
  Cell
} from "recharts";
import { db } from "../firebase";
import { collection, onSnapshot, query, doc, updateDoc, setDoc, addDoc, deleteDoc, limit } from "firebase/firestore";

interface DashboardProps {
  onAction: (type: string) => void;
  userName: string;
  userPhoto?: string;
  userUid?: string;
  onLogin?: () => void;
  onLogout?: () => void;
  dailyGoals?: { id: string; text: string; completed: boolean }[];
  toggleGoal?: (id: string) => void;
  globalActions?: { id: string; userName: string; text: string; timestamp: string; userId?: string }[];
  isAdmin?: boolean;
  onOpenBuildDocs?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onAction, 
  userName, 
  userPhoto, 
  userUid,
  onLogin, 
  onLogout, 
  dailyGoals = [], 
  toggleGoal,
  globalActions = [],
  isAdmin = false,
  onOpenBuildDocs
}) => {
  // Theme & Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme_mode") === "dark";
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("theme_mode", next ? "dark" : "light");
      return next;
    });
  };

  // Live Clock & Weather
  const [currentTime, setCurrentTime] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quotes
  const motivationalQuotes = [
    "\"The secret of getting ahead is getting started.\" – Mark Twain",
    "\"Small daily improvements over time lead to stunning results.\"",
    "\"Focus on learning, not perfection. Master WBCHSE Semester 3 step by step.\"",
    "\"Knowledge is power. You are 48 days away from excellence!\""
  ];
  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    const qInterval = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % motivationalQuotes.length);
    }, 6000);
    return () => clearInterval(qInterval);
  }, [motivationalQuotes.length]);

  // Status & Profile Editing
  const [userStatus, setUserStatus] = useState<string>(() => {
    return localStorage.getItem(`user_status_${userUid || 'default'}`) || "⚡ In WBCHSE Sem 3 Prep Mode";
  });
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState(userStatus);

  const saveStatus = () => {
    if (tempStatus.trim()) {
      setUserStatus(tempStatus.trim());
      localStorage.setItem(`user_status_${userUid || 'default'}`, tempStatus.trim());
    }
    setIsEditingStatus(false);
  };

  // Notification Bell Overlay
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "1", title: "WBCHSE Biology Quiz Ready", time: "10m ago", read: false, type: "quiz" },
    { id: "2", title: "Adarini Bengali Notes Updated", time: "1h ago", read: false, type: "note" },
    { id: "3", title: "12-Day Streak Maintained! 🔥", time: "3h ago", read: true, type: "streak" },
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Dynamic Time Greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Gamification & Progress State
  const [userXP, setUserXP] = useState(3420);
  const [userCoins, setUserCoins] = useState(1250);
  const [userStreak, setUserStreak] = useState(12);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  // Challenge Countdown Timer (42 mins 15s)
  const [timerSeconds, setTimerSeconds] = useState(2535);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCompleteChallenge = () => {
    if (challengeCompleted) return;
    setChallengeCompleted(true);
    setUserXP(prev => prev + 150);
    setUserCoins(prev => prev + 50);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    nativeService.triggerHaptic('success');
    nativeService.showToast("🎉 Daily Challenge Complete! +150 XP & +50 Coins claimed!");
  };

  // Search Command Center Rotating Placeholder
  const searchPlaceholders = [
    "Explain Organic Chemistry...",
    "Generate Notes for Adarini...",
    "Solve Biology MCQs...",
    "Create Flashcards on Genetics...",
    "Translate Bengali to English...",
    "Ask anything for WBCHSE Sem 3..."
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % searchPlaceholders.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [searchPlaceholders.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAction(`search_topic:${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  // Quick Prompt Chips
  const quickPromptChips = [
    { label: "🧬 DNA Replication", query: "Explain DNA Replication & SSB Protein" },
    { label: "📖 Adarini Prose", query: "Summarize Bengali Prose Adarini" },
    { label: "⚡ Mendelian Genetics", query: "Mendel Laws & Linkage MCQs" },
    { label: "📜 Chekhov's The Bet", query: "Theme analysis of The Bet by Chekhov" },
  ];

  // Study Scheduler Interactive Days (Dynamically calculated based on current live date)
  const today = new Date();
  const currentDayOfWeekIndex = today.getDay(); // 0 is Sun
  const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayOfWeekIndex);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const topicSets = [
    ["Biology: Gametogenesis", "Bengali: Adarini"],
    ["Genetics: Mendel Laws", "English: Strong Roots"],
    ["Biology: Microsporogenesis", "Linguistics"],
    ["DNA Replication: SSB", "Chekhov: The Bet"],
    ["Human Reproduction: ZP3", "Bengali: Digbijay"],
    ["Evolution: Oparin-Haldane", "Synge: Riders"],
    ["Weekly Mock Test & Review", "Flashcards"]
  ];

  const scheduleDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - currentDayOfWeekIndex + i);
    const isToday = i === currentDayOfWeekIndex;
    const isPast = i < currentDayOfWeekIndex;
    return {
      day: dayNames[i],
      date: d.getDate().toString(),
      status: isToday ? "active" : (isPast ? "completed" : "upcoming"),
      duration: isToday ? "2h 45m" : (isPast ? "2h 30m" : "Planned 3h"),
      topics: topicSets[i]
    };
  });

  // Learning Analytics State (Weekly vs Monthly)
  const [analyticsView, setAnalyticsView] = useState<"weekly" | "monthly">("weekly");

  const weeklyData = [
    { name: "Sun", hours: 2.2, score: 78 },
    { name: "Mon", hours: 3.0, score: 82 },
    { name: "Tue", hours: 2.8, score: 80 },
    { name: "Wed", hours: 3.2, score: 88 },
    { name: "Thu", hours: 2.75, score: 92 },
    { name: "Fri", hours: 1.5, score: 75 },
    { name: "Sat", hours: 3.5, score: 94 },
  ];

  const monthlyData = [
    { name: "W1", hours: 18.5, score: 80 },
    { name: "W2", hours: 21.0, score: 84 },
    { name: "W3", hours: 19.8, score: 88 },
    { name: "W4", hours: 24.5, score: 92 },
  ];

  // Study Heatmap Data (Last 28 Days)
  const heatmapData = [
    { day: 1, level: 3, label: "2h 10m" }, { day: 2, level: 4, label: "3h 30m" },
    { day: 3, level: 2, label: "1h 45m" }, { day: 4, level: 3, label: "2h 20m" },
    { day: 5, level: 4, label: "4h 00m" }, { day: 6, level: 1, label: "45m" },
    { day: 7, level: 3, label: "2h 30m" }, { day: 8, level: 2, label: "1h 15m" },
    { day: 9, level: 4, label: "3h 45m" }, { day: 10, level: 3, label: "2h 50m" },
    { day: 11, level: 4, label: "4h 10m" }, { day: 12, level: 2, label: "1h 30m" },
    { day: 13, level: 3, label: "2h 15m" }, { day: 14, level: 4, label: "3h 00m" },
    { day: 15, level: 3, label: "2h 45m" }, { day: 16, level: 4, label: "3h 10m" },
    { day: 17, level: 2, label: "1h 20m" }, { day: 18, level: 3, label: "2h 40m" },
    { day: 19, level: 4, label: "3h 50m" }, { day: 20, level: 3, label: "2h 30m" },
    { day: 21, level: 4, label: "4h 00m" }, { day: 22, level: 3, label: "2h 15m" },
    { day: 23, level: 4, label: "3h 00m" }, { day: 24, level: 2, label: "1h 50m" },
    { day: 25, level: 3, label: "2h 45m" }, { day: 26, level: 4, label: "3h 20m" },
    { day: 27, level: 3, label: "2h 55m" }, { day: 28, level: 4, label: "3h 15m" }
  ];

  // Real-time Database & Admin Deck state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [adminStudentsList, setAdminStudentsList] = useState<any[]>([]);
  const [newNotice, setNewNotice] = useState("");

  useEffect(() => {
    try {
      const annRef = collection(db, "announcements");
      const qAnn = query(annRef, limit(10));
      const unsubAnn = onSnapshot(qAnn, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a: any, b: any) => {
          const tA = a.timestamp ? (typeof a.timestamp === "string" ? new Date(a.timestamp).getTime() : a.timestamp.seconds * 1000) : 0;
          const tB = b.timestamp ? (typeof b.timestamp === "string" ? new Date(b.timestamp).getTime() : b.timestamp.seconds * 1000) : 0;
          return tB - tA;
        });
        setAnnouncements(list);
      }, (err) => {
        console.warn("Announcements subscription error:", err);
      });
      return () => unsubAnn();
    } catch (e) {
      console.error("Announcements error", e);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    try {
      const usersRef = collection(db, "users");
      const unsubUsers = onSnapshot(usersRef, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdminStudentsList(list);
      }, (err) => {
        console.warn("Admin students list subscription error:", err);
      });
      return () => unsubUsers();
    } catch (e) {
      console.error("Admin users list error", e);
    }
  }, [isAdmin]);

  // Native Category Filter State
  const [homeCategory, setHomeCategory] = useState<"all" | "modules" | "tools" | "schedule" | "analytics">("all");

  // AI Feature Catalog
  const aiFeatures = [
    { id: "memory_vault", title: "AI Memory Vault", desc: "Account-synced persistent memory", icon: <Brain className="w-5 h-5 text-indigo-600" />, action: "show_memory", tag: "Account Memory" },
    { id: "voice_tutor", title: "Voice Tutor", desc: "Interactive AI voice mentor", icon: <Mic className="w-5 h-5 text-orange-500" />, action: "begin_sync", tag: "Live Audio" },
    { id: "doubt_solver", title: "Doubt Solver", desc: "Instant step-by-step solutions", icon: <Bot className="w-5 h-5 text-indigo-500" />, action: "show_doubt", tag: "AI Solver" },
    { id: "mindmap", title: "Mind Map", desc: "Visual concept trees & maps", icon: <Brain className="w-5 h-5 text-emerald-500" />, action: "show_mindmap", tag: "Visualizer" },
    { id: "flashcards", title: "Flashcard Generator", desc: "Spaced repetition cards", icon: <Zap className="w-5 h-5 text-amber-500" />, action: "show_revision", tag: "Memory" },
    { id: "mock_test", title: "Mock Test AI", desc: "WBCHSE & Entrance MCQs", icon: <Trophy className="w-5 h-5 text-rose-500" />, action: "show_mock", tag: "Exam" },
    { id: "revision", title: "Revision Planner", desc: "Smart spaced study schedule", icon: <Clock className="w-5 h-5 text-sky-500" />, action: "show_revision", tag: "Planner" },
    { id: "question_scanner", title: "Question Scanner", desc: "Scan textbook pages & photos", icon: <Camera className="w-5 h-5 text-purple-500" />, action: "show_scanner", tag: "OCR" },
    { id: "pdf_summary", title: "PDF Summarizer", desc: "Instant chapter summaries", icon: <FileText className="w-5 h-5 text-blue-500" />, action: "show_resources", tag: "PDF AI" },
    { id: "math_solver", title: "Formula Generator", desc: "Maths & Physics equations", icon: <Calculator className="w-5 h-5 text-teal-500" />, action: "show_math", tag: "Math" },
    { id: "mistake_bank", title: "Homework Solver", desc: "Target weak areas & errors", icon: <ShieldAlert className="w-5 h-5 text-red-500" />, action: "show_mistakes", tag: "Fix Errors" },
    { id: "syllabus", title: "Roadmap Generator", desc: "Class 12 Semester 3 syllabus", icon: <Compass className="w-5 h-5 text-emerald-600" />, action: "show_syllabus", tag: "Syllabus" },
    { id: "speedblitz", title: "Speed Blitz", desc: "Rapid fire MCQ practice", icon: <Flame className="w-5 h-5 text-orange-600" />, action: "show_speedblitz", tag: "Quiz" },
  ];

  // Recommended Features State
  const [recommendedFeatures, setRecommendedFeatures] = useState([
    {
      id: "3d_bio_diagrams",
      title: "🧬 3D Biology Diagram & Microscopic Inspector",
      desc: "Interactive 3D cell & anatomical models for Microsporogenesis, Megasporogenesis, DNA Replication Forks & Acrosome Sperm Structure (WBCHSE Unit I & II).",
      votes: 42,
      voted: false,
      status: "Pro Prototype Ready",
      action: "show_visualizer",
      tag: "Biology"
    },
    {
      id: "bengali_audio_prose",
      title: "🎧 Bengali & English AI Audio Narrator",
      desc: "Listen to HD Bengali narration for 'Adarini' (Jayram Mokhtar & elephant), 'Strong Roots' (Kalam), and 'The Bet' (Chekhov 2M rubles wager) with synchronized text.",
      votes: 38,
      voted: false,
      status: "In Progress",
      action: "begin_sync",
      tag: "Prose & Verse"
    },
    {
      id: "viva_voice_examiner",
      title: "🎙️ WBCHSE AI Oral Viva Examiner",
      desc: "Simulated Bengali/English voice viva exam with instant scoring, feedback, and model answers for Class 12 Sem 3.",
      votes: 31,
      voted: false,
      status: "Proposed",
      action: "show_doubt",
      tag: "Viva AI"
    },
    {
      id: "sem3_score_predictor",
      title: "📈 WBCHSE Sem 3 Target Score Predictor",
      desc: "AI analytics calculating projected MCQ marks based on past Speed Blitz tests, Mistake Bank reviews, and syllabus coverage.",
      votes: 29,
      voted: false,
      status: "Pro Prototype Ready",
      action: "show_analytics",
      tag: "Analytics"
    },
    {
      id: "offline_pwa_sync",
      title: "📱 Offline Study Vault & Speed Sync",
      desc: "Download flashcards, mock tests, and revision notes to practice without an active internet connection.",
      votes: 25,
      voted: false,
      status: "Proposed",
      action: "show_revision",
      tag: "Mobile Sync"
    }
  ]);

  const [showFeatureProposalModal, setShowFeatureProposalModal] = useState(false);
  const [newFeatureTitle, setNewFeatureTitle] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");

  const handleVote = (id: string) => {
    setRecommendedFeatures(prev => prev.map(f => {
      if (f.id === id) {
        const newVoted = !f.voted;
        const newVotes = newVoted ? f.votes + 1 : f.votes - 1;
        nativeService.showToast(newVoted ? "Upvoted feature recommendation!" : "Vote removed");
        return { ...f, voted: newVoted, votes: newVotes };
      }
      return f;
    }));
  };

  const handleAddFeatureProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureTitle.trim()) return;

    const newFeat = {
      id: `custom_${Date.now()}`,
      title: newFeatureTitle.trim(),
      desc: newFeatureDesc.trim() || "User suggested feature for WBCHSE Class 12.",
      votes: 1,
      voted: true,
      status: "Proposed",
      action: "show_doubt",
      tag: "Community"
    };

    setRecommendedFeatures(prev => [newFeat, ...prev]);
    setNewFeatureTitle("");
    setNewFeatureDesc("");
    setShowFeatureProposalModal(false);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    nativeService.showToast("Feature suggestion submitted!");

    try {
      await addDoc(collection(db, "feature_proposals"), {
        title: newFeat.title,
        desc: newFeat.desc,
        student: userName,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Feature proposal save error:", e);
    }
  };

  // Badges Data
  const badgesList = [
    { title: "Genetics Master", desc: "Scored 90%+ in Mendel Laws", icon: "🧬", unlocked: true },
    { title: "Streak Flame", desc: "Maintained a 10-day study streak", icon: "🔥", unlocked: true },
    { title: "Bengali Scholar", desc: "Mastered Adarini & Potraj prose", icon: "📚", unlocked: true },
    { title: "Night Owl", desc: "Completed 5 late-night revision sessions", icon: "🦉", unlocked: false },
    { title: "Math Wizard", desc: "Solved 50 calculus equations", icon: "📐", unlocked: false },
  ];

  return (
    <div className={`flex-1 min-h-0 h-full w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-[120px] overflow-y-auto overscroll-contain touch-pan-y space-y-4 sm:space-y-6 transition-colors duration-300 relative scrollbar-none will-change-transform transform-gpu translate-z-0 ${
      isDarkMode ? "bg-[#0A0908] text-stone-100" : "bg-[#FAF8F5] text-[#2D2623]"
    }`}>

      {/* Ambient Background Accents */}
      <div className="hidden md:block absolute top-0 left-1/4 w-96 h-96 bg-[#FF7A30]/5 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="hidden md:block absolute top-1/3 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* ----------------- COMPACT NATIVE HEADER ----------------- */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative">
        <div className="space-y-2 flex-1 min-w-0">
          
          {/* Horizontal Scrolling Sub-Row Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1 text-xs whitespace-nowrap">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border shrink-0 ${
                isDarkMode 
                  ? "bg-[#FF7A30]/15 border-[#FF7A30]/30 text-[#FF7A30]" 
                  : "bg-[#FFF5EC] border-[#FFD9C0] text-[#FF7A30] shadow-xs"
              }`}
            >
              <Sparkles size={13} className="animate-spin-slow" />
              <span>Smart AI Mentor Active</span>
            </motion.div>

            {/* Weather, Live Calendar Date & Time */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold border shrink-0 ${
              isDarkMode ? "bg-stone-900 border-stone-800 text-stone-300" : "bg-white border-stone-200 text-stone-700 shadow-xs"
            }`}>
              <CloudSun size={13} className="text-amber-500" />
              <span>28°C Kolkata</span>
              <span className="opacity-40">•</span>
              <Calendar size={13} className="text-[#FF7A30]" />
              <span className="font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="opacity-40">•</span>
              <Clock size={13} className="text-[#FF7A30]" />
              <span className="font-mono font-bold">{currentTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Editable Status Badge */}
            <div className="relative shrink-0">
              {!isEditingStatus ? (
                <button 
                  onClick={() => { setTempStatus(userStatus); setIsEditingStatus(true); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border transition-all ${
                    isDarkMode 
                      ? "bg-stone-900 border-stone-800 text-stone-300 hover:border-[#FF7A30]" 
                      : "bg-white border-stone-200 text-stone-700 hover:border-[#FF7A30] shadow-xs"
                  }`}
                >
                  <span className="truncate max-w-[150px]">{userStatus}</span>
                  <Edit2 size={11} className="opacity-60" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 border border-[#FF7A30] rounded-full px-3 py-0.5 shadow-md">
                  <input 
                    type="text" 
                    value={tempStatus} 
                    onChange={(e) => setTempStatus(e.target.value)}
                    className="text-xs bg-transparent outline-none font-semibold text-[#2D2623] dark:text-stone-100 w-36"
                    placeholder="Enter status..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveStatus()}
                  />
                  <button onClick={saveStatus} className="text-xs text-[#FF7A30] font-bold hover:underline">
                    Save
                  </button>
                  <button onClick={() => setIsEditingStatus(false)} className="text-xs text-stone-400 hover:text-stone-600">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Compact Dynamic Greeting */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2 mt-1"
              >
                <span className="text-orange-500 animate-bounce">🔥</span>
                <span>{getTimeGreeting()},</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A30] via-orange-500 to-amber-500">
                  {userName}
                </span>
              </motion.h1>

              {/* Motivational Quote Carousel (Hidden on narrow mobile screens <480px to save space) */}
              <motion.div 
                key={quoteIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden sm:flex text-xs font-semibold text-stone-500 dark:text-stone-400 italic items-center gap-1.5 pt-0.5"
              >
                <Sparkle size={13} className="text-[#FF7A30] shrink-0" />
                <span>{motivationalQuotes[quoteIdx]}</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Header Controls & Profile */}
        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
          
          {/* Animated Circular Progress Ring for Today's Goal */}
          <div className={`p-2 sm:p-2.5 rounded-2xl border flex items-center gap-2.5 ${
            isDarkMode ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200/90 shadow-xs"
          }`}>
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg className="w-9 h-9 transform -rotate-90">
                <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" className="text-stone-200 dark:text-stone-800" fill="transparent" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="14" 
                  stroke="#FF7A30" 
                  strokeWidth="3" 
                  strokeDasharray={88}
                  strokeDashoffset={88 - (88 * 0.85)} 
                  strokeLinecap="round"
                  fill="transparent" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[8px] font-black text-[#FF7A30]">85%</span>
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 block">Today's Goal</span>
              <span className="text-xs font-black">2h 45m / 3h</span>
            </div>
          </div>

          {/* Admin Build Docs & Exporter Button */}
          {isAdmin && onOpenBuildDocs && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenBuildDocs}
              className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl border transition-all flex items-center gap-2 ${
                isDarkMode 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                  : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 shadow-xs"
              }`}
              title="Open Admin Build Documentation & Exporter"
            >
              <FileText size={16} className="text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider hidden xl:inline">Build Specs</span>
            </motion.button>
          )}

          {/* Theme Toggle Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
              isDarkMode 
                ? "bg-stone-900 border-stone-800 text-amber-400 hover:border-amber-400/50" 
                : "bg-white border-stone-200 text-stone-700 hover:border-[#FF7A30] shadow-xs"
            }`}
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          {/* Notification Bell */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 sm:p-3 rounded-2xl border relative transition-all ${
                isDarkMode 
                  ? "bg-stone-900 border-stone-800 text-stone-300 hover:border-[#FF7A30]" 
                  : "bg-white border-stone-200 text-stone-700 hover:border-[#FF7A30] shadow-xs"
              }`}
            >
              <Bell size={16} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF7A30] animate-ping" />
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute right-0 mt-3 w-80 rounded-3xl p-4 shadow-2xl border z-50 ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-stone-100" : "bg-white border-stone-200 text-[#2D2623]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                    <h4 className="font-extrabold text-sm flex items-center gap-2">
                      <Bell size={15} className="text-[#FF7A30]" /> Notifications
                    </h4>
                    <button onClick={markAllRead} className="text-[10px] font-bold text-[#FF7A30] hover:underline">
                      Mark all read
                    </button>
                  </div>

                  <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n, idx) => (
                      <div key={`notif-${n.id}-${idx}`} className={`p-2.5 rounded-2xl text-xs flex items-start gap-2.5 transition-colors ${
                        !n.read 
                          ? (isDarkMode ? "bg-stone-800 border border-stone-700" : "bg-[#FFF5EC] border border-[#FFD9C0]") 
                          : (isDarkMode ? "bg-stone-900/50" : "bg-stone-50")
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-[#FF7A30] mt-1 shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold">{n.title}</p>
                          <span className="text-[10px] opacity-60">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Avatar */}
          {userPhoto ? (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={onLogout}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden border-2 border-[#FF7A30] cursor-pointer group relative shadow-xs bg-white p-0.5"
            >
              <img src={userPhoto} alt={userName} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <LogOut size={14} className="text-white drop-shadow-md" />
              </div>
            </motion.div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogin}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center font-bold transition-all ${
                isDarkMode 
                  ? "bg-stone-900 border-stone-800 text-[#FF7A30]" 
                  : "bg-white border-stone-200 text-[#FF7A30] shadow-xs"
              }`}
            >
              <LogIn size={16} />
            </motion.button>
          )}
        </div>
      </header>

      {/* Official Bulletin Notice Bar */}
      {announcements.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-4 flex items-center gap-4 border relative overflow-hidden backdrop-blur-md ${
            isDarkMode 
              ? "bg-[#FF7A30]/10 border-[#FF7A30]/20 text-stone-200" 
              : "bg-gradient-to-r from-[#FFF5EC] via-white to-orange-50/50 border-[#FFD9C0] text-[#2D2623] shadow-[0_8px_25px_rgba(0,0,0,0.02)]"
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FF7A30] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#FF7A30]/20">
            <Megaphone size={18} className="animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase text-[#FF7A30] tracking-widest block">
              Official Bulletin
            </span>
            <p className="text-xs sm:text-sm font-bold truncate">
              {announcements[0].text}
            </p>
          </div>
        </motion.div>
      )}

      {/* ----------------- NATIVE APP CATEGORY SEGMENT PILLS ----------------- */}
      <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1 sticky top-0 z-30 backdrop-blur-xl">
        {[
          { id: "all", label: "🏠 Overview" },
          { id: "modules", label: "📚 WBCHSE Modules" },
          { id: "tools", label: "⚡ AI Tools" },
          { id: "schedule", label: "🗓️ Timetable" },
          { id: "analytics", label: "📊 Analytics" },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setHomeCategory(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
              homeCategory === tab.id
                ? "bg-[#FF7A30] text-white border-[#FF7A30] shadow-md shadow-[#FF7A30]/30 scale-[1.02]"
                : isDarkMode
                ? "bg-stone-900/90 text-stone-300 border-stone-800 hover:border-stone-700"
                : "bg-white/90 text-stone-700 border-stone-200/90 hover:border-stone-300 shadow-xs"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </nav>

      {/* ----------------- CONTINUE LEARNING HERO CARD ----------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 sm:p-6 rounded-[2.2rem] border relative overflow-hidden backdrop-blur-xl transition-all shadow-md ${
          isDarkMode
            ? "bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border-stone-800"
            : "bg-gradient-to-r from-orange-500 via-amber-500 to-[#FF7A30] text-white border-orange-400 shadow-[0_12px_35px_rgba(255,122,48,0.25)]"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                isDarkMode ? "bg-[#FF7A30]/20 text-[#FF7A30]" : "bg-white/20 text-white backdrop-blur-md"
              }`}>
                ⚡ Active WBCHSE Sem 3 Session
              </span>
              <span className="text-xs font-mono font-bold opacity-80">Biology • Unit 1</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Sexual Reproduction in Flowering Plants (Microsporogenesis)
            </h2>
            <p className={`text-xs font-medium line-clamp-1 ${isDarkMode ? "text-stone-400" : "text-white/90"}`}>
              Next Up: Tap to solve 10 interactive MCQs on Pollination types (Geitonogamy & Xenogamy).
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction("show_speedblitz")}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-lg transition-all ${
              isDarkMode
                ? "bg-[#FF7A30] hover:bg-orange-600 text-white shadow-[#FF7A30]/30"
                : "bg-white text-[#2D2623] hover:bg-amber-50 shadow-black/10"
            }`}
          >
            <Play size={15} fill="currentColor" />
            <span>Resume Practice</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ----------------- AI METRICS HERO TILES ----------------- */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "Today's Study Time", value: "2h 45m", sub: "Goal: 3h 00m", icon: <Clock size={20} className="text-[#FF7A30]" />, color: "border-[#FF7A30]/30" },
          { label: "Remaining Goal", value: "15 Mins", sub: "1 Session left", icon: <Target size={20} className="text-amber-500" />, color: "border-amber-500/30" },
          { label: "Focus Score", value: "94%", sub: "Peak Efficiency", icon: <Activity size={20} className="text-emerald-500" />, color: "border-emerald-500/30" },
          { label: "XP & Coins", value: `${userXP} XP`, sub: `${userCoins} Coins 🪙`, icon: <Trophy size={20} className="text-yellow-500" />, color: "border-yellow-500/30" },
          { label: "Weekly Streak", value: `${userStreak} Days`, sub: "Keep it up! 🔥", icon: <Flame size={20} className="text-orange-500" />, color: "border-orange-500/30" },
          { label: "Exam Countdown", value: "48 Days", sub: "WBCHSE Sem 3", icon: <GraduationCap size={20} className="text-indigo-500" />, color: "border-indigo-500/30" },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={`p-4.5 rounded-[1.75rem] border backdrop-blur-xl flex flex-col justify-between transition-all ${
              isDarkMode 
                ? `bg-stone-900/80 ${item.color} hover:border-[#FF7A30]` 
                : "bg-white border-stone-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-[#FF7A30]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold opacity-70 uppercase tracking-wider">{item.label}</span>
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800">{item.icon}</div>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">{item.value}</h3>
              <p className="text-[11px] font-semibold text-[#FF7A30] mt-0.5">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ----------------- RAYCAST-STYLE SEARCH & PROMPT CHIPS ----------------- */}
      {(homeCategory === "all" || homeCategory === "tools") && (
      <section className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className={`flex items-center gap-3 p-2.5 pl-5 rounded-[1.75rem] border backdrop-blur-2xl transition-all shadow-md ${
            isDarkMode 
              ? "bg-stone-900/90 border-stone-800 focus-within:border-[#FF7A30] focus-within:ring-2 focus-within:ring-[#FF7A30]/20" 
              : "bg-white border-stone-200/90 focus-within:border-[#FF7A30] focus-within:ring-2 focus-within:ring-[#FF7A30]/20 shadow-[0_12px_35px_rgba(0,0,0,0.04)]"
          }`}>
            <Search className="w-5 h-5 text-[#FF7A30] shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Ask anything... e.g. "${searchPlaceholders[placeholderIndex]}"`}
              className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-stone-400"
            />
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Voice Button */}
              <motion.button 
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction('begin_sync')}
                className="p-2.5 rounded-2xl bg-[#FFF5EC] dark:bg-stone-800 text-[#FF7A30] font-bold text-xs flex items-center gap-1.5 hover:bg-[#FF7A30] hover:text-white transition-all"
                title="Voice Search Mentor"
              >
                <Mic size={16} />
                <span className="hidden sm:inline">Voice AI</span>
              </motion.button>

              {/* Camera Scan Button */}
              <motion.button 
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction('show_scanner')}
                className="p-2.5 rounded-2xl bg-[#FF7A30] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#FF7A30]/25 active:scale-95"
                title="Scan Question / Page"
              >
                <Camera size={16} />
                <span className="hidden sm:inline">Scan</span>
              </motion.button>
            </div>
          </div>
        </form>

        {/* Quick Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 shrink-0 flex items-center gap-1">
            <Command size={12} /> Suggested:
          </span>
          {quickPromptChips.map((chip, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction(`search_topic:${chip.query}`)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                isDarkMode 
                  ? "bg-stone-900/80 border-stone-800 text-stone-300 hover:border-[#FF7A30] hover:text-[#FF7A30]" 
                  : "bg-white/90 border-stone-200 text-stone-700 hover:border-[#FF7A30] hover:text-[#FF7A30] shadow-xs"
              }`}
            >
              {chip.label}
            </motion.button>
          ))}
        </div>
      </section>
      )}

      {/* ----------------- STUDY HEATMAP MATRIX & TIMELINE ----------------- */}
      {(homeCategory === "all" || homeCategory === "schedule" || homeCategory === "analytics") && (
      <section className={`p-6 rounded-[2rem] border backdrop-blur-xl space-y-4 ${
        isDarkMode ? "bg-stone-900/80 border-stone-800" : "bg-white border-stone-200/80 shadow-[0_12px_35px_rgba(0,0,0,0.03)]"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF7A30]" /> 30-Day Study Heatmap & Consistency
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Daily study intensity & commitment matrix</p>
          </div>
          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
            🔥 96% Active Consistency
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-2 pt-2">
          {heatmapData.map((item) => {
            const bgClass = 
              item.level === 4 ? "bg-[#FF7A30]" :
              item.level === 3 ? "bg-orange-400" :
              item.level === 2 ? "bg-amber-300" : "bg-stone-200 dark:bg-stone-800";
            return (
              <motion.div
                key={item.day}
                whileHover={{ scale: 1.25, zIndex: 10 }}
                className={`h-8 rounded-lg ${bgClass} cursor-pointer relative group transition-all`}
              >
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-stone-900 text-white text-[10px] font-extrabold px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none shadow-lg">
                  <span>Day {item.day}: {item.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
          <span>Less Study</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-stone-200 dark:bg-stone-800" />
            <span className="w-3 h-3 rounded bg-amber-300" />
            <span className="w-3 h-3 rounded bg-orange-400" />
            <span className="w-3 h-3 rounded bg-[#FF7A30]" />
          </div>
          <span>Peak Focus (4h+)</span>
        </div>
      </section>
      )}

      {/* ----------------- STUDY SCHEDULER & DAILY CHALLENGE ----------------- */}
      {(homeCategory === "all" || homeCategory === "schedule") && (
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Study Scheduler (7 Columns) */}
        <div className={`lg:col-span-7 p-6 rounded-[2rem] border backdrop-blur-xl space-y-5 ${
          isDarkMode ? "bg-stone-900/80 border-stone-800" : "bg-white border-stone-200/80 shadow-[0_12px_35px_rgba(0,0,0,0.03)]"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FF7A30]" /> Study Scheduler
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Class 12 Semester 3 Prep Timetable</p>
            </div>
            <span className="text-xs font-bold text-[#FF7A30] bg-[#FFF5EC] dark:bg-stone-800 px-3 py-1 rounded-full">
              July 2026
            </span>
          </div>

          {/* Days Interactive Pill Strip */}
          <div className="grid grid-cols-7 gap-2">
            {scheduleDays.map((d, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                    isSelected 
                      ? "bg-[#FF7A30] border-[#FF7A30] text-white shadow-lg shadow-[#FF7A30]/30" 
                      : d.status === "completed" 
                      ? (isDarkMode ? "bg-stone-800/80 border-stone-700 text-stone-300" : "bg-stone-50 border-stone-200 text-stone-700") 
                      : (isDarkMode ? "bg-stone-900 border-stone-800 text-stone-500" : "bg-white border-stone-100 text-stone-400")
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase opacity-80">{d.day}</span>
                  <span className="text-base font-black my-0.5">{d.date}</span>
                  {d.status === "completed" && !isSelected && (
                    <CheckCircle2 size={12} className="text-emerald-500 mt-1" />
                  )}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-1"></span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected Day Schedule Details */}
          <motion.div 
            key={selectedDayIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDarkMode ? "bg-stone-800/50 border-stone-700" : "bg-[#FFF5EC]/60 border-[#FFD9C0]"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#FF7A30]">
                  {scheduleDays[selectedDayIndex].day} {scheduleDays[selectedDayIndex].date} Schedule
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
                  {scheduleDays[selectedDayIndex].duration}
                </span>
              </div>
              <ul className="text-xs font-bold space-y-1 pt-1">
                {scheduleDays[selectedDayIndex].topics.map((topic, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                    <CheckCircle2 size={13} className="text-[#FF7A30] shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction('begin_sync')}
              className="px-4 py-2.5 rounded-xl bg-[#FF7A30] text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-[#FF7A30]/20 shrink-0"
            >
              <Play size={14} fill="currentColor" /> Start Prep Session
            </motion.button>
          </motion.div>
        </div>

        {/* Daily Challenge Card (5 Columns) */}
        <div className={`lg:col-span-5 p-6 rounded-[2rem] border backdrop-blur-xl flex flex-col justify-between space-y-4 relative overflow-hidden ${
          isDarkMode ? "bg-stone-900/80 border-stone-800" : "bg-gradient-to-br from-[#FFF5EC] via-white to-orange-50/40 border-[#FFD9C0] shadow-[0_12px_35px_rgba(0,0,0,0.03)]"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A30] bg-[#FF7A30]/10 px-3 py-1 rounded-full">
              Daily Challenge
            </span>
            <span className="text-xs font-mono font-bold text-stone-500 flex items-center gap-1">
              <Clock size={13} className="text-[#FF7A30]" /> {formatTimer(timerSeconds)}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black tracking-tight text-[#2D2623] dark:text-stone-100 mb-1">
              Human Reproduction & ZP3 Receptor MCQs
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
              Achieve 85%+ in Mendel Genetics and Human Fertilization mock test to claim your daily rewards!
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold">
              <span>Challenge Progress</span>
              <span className="text-[#FF7A30]">{challengeCompleted ? "100%" : "80%"}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden p-0.5">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: challengeCompleted ? "100%" : "80%" }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-[#FF7A30] to-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold">
                +150 XP
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-extrabold">
                +50 Coins 🪙
              </span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCompleteChallenge}
              disabled={challengeCompleted}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all ${
                challengeCompleted 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20 cursor-default" 
                  : "bg-[#FF7A30] hover:bg-orange-600 text-white shadow-[#FF7A30]/30"
              }`}
            >
              {challengeCompleted ? (
                <>
                  <Check size={16} /> Completed
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Complete Challenge
                </>
              )}
            </motion.button>
          </div>
        </div>
      </section>
      )}

      {/* ----------------- LEARNING ANALYTICS ----------------- */}
      {(homeCategory === "all" || homeCategory === "analytics") && (
      <section className={`p-6 rounded-[2rem] border backdrop-blur-xl space-y-6 ${
        isDarkMode ? "bg-stone-900/80 border-stone-800" : "bg-white border-stone-200/80 shadow-[0_12px_35px_rgba(0,0,0,0.03)]"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#FF7A30]" /> Learning Analytics & Mastery
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Real-time study performance & topic accuracy</p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl w-fit">
            <button 
              onClick={() => setAnalyticsView("weekly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                analyticsView === "weekly" ? "bg-white dark:bg-stone-900 text-[#FF7A30] shadow-xs" : "text-stone-500"
              }`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setAnalyticsView("monthly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                analyticsView === "monthly" ? "bg-white dark:bg-stone-900 text-[#FF7A30] shadow-xs" : "text-stone-500"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Chart View (8 Columns) */}
          <div className="lg:col-span-8 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsView === "weekly" ? weeklyData : monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke={isDarkMode ? "#78716c" : "#a8a29e"} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? "#78716c" : "#a8a29e"} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? "#1c1917" : "#ffffff", 
                    borderColor: "#FF7A30", 
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }} 
                />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                  {(analyticsView === "weekly" ? weeklyData : monthlyData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? "#FF7A30" : (isDarkMode ? "#382e2b" : "#FFD9C0")} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics Breakdown (4 Columns) */}
          <div className="lg:col-span-4 space-y-3">
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDarkMode ? "bg-stone-800/60 border-stone-700" : "bg-[#FFF5EC] border-[#FFD9C0]"
            }`}>
              <span className="text-xs font-bold">Total Focus Time</span>
              <span className="text-sm font-black text-[#FF7A30]">18.5 Hours</span>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDarkMode ? "bg-stone-800/60 border-stone-700" : "bg-stone-50 border-stone-200"
            }`}>
              <span className="text-xs font-bold">Average Mock Test Score</span>
              <span className="text-sm font-black text-emerald-500">86% Accuracy</span>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDarkMode ? "bg-stone-800/60 border-stone-700" : "bg-stone-50 border-stone-200"
            }`}>
              <span className="text-xs font-bold">Syllabus Completion</span>
              <span className="text-sm font-black text-indigo-500">92% Covered</span>
            </div>

            {/* AI Suggestion Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF7A30]/10 to-amber-500/10 border border-[#FF7A30]/20 text-xs font-medium space-y-1">
              <span className="font-extrabold text-[#FF7A30] flex items-center gap-1 uppercase tracking-wider text-[10px]">
                <Lightbulb size={12} /> AI Insight
              </span>
              <p className="text-stone-700 dark:text-stone-300 font-semibold">
                Practice 5 MCQs on Bengali Prose "Adarini" to boost your overall accuracy to 95%!
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ----------------- PREPPING HUB MODULE CARDS ----------------- */}
      {(homeCategory === "all" || homeCategory === "modules" || homeCategory === "tools") && (
      <section className="space-y-4">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#FF7A30]" /> Prepping Hub Modules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Note Scanner", desc: "Photo to MCQs & Notes", icon: <Camera className="w-6 h-6 text-orange-500" />, action: "show_scanner" },
            { title: "Doubt Solver", desc: "Bengali & English Qs", icon: <Bot className="w-6 h-6 text-indigo-500" />, action: "show_doubt" },
            { title: "Concept Map", desc: "Interactive Graphs", icon: <Brain className="w-6 h-6 text-emerald-500" />, action: "show_mindmap" },
            { title: "Active Sync", desc: "Connect Voice Live Now", icon: <Zap className="w-6 h-6 text-amber-500" />, action: "begin_sync" },
          ].map((m, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAction(m.action)}
              className={`p-5 rounded-[2rem] border backdrop-blur-xl cursor-pointer flex items-center justify-between group transition-all shadow-xs ${
                isDarkMode 
                  ? "bg-stone-900/80 border-stone-800 hover:border-[#FF7A30]" 
                  : "bg-white border-stone-200/80 hover:border-[#FF7A30] shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[#FFF5EC] dark:bg-stone-800">
                  {m.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm group-hover:text-[#FF7A30] transition-colors">{m.title}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{m.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          ))}
        </div>
      </section>
      )}

      {/* ----------------- AI FEATURES & TOOLS CATALOG ----------------- */}
      {(homeCategory === "all" || homeCategory === "tools" || homeCategory === "modules") && (
      <section className="space-y-4">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF7A30]" /> AI Features Suite
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {aiFeatures.map((feat, idx) => (
            <motion.div 
              key={`aifeat-${feat.id}-${idx}`}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction(feat.action)}
              className={`p-4 rounded-3xl border backdrop-blur-xl cursor-pointer space-y-2 group transition-all shadow-xs ${
                isDarkMode 
                  ? "bg-stone-900/70 border-stone-800 hover:border-[#FF7A30]" 
                  : "bg-white border-stone-200/80 hover:border-[#FF7A30] shadow-[0_8px_25px_rgba(0,0,0,0.02)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-[#FFF5EC] dark:bg-stone-800">
                  {feat.icon}
                </div>
                <span className="text-[9px] font-black uppercase text-[#FF7A30] bg-[#FF7A30]/10 px-2 py-0.5 rounded-full">
                  {feat.tag}
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm group-hover:text-[#FF7A30] transition-colors">{feat.title}</h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium line-clamp-1">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      )}

      {/* ----------------- GAMIFICATION & BADGES ----------------- */}
      <section className={`p-6 rounded-[2rem] border backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
        isDarkMode ? "bg-stone-900/80 border-stone-800" : "bg-gradient-to-r from-[#FFF5EC] to-amber-50/50 border-[#FFD9C0]"
      }`}>
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A30]">
            Gamification & Badges
          </span>
          <h3 className="text-xl font-black tracking-tight">Your Achievements & Rewards</h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
            Unlocked 3/5 badges. Complete daily challenges to climb the Leaderboard!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBadgesModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-extrabold text-xs flex items-center gap-2 shadow-xs"
          >
            <Award size={16} className="text-amber-500" /> View Badges
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction('show_leaderboard')}
            className="px-5 py-2.5 rounded-xl bg-[#FF7A30] text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-[#FF7A30]/30"
          >
            <Trophy size={16} /> Leaderboard
          </motion.button>
        </div>
      </section>

      {/* ----------------- RECOMMENDED FEATURES & APP UPDATES ROADMAP ----------------- */}
      <section className={`p-5 sm:p-6 rounded-[2.2rem] border backdrop-blur-xl space-y-5 transition-all shadow-md ${
        isDarkMode 
          ? "bg-stone-900/90 border-stone-800" 
          : "bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF0E5] border-[#FFD9C0]"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A30] bg-[#FF7A30]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Rocket size={12} /> App Updates & Roadmap
              </span>
              <span className="text-xs font-bold text-stone-400">Class 12 Sem 3 Focus</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Recommended Feature Upgrades
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Vote on upcoming study tools or propose your own custom feature for WBCHSE Semester 3!
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFeatureProposalModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#FF7A30] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-[#FF7A30]/30 shrink-0 self-start sm:self-center"
          >
            <Plus size={16} /> Propose Feature
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {recommendedFeatures.map((item, idx) => (
            <motion.div
              key={`recfeat-${item.id}-${idx}`}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-3xl border flex flex-col justify-between gap-3 transition-all ${
                isDarkMode 
                  ? "bg-stone-950/60 border-stone-800 hover:border-[#FF7A30]/60" 
                  : "bg-white border-stone-200/80 shadow-xs hover:border-[#FF7A30]"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FF7A30]/10 text-[#FF7A30]">
                    {item.tag}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === "Pro Prototype Ready"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : item.status === "In Progress"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-stone-200 dark:bg-stone-800 text-stone-500"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm sm:text-base leading-snug">{item.title}</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 dark:border-stone-800/80">
                <button
                  onClick={() => handleVote(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    item.voted
                      ? "bg-[#FF7A30] text-white shadow-xs"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#FF7A30]/10 hover:text-[#FF7A30]"
                  }`}
                >
                  <ThumbsUp size={13} className={item.voted ? "fill-current" : ""} />
                  <span>{item.votes} Votes</span>
                </button>

                <button
                  onClick={() => onAction(item.action)}
                  className="text-xs font-extrabold text-[#FF7A30] hover:underline flex items-center gap-1"
                >
                  <span>Try Feature</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Admin Control Deck (Only visible to Admin users) */}
      {isAdmin && (
        <section className={`p-6 rounded-[2rem] border backdrop-blur-xl space-y-4 ${
          isDarkMode ? "bg-stone-900/90 border-stone-800 text-stone-100" : "bg-stone-900 text-white"
        }`}>
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-[#FF7A30]">
              <ShieldAlert size={18} /> Admin Control Deck
            </h3>
            <span className="text-xs font-bold bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full">
              System Admin Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">Post Bulletin Notice</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newNotice} 
                  onChange={(e) => setNewNotice(e.target.value)}
                  placeholder="Type official notice..." 
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF7A30]"
                />
                <button 
                  onClick={async () => {
                    if (!newNotice.trim()) return;
                    await addDoc(collection(db, "announcements"), {
                      text: newNotice.trim(),
                      timestamp: new Date().toISOString(),
                      author: userName
                    });
                    setNewNotice("");
                    nativeService.showToast("Notice posted!");
                  }}
                  className="px-4 py-2 bg-[#FF7A30] text-white font-bold text-xs rounded-xl hover:bg-orange-600 shrink-0"
                >
                  Post
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">System Stats</h4>
              <p className="text-xs opacity-80 font-mono">Total Registered Students: {adminStudentsList.length || "12"}</p>
            </div>
          </div>
        </section>
      )}

      {/* Badges Modal */}
      <AnimatePresence>
        {showBadgesModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
                isDarkMode ? "bg-stone-900 border-stone-800 text-stone-100" : "bg-white border-stone-200 text-[#2D2623]"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Award className="text-amber-500" /> Achievement Badges
                </h3>
                <button onClick={() => setShowBadgesModal(false)} className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
                  <X size={18} />
                </button>
              </div>

              <div className="py-4 space-y-3">
                {badgesList.map((b, i) => (
                  <div key={i} className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    b.unlocked 
                      ? (isDarkMode ? "bg-stone-800/80 border-amber-500/30" : "bg-[#FFF5EC] border-[#FFD9C0]") 
                      : "opacity-50 grayscale bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                  }`}>
                    <span className="text-2xl">{b.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-sm">{b.title}</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{b.desc}</p>
                    </div>
                    {b.unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feature Proposal Modal */}
      <AnimatePresence>
        {showFeatureProposalModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
                isDarkMode ? "bg-stone-900 border-stone-800 text-stone-100" : "bg-white border-stone-200 text-[#2D2623]"
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Rocket className="text-[#FF7A30]" /> Propose Feature / Update
                </h3>
                <button onClick={() => setShowFeatureProposalModal(false)} className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddFeatureProposal} className="py-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Feature Title</label>
                  <input
                    type="text"
                    required
                    value={newFeatureTitle}
                    onChange={(e) => setNewFeatureTitle(e.target.value)}
                    placeholder="e.g. WBCHSE Physics Numericals AI Solver"
                    className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#FF7A30]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Description / Details</label>
                  <textarea
                    rows={3}
                    value={newFeatureDesc}
                    onChange={(e) => setNewFeatureDesc(e.target.value)}
                    placeholder="Describe how this feature would help WBCHSE Class 12 Sem 3 exam prep..."
                    className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#FF7A30] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeatureProposalModal(false)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-[#FF7A30] text-white text-xs font-black hover:bg-orange-600 shadow-md shadow-[#FF7A30]/30"
                  >
                    Submit Proposal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- NATIVE BOTTOM NAVIGATION DOCK ----------------- */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] z-[1000] px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none flex items-center justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`w-full max-w-md h-14 rounded-full border flex items-center justify-between px-5 pointer-events-auto shadow-2xl transition-all ${
            isDarkMode
              ? "bg-stone-900/95 border-stone-800 text-stone-200"
              : "bg-white/95 border-stone-200/90 text-stone-800 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          }`}
        >
          {/* Left: HOME */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setHomeCategory("all")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
              homeCategory === "all" ? "text-[#FF7A30] font-black" : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            }`}
            title="Home Dashboard"
          >
            <Layout size={18} />
            <span className="text-[9px] font-bold uppercase tracking-wider">HOME</span>
          </motion.button>

          {/* Left-Sub: SCAN */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onAction("show_scanner")}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-stone-400 hover:text-purple-600 transition-all"
            title="Scan Problem"
          >
            <Camera size={18} />
            <span className="text-[9px] font-bold uppercase tracking-wider">SCAN</span>
          </motion.button>

          {/* Center Elevated Floating Button: MENTOR */}
          <div className="relative -top-4">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onAction("begin_sync")}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF7A30] via-orange-500 to-amber-500 text-white shadow-xl shadow-[#FF7A30]/40 flex flex-col items-center justify-center border-4 border-white dark:border-stone-900 transition-all group"
              title="Activate AI Voice Mentor"
            >
              <Mic size={22} className="animate-pulse group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase tracking-tighter -mt-0.5">MENTOR</span>
            </motion.button>
          </div>

          {/* Right-Sub: DOUBT AI */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onAction("show_doubt")}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-stone-400 hover:text-[#FF7A30] transition-all"
            title="Doubt AI Solver"
          >
            <Bot size={18} />
            <span className="text-[9px] font-bold uppercase tracking-wider">DOUBT</span>
          </motion.button>

          {/* Right: HUB */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setHomeCategory("modules")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
              homeCategory === "modules" ? "text-[#FF7A30] font-black" : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            }`}
            title="Prepping Hub Modules"
          >
            <Layers size={18} />
            <span className="text-[9px] font-bold uppercase tracking-wider">HUB</span>
          </motion.button>
        </motion.div>
      </div>

    </div>
  );
};
