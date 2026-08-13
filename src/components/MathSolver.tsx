import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calculator, ArrowRight, BookOpen, Clock, AlertCircle, History, Sparkles, Send, Loader2, Camera, Upload, Volume2, Mic, RotateCcw, MessageSquare, Info, Brain, Download, FileJson, File as FileIcon, Image as ImageIcon, Book, Plus, Copy, Check } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { MathText } from "./MathText";
import { GoogleGenAI } from "@google/genai";
import { solveProblemWithImage, getStrangerAudio, safeJsonParse, getPreferences } from "../services/geminiService";
import { domToPng } from 'modern-screenshot';

const FORMULA_CATEGORIES = [
  {
    name: "Calculus & Integrals",
    formulas: [
      { label: "Derivative of sin(x)", latex: "\\frac{d}{dx}(\\sin x) = \\cos x" },
      { label: "Integration by Parts", latex: "\\int u\\,dv = uv - \\int v\\,du" },
      { label: "Standard Integral 1/x", latex: "\\int \\frac{1}{x}\\,dx = \\ln|x| + C" },
      { label: "Definite Integral Property", latex: "\\int_a^b f(x)\\,dx = \\int_a^b f(a+b-x)\\,dx" }
    ]
  },
  {
    name: "Matrices & Inverse",
    formulas: [
      { label: "Inverse Matrix", latex: "A^{-1} = \\frac{1}{|A|} \\text{adj}(A)" },
      { label: "Determinant 2x2", latex: "|A| = a_{11}a_{22} - a_{12}a_{21}" },
      { label: "Transposed Product", latex: "(AB)^T = B^T A^T" }
    ]
  },
  {
    name: "Inverse Trig & Vectors",
    formulas: [
      { label: "sin⁻¹x + cos⁻¹x", latex: "\\sin^{-1}x + \\cos^{-1}x = \\frac{\\pi}{2}" },
      { label: "tan⁻¹x + tan⁻¹y", latex: "\\tan^{-1}x + \\tan^{-1}y = \\tan^{-1}\\left(\\frac{x+y}{1-xy}\\right)" },
      { label: "Dot Product", latex: "\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta" }
    ]
  },
  {
    name: "Electrostatics & Physics",
    formulas: [
      { label: "Coulomb's Law", latex: "F = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2}" },
      { label: "Capacitance", latex: "C = \\frac{Q}{V} = \\frac{\\varepsilon_0 A}{d}" },
      { label: "Ohm's Law", latex: "V = I \\cdot R" }
    ]
  }
];

interface MathSolverProps {
  onClose: () => void;
  apiKey?: string;
  userName?: string;
  userId?: string;
  onSolved?: (problem: string) => void;
}

  export const MathSolver: React.FC<MathSolverProps> = ({ onClose, apiKey, userName = "Abhijit", onSolved }) => {
  const [problem, setProblem] = useState(() => localStorage.getItem("draft_math_problem") || "");
  const [image, setImage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [steps, setSteps] = useState<{ step: string; explanation: string }[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [historyList, setHistoryList] = useState<{id: string, title: string, data: any}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState(false);
  const [similarProblemText, setSimilarProblemText] = useState<string | null>(null);
  const [copiedFormulaIndex, setCopiedFormulaIndex] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Camera access denied. Please use upload instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        setImage(dataUrl);
        setProblem("");
        stopCamera();
      }
    }
  };

  // Load history on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("math_history");
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save successful solve to history
  const saveToHistory = (title: string, data: any) => {
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: title.slice(0, 40) + (title.length > 40 ? "..." : ""),
      data
    };
    const updated = [newItem, ...historyList].slice(0, 20); // Keep last 20
    setHistoryList(updated);
    localStorage.setItem("math_history", JSON.stringify(updated));
    if (onSolved) onSolved(title);
  };

  // Helper to clean LaTeX for plain text copy
  const cleanMathText = (text: string) => {
    if (!text) return "";
    return text
      // Delimiters
      .replace(/\$\$(.*?)\$\$/gs, '$1') 
      .replace(/\$(.*?)\$/g, '$1')     
      // Fractions \frac{a}{b} -> (a / b)
      .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1 / $2)')
      // Powers and Subscripts
      .replace(/\^\{(.*?)\}/g, '^$1')
      .replace(/\^(\d)/g, '^$1')
      .replace(/_\{(.*?)\}/g, '_$1')
      .replace(/_(\d)/g, '_$1')
      // Common Math Symbols
      .replace(/\\times/g, ' × ')
      .replace(/\\div/g, ' ÷ ')
      .replace(/\\cdot/g, ' . ')
      .replace(/\\pm/g, ' ± ')
      .replace(/\\sqrt\{(.*?)\}/g, '√($1)')
      .replace(/\\sqrt/g, '√')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\infty/g, '∞')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\rightarrow/g, ' → ')
      .replace(/\\left\(|\\right\)/g, '')
      .replace(/\\\{|\\\}/g, '')
      // Formatting
      .replace(/\\text\{(.*?)\}/g, '$1')
      .replace(/\\mathbf\{(.*?)\}/g, '$1')
      .replace(/\\quad/g, '  ')
      .replace(/\\/g, '') // Final catch-all
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleDownload = async (format: 'png' | 'pdf') => {
    const element = document.getElementById('math-results-container');
    if (!element) {
      alert("আগে অংকের সমাধান তৈরি করুন!");
      return;
    }
    
    // For high quality PDF, we use the browser's native print which preserves vector text
    if (format === 'pdf') {
      window.print();
      return;
    }

    // For PNG image capture
    setIsSolving(true);
    
    try {
      await new Promise(r => setTimeout(r, 600));
      
      const dataUrl = await domToPng(element, {
        scale: 2, // 2x scale for clear text in PNG
        backgroundColor: '#ffffff',
        style: {
          padding: '30px',
          margin: '0',
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible',
          width: '1000px' // Slightly wider for better text distribution
        }
      });

      const link = document.createElement('a');
      link.download = `StudyStranger-Math-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Capture failure:", err);
      alert("ইমেজ ডাউনলোড ব্যর্থ হয়েছে। দয়া করে PDF অপশনটি ব্যবহার করুন বা প্রিন্ট করুন।");
    } finally {
      setIsSolving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setProblem(""); // Clear text if image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const speakTextFallback = (textToSpeak: string, onEnded: () => void) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      // Clean up math syntax so the speech synthesis handles it as clean natural text
      const cleaned = textToSpeak
        .replace(/\$\$[\s\S]*?\$\$/g, "") // Remove formula blocks so it does not spell dry LaTeX code
        .replace(/\$[\s\S]*?\$/g, "")     // Remove inline formulas
        .replace(/\\\[[\s\S]*?\\\]/g, "")
        .replace(/\\\([\s\S]*?\\\)/g, "")
        .replace(/\\frac\{.*?\}\{.*?\}/g, "")
        .replace(/[\\\$_\{\}\^\[\]\(\)]/g, "") 
        .replace(/\s+/g, " ")
        .trim();

      if (!cleaned) {
        onEnded();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(v => v.lang.startsWith("bn") || v.lang.includes("Bengali") || v.lang.includes("India"));
      if (bnVoice) {
        utterance.voice = bnVoice;
      }
      utterance.onend = () => onEnded();
      utterance.onerror = () => onEnded();
      window.speechSynthesis.speak(utterance);
    } else {
      onEnded();
    }
  };

  const speakText = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const audioData = await getStrangerAudio(text, "stranger", apiKey);
      if (audioData) {
        const url = `data:audio/mp3;base64,${audioData}`;
        const audio = new Audio(url);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      } else {
        speakTextFallback(text, () => setIsSpeaking(false));
      }
    } catch (err) {
      console.error("Audio error:", err);
      speakTextFallback(text, () => setIsSpeaking(false));
    }
  };

  const playFullExplanation = async () => {
    if (isSpeaking) return;
    
    let fullText = analysis ? `এই প্রশ্নটিতে জানতে চাওয়া হয়েছে: ${analysis}. ` : "";
    fullText += "আসুন এটি ধাপে ধাপে সমাধান করি। ";
    steps.forEach((s, i) => {
      fullText += `ধাপ ${i + 1}: ${s.explanation}. `;
    });
    fullText += finalAnswer ? `সর্বশেষ উত্তর হলো: ${finalAnswer.replace(/\$/g, "")}.` : "";
    
    speakText(fullText);
  };

  const solveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim() && !image) return;

    setIsSolving(true);
    setAnalysis(null);
    setSteps([]);
    setFinalAnswer(null);
    setError(null);

    try {
      let data;
      if (image) {
        const base64Data = image.split(',')[1];
        data = await solveProblemWithImage(base64Data, apiKey, userName);
      } else {
        const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
        const result = await ai.models.generateContent({ 
          model: getPreferences().mathModel,
          config: {
            systemInstruction: `You are an expert, highly educational Math and Science Solver/Tutor for ${userName}.
            Your primary goal is to provide deep, comprehensive, beautifully clear step-by-step master-class explanations in warm, supportive Bengali and Bunglish.
            Avoid short or brief answers. Give comprehensive conceptual depth.
            
            When a academic math/science problem is provided:
            1. First, write a thorough, detailed analysis under "analysis". Explain exactly: what the problem presents, what the core question asks us to find, and our step-by-step master plan of formulas and ideas in sweet, encouraging Bengali.
            2. Break the solution into highly granular, logical steps.
            3. For each step:
               - Write the mathematical/scientific equation or expression strictly in LaTeX inside "step".
               - Write an extremely detailed, friendly, and pedagogical teacher-like explanation in Bengali/Bunglish inside "explanation". Detail why we perform this calculation, what formula is used, and how it leads to the next step.
            4. CRITICAL: Wrap ALL mathematical expressions in $$ (e.g., $$\\frac{x}{2}$$ or $$x = 5$$) inside the JSON strings.
            5. IMPORTANT: Use double backslashes in the result string (e.g., \\\\frac) so it parses correctly as JSON.
            6. Provide the final answer clearly in LaTeX.
            
            Return ONLY a valid JSON object:
            {
              "analysis": "Extremely detailed, warm, and thorough analysis of the problem in Bengali",
              "steps": [
                { "step": "$$Detailed Math Step with escaped backslashes$$", "explanation": "A complete, beautifully detailed step-by-step pedagogical explanation in Bengali" }
              ],
              "finalAnswer": "$$Final Result with escaped backslashes$$"
            }`,
            responseMimeType: "application/json"
          },
          contents: [{ role: "user", parts: [{ text: `Solve this math problem step-by-step: ${problem}` }] }],
        });

        const responseText = result.text || "{}";
        data = safeJsonParse(responseText);
      }
      
      setAnalysis(data.analysis || null);
      setSteps(data.steps || []);
      setFinalAnswer(data.finalAnswer || null);
      
      // Clear draft on successful solve
      localStorage.removeItem("draft_math_problem");
      setProblem("");
      
      // Save to history
      saveToHistory(problem || "Image Question", data);

    } catch (err: any) {
      console.error("Math Solving Error:", err);
      const userMessage = err.message || `ei problem ta solve korte problem holo. Arekbar chesta koro.`;
      setError(`Dukkhoito ${userName}, ${userMessage}`);
    } finally {
      setIsSolving(false);
    }
  };

  const [followUp, setFollowUp] = useState(() => localStorage.getItem("draft_math_followup") || "");
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [clarification, setClarification] = useState<string | null>(null);

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim()) return;

    setIsFollowUpLoading(true);
    setClarification(null);
    const userQuery = followUp;
    setFollowUp("");
    localStorage.removeItem("draft_math_followup");

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
      const prompt = `
        Regarding the previous academic problem:
        Original Problem/Analysis: ${analysis}
        Current Steps: ${JSON.stringify(steps)}
        Final Answer: ${finalAnswer}
        
        The student (${userName}) has this follow-up doubt: "${userQuery}"
        
        Please provide a helpful, friendly clarification in Bengali/Bunglish. 
        If they are confused about a specific step, explain it more simply.
        Return ONLY a JSON object:
        { "clarification": "The text explanation in Bengali with LaTeX $$ if needed" }
      `;

      const result = await ai.models.generateContent({ 
        model: getPreferences().mathModel,
        config: { responseMimeType: "application/json" },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const responseText = result.text || "{}";
      const data = safeJsonParse(responseText);
      if (data && data.clarification) {
        setClarification(data.clarification);
        // Speak the clarification automatically!
        speakText(data.clarification.replace(/\$/g, ""));
      }
    } catch (err) {
      console.error("Follow-up Error:", err);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const generateSimilarProblem = async () => {
    if (!analysis && !problem) return;
    setIsGeneratingSimilar(true);
    setSimilarProblemText(null);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
      const prompt = `Based on this solved math/science problem for WBCHSE Class 12:
      Problem/Analysis: ${analysis || problem}
      Final Answer: ${finalAnswer || ""}
      
      Generate ONE new, similar practice problem with slight variations in numbers or variables so the student can test themselves.
      Write it in friendly Bengali/Bunglish with LaTeX for formulas, and provide a short answer hint.
      Keep it encouraging for student ${userName}.`;

      const res = await ai.models.generateContent({
        model: getPreferences().mathModel,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      if (res.text) {
        setSimilarProblemText(res.text);
      }
    } catch (e) {
      console.error("Failed to generate similar problem", e);
    } finally {
      setIsGeneratingSimilar(false);
    }
  };

  const resetAll = () => {
    setProblem("");
    setImage(null);
    setAnalysis(null);
    setSteps([]);
    setFinalAnswer(null);
    setError(null);
    setClarification(null);
    setSimilarProblemText(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-0 md:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full h-full md:max-w-4xl md:h-[90vh] bg-[#f8fafc] border border-white md:rounded-[40px] overflow-hidden flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>

        {/* Header */}
        <div className="p-4 md:p-8 flex items-center justify-between border-b border-slate-100 relative z-10 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => { setShowHistory(!showHistory); setShowFormulas(false); }}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${showHistory ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              title="View Solved History"
            >
              <History size={18} className="md:w-5 md:h-5" />
            </button>

            <button 
              onClick={() => { setShowFormulas(!showFormulas); setShowHistory(false); }}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${showFormulas ? 'bg-indigo-600 text-white shadow-lg' : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'}`}
              title="Formula Vault & Cheatsheet"
            >
              <Book size={18} className="md:w-5 md:h-5" />
            </button>

            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Calculator size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight uppercase">Math <span className="text-indigo-600">Lab</span></h2>
              <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Academic Solver Node</p>
            </div>
          </div>

          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-bold"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 scrollbar-hide relative z-10">
          <AnimatePresence>
            {/* History Drawer */}
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="absolute inset-y-0 left-0 w-full md:w-80 bg-white shadow-2xl z-50 border-r border-slate-100 p-6 md:p-8 flex flex-col"
              >
                 <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h3 className="text-lg font-black text-slate-900 uppercase">Recent Solves</h3>
                    <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={16} /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                    {historyList.length === 0 ? (
                      <div className="text-center py-10 opacity-30">
                        <History size={32} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase">No history yet</p>
                      </div>
                    ) : (
                      historyList.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setAnalysis(item.data.analysis);
                            setSteps(item.data.steps);
                            setFinalAnswer(item.data.finalAnswer);
                            setShowHistory(false);
                          }}
                          className="w-full text-left p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group"
                        >
                          <p className="text-xs font-bold text-slate-700 leading-snug mb-2 line-clamp-2">{item.title}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500">View Solution</span>
                        </button>
                      ))
                    )}
                 </div>
              </motion.div>
            )}

            {/* Formula Cheatsheet Drawer */}
            {showFormulas && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="absolute inset-y-0 left-0 w-full md:w-96 bg-white shadow-2xl z-50 border-r border-slate-100 p-6 md:p-8 flex flex-col"
              >
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Book size={18} /></div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 uppercase">Formula Vault</h3>
                        <p className="text-[10px] text-slate-400 font-bold">Class 12 WBCHSE Cheatsheet</p>
                      </div>
                    </div>
                    <button onClick={() => setShowFormulas(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={16} /></button>
                 </div>

                 <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-1">
                    {FORMULA_CATEGORIES.map((cat, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-wider">{cat.name}</h4>
                        <div className="space-y-2">
                          {cat.formulas.map((form, fIdx) => (
                            <div key={fIdx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500">{form.label}</span>
                                <button
                                  onClick={() => {
                                    setProblem(prev => prev ? `${prev} ${form.latex}` : form.latex);
                                    setCopiedFormulaIndex(`${idx}-${fIdx}`);
                                    setTimeout(() => setCopiedFormulaIndex(null), 1500);
                                  }}
                                  className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md text-[9px] font-black uppercase flex items-center gap-1 transition-all"
                                >
                                  {copiedFormulaIndex === `${idx}-${fIdx}` ? <Check size={10} /> : <Plus size={10} />}
                                  {copiedFormulaIndex === `${idx}-${fIdx}` ? "Added" : "Insert"}
                                </button>
                              </div>
                              <div className="text-xs text-slate-800 font-mono bg-white p-2 rounded-lg border border-slate-100 overflow-x-auto">
                                <MathText text={`$$${form.latex}$$`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Input Area */}
          <form onSubmit={solveProblem} className="space-y-4 md:space-y-6">
             <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Problem Input</label>
                  <div className="flex items-center gap-2">
                    {image && (
                      <button 
                        type="button"
                        onClick={() => setImage(null)}
                        className="text-[8px] md:text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-2 md:px-3 py-1 rounded-full transition-all"
                      >
                        <RotateCcw size={8} className="md:w-2.5 md:h-2.5" /> Clear Image
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  {isCameraActive ? (
                    <div className="relative w-full aspect-[3/4] bg-black rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white mb-4 md:mb-6">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-3 md:gap-4 px-4 overflow-x-auto pb-4">
                          <button 
                            type="button"
                            onClick={stopCamera}
                            className="p-3 md:p-4 bg-slate-900/80 backdrop-blur-md text-white rounded-xl md:rounded-2xl hover:bg-rose-500"
                          >
                            <X size={18} className="md:w-5 md:h-5" />
                          </button>
                          <button 
                            type="button"
                            onClick={takePhoto}
                            className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full border-2 md:border-4 border-indigo-500 flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                          >
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500 rounded-full" />
                          </button>
                        </div>
                    </div>
                  ) : !image ? (
                    <div className="relative">
                      <textarea 
                        value={problem}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProblem(val);
                          localStorage.setItem("draft_math_problem", val);
                        }}
                        placeholder={`${userName}, solve math... (e.g. Solve 2x + 10 = 20)`}
                        className="w-full bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-4 md:p-6 text-slate-800 text-base md:text-lg font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all min-h-[120px] md:min-h-[140px] resize-none shadow-sm pr-12 md:pr-20"
                      />
                      <div className="absolute top-3 md:top-4 right-3 md:right-4 flex flex-col gap-2">
                        <button 
                          type="button"
                          onClick={startCamera}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center justify-center shadow-sm"
                          title="Open Camera"
                        >
                          <Camera size={16} className="md:w-5 md:h-5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center shadow-sm"
                          title="Upload image"
                        >
                          <ImageIcon size={16} className="md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-indigo-100 shadow-xl group">
                       <img src={image} className="w-full h-32 md:h-48 object-cover opacity-80" alt="Problem" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4 md:p-6">
                          <p className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                             <Sparkles size={12} className="text-amber-400 md:w-3.5 md:h-3.5" /> Image uploaded successfully
                          </p>
                       </div>
                    </div>
                  )}
                  
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="flex gap-2 md:gap-3 justify-end mt-3 md:mt-4">
                    {(steps.length > 0 || finalAnswer) && (
                       <button 
                         type="button"
                         onClick={resetAll}
                         className="px-4 py-2.5 md:px-6 md:py-3 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                       >
                         New
                       </button>
                    )}
                    <button 
                      type="submit"
                      disabled={isSolving || (!problem.trim() && !image)}
                      className="flex-1 md:flex-none px-6 py-3 md:px-8 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 shadow-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 font-black text-[10px] uppercase tracking-widest"
                    >
                      {isSolving ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> Solve & Explain</>}
                    </button>
                  </div>
                </div>
             </div>
          </form>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {isSolving && (
              <motion.div 
                key="solving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 md:py-24 space-y-4 md:space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-50 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <Brain size={32} className="animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">AI Academic Core Processing</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Applying Step-by-Step Logic...</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-center gap-4 text-rose-600 shadow-sm"
              >
                <AlertCircle size={24} />
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            )}

            {(steps.length > 0 || finalAnswer) && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* AI Voice Assistant Controls & Downloads */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSpeaking ? "bg-white text-indigo-600 animate-pulse" : "bg-indigo-500 text-white"}`}>
                          {isSpeaking ? <Volume2 size={24} /> : <div className="w-6 h-6 bg-white/20 rounded-full"></div>}
                        </div>
                        <div>
                          <h3 className="text-lg font-black tracking-tight leading-none">AI Voice Mentor</h3>
                          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-2">{isSpeaking ? "Speaking Explanation..." : "Ready to explain aloud"}</p>
                        </div>
                    </div>
                    <button 
                      onClick={playFullExplanation}
                      disabled={isSpeaking}
                      className="relative z-10 px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:shadow-white/20 active:scale-95 transition-all flex items-center gap-2 group-hover:scale-105"
                    >
                      <Volume2 size={16} /> {isSpeaking ? "Voice Active" : "Play Full Explanation"}
                    </button>
                  </div>

                    <div className="flex items-center gap-3 justify-center">
                      <button 
                        onClick={() => handleDownload('png')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <ImageIcon size={14} /> JPG
                      </button>
                      <button 
                        onClick={() => handleDownload('pdf')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <FileIcon size={14} /> PDF
                      </button>
                      <button 
                        onClick={() => {
                          const cleanAnalysis = analysis ? `${cleanMathText(analysis)}\n\n` : "";
                          const cleanSteps = steps.map((s, i) => `Step ${i+1}: ${cleanMathText(s.explanation)}\nEqu: ${cleanMathText(s.step)}\n`).join('\n');
                          const cleanFinal = finalAnswer ? `\nFinal Answer: ${cleanMathText(finalAnswer)}` : "";
                          
                          const text = `Math Solution by StudyStranger:\n\n${cleanAnalysis}${cleanSteps}${cleanFinal}`;
                          navigator.clipboard.writeText(text);
                          alert("Solution text copy hoyeche (Cleaned)!");
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                      >
                        <Send size={14} /> Copy Text
                      </button>
                    </div>
                </div>

                <div ref={resultsRef} id="math-results-container" className="bg-white p-4 md:p-8 rounded-[3rem] space-y-10 relative overflow-hidden">
                  {/* Subtle Paper Texture */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(#000 0, #000 1px, transparent 1px, transparent 32px)', backgroundSize: '100% 32px' }}></div>
                  
                  {/* Question Analysis */}
                  {analysis && (
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-3 ml-2">
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Info size={14} /></div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Analysis</h4>
                      </div>
                      <div className="p-8 bg-amber-50/30 border border-amber-100 rounded-[2.5rem] relative overflow-hidden group rotate-[0.5deg]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><MessageSquare size={48} className="text-amber-500" /></div>
                        <p className="text-lg md:text-xl text-slate-800 font-hand leading-relaxed italic relative z-10">
                            {analysis}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 relative z-10">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookOpen size={16} />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Step-by-Step Breakdown</h3>
                    </div>
                  </div>

                  <div className="grid gap-8 relative z-10">
                    {steps.map((s, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className={`group flex flex-col md:flex-row gap-8 p-8 bg-white border border-slate-100 rounded-[3rem] transition-all shadow-sm relative overflow-hidden ${i % 2 === 0 ? "rotate-[-0.3deg]" : "rotate-[0.3deg]"}`}
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-indigo-500 transition-colors"></div>
                        <div className="w-12 h-12 rounded-[1.2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1 space-y-6 min-w-0 font-hand">
                          <div className="text-2xl md:text-3xl text-slate-900 tracking-tight overflow-x-auto scrollbar-hide py-2">
                            <MathText text={s.step} />
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="p-6 bg-slate-50/80 rounded-[2.2rem] border border-slate-100 flex-1 relative group/exp">
                                <p className="text-sm md:text-base text-indigo-900 font-medium leading-relaxed italic border-l-2 border-indigo-200 pl-6">
                                  {s.explanation}
                                </p>
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {finalAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-16 p-10 md:p-16 bg-white border-4 border-slate-900 rounded-[4rem] text-center space-y-8 relative overflow-hidden shadow-2xl z-10 rotate-1"
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[60px] rounded-full -mr-20 -mt-20 opacity-50"></div>
                      
                      <div className="relative z-10 space-y-8">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Result</span>
                        </div>
                        
                        <div className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter py-6 overflow-x-auto scrollbar-hide font-hand">
                          <MathText text={finalAnswer} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Practice Similar Problem Generator */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4 relative z-10">
                    <button
                      onClick={generateSimilarProblem}
                      disabled={isGeneratingSimilar}
                      className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 disabled:opacity-50"
                    >
                      {isGeneratingSimilar ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {isGeneratingSimilar ? "Creating Similar Practice..." : "Generate Similar Problem To Practice"}
                    </button>

                    <AnimatePresence>
                      {similarProblemText && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="w-full p-6 md:p-8 bg-amber-50/60 border border-amber-200/80 rounded-[2.5rem] space-y-4 text-left shadow-md"
                        >
                          <div className="flex items-center gap-2 text-amber-700">
                            <Brain size={18} />
                            <h4 className="text-xs font-black uppercase tracking-widest">AI Generated Practice Question</h4>
                          </div>
                          <div className="text-sm md:text-base text-slate-800 leading-relaxed font-medium">
                            <MathText text={similarProblemText} />
                          </div>
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => {
                                setProblem(similarProblemText.split("\n")[0] || similarProblemText);
                                resetAll();
                              }}
                              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-700 transition-all shadow-sm"
                            >
                              Solve This Now
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Clarification Display */}
                <div className="space-y-6">
                   <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-100 group">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 shrink-0 group-hover:scale-110 transition-transform">
                         <MessageSquare size={24} />
                      </div>
                      <div className="flex-1">
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Need a quick hint?</h4>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Found something tricky? Click any step for voice aid, or use the AI Clarifier below.</p>
                      </div>
                   </div>

                   <AnimatePresence>
                     {clarification && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] relative"
                       >
                         <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><Brain size={14} /></div>
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AI Clarification</h4>
                            <button 
                              type="button"
                              onClick={() => speakText(clarification.replace(/\$/g, ""))}
                              className="ml-auto w-8 h-8 rounded-full bg-white text-emerald-500 flex items-center justify-center shadow-sm hover:bg-emerald-500 hover:text-white transition-all"
                            >
                               <Volume2 size={14} />
                            </button>
                         </div>
                         <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">
                            <MathText text={clarification} />
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   <form onSubmit={handleFollowUp} className="relative">
                      <input 
                        type="text"
                        value={followUp}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFollowUp(val);
                          localStorage.setItem("draft_math_followup", val);
                        }}
                        placeholder="What part is confusing? Ask the AI Mentor..."
                        className="w-full bg-white border border-slate-100 rounded-[2rem] py-5 pl-8 pr-32 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all shadow-sm"
                      />
                      <button 
                        type="submit"
                        disabled={isFollowUpLoading || !followUp.trim()}
                        className="absolute right-3 top-2.5 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {isFollowUpLoading ? <Loader2 size={14} className="animate-spin" /> : "Clarify"}
                      </button>
                   </form>
                </div>
              </motion.div>
            )}

            {!isSolving && steps.length === 0 && !error && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center opacity-40"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150"></div>
                  <Calculator size={64} className="text-slate-400 relative z-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Ready to analyze</p>
                  <p className="text-xs text-slate-400 font-medium italic">Type a problem or upload a question photo</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="p-5 bg-white/80 backdrop-blur-sm border-t border-slate-100 text-center relative z-10">
          <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Intelligence Core V3 • Bilingual Support Active
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
