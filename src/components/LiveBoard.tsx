import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PenTool as BoardIcon, Eraser, Image as ImageIcon, Sparkles, Maximize2, Minimize2, ChevronLeft, ChevronRight, FileDown, RotateCcw, X } from "lucide-react";
import Markdown from "react-markdown";
import jsPDF from "jspdf";
import { domToPng } from 'modern-screenshot';
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

// Helper to render text that might contain LaTeX
const MathText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  // Split by $$ or $ for LaTeX blocks
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        } else if (part.startsWith("$") && part.endsWith("$")) {
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export interface BoardElement {
  id: string;
  type: "text" | "image";
  content: string;
  timestamp: number;
}

const ACADEMIC_DICTIONARY: Record<string, string> = {
  // Biology - Reproduction/Gametogenesis
  "sperm": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "egg": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "fertilization": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
  "ovum": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "reproduction": "https://images.unsplash.com/photo-1516321405-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "gametogenesis": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "menstrual": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
  "ectopic": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "uterus": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "fallopian": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "pathogen": "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1200&auto=format&fit=crop",
  "treponema": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "syphilis": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "hiv": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  "chlamydia": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1200&auto=format&fit=crop",
  
  // Biology - Flowering plants
  "flower": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "flowering": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "pollination": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
  "geitonogamy": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "xenogamy": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "microsporogenesis": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  "megasporogenesis": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
  
  // Genetics
  "dna": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "rna": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "replication": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "transcription": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "translation": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "gene": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "mendel": "https://images.unsplash.com/photo-1463136524856-aa899b889390?q=80&w=1200&auto=format&fit=crop",
  "linkage": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
  "crossing over": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",

  // Evolution
  "evolution": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "fossil": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "homologous": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "analogous": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "oparin": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "haldane": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "homo erectus": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  "australopithecus": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
  
  // Bengali A Syllabus
  "adarini": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop", // Elegant Indian Elephant represent Adarini
  "elephant": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
  "bangala bhasha": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
  "vivekananda": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
  "bengali": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
  "dhharma": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
  "srijato": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
  "digbijoyer": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
  "potraj": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
  "neruda": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
  "phonemics": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
  "semantics": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
  "linguistics": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",

  // English Literature B Syllabus
  "deoli": "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop", // Nostalgic Indian railway station
  "train": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1200&auto=format&fit=crop",
  "roots": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop", // India temple/Rameswaram Kalam home
  "kalam": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
  "bet": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop", // Books/vintage desk Study
  "chekhov": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
  "ulysses": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop", // Classical epic ocean cliffs
  "casuarina": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop", // Beautiful giant tree
  "toru dutt": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
  "riders": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop", // Irish coastal sea
  "sea": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop"
};

const DEFAULT_ACADEMIC_IMAGES = {
  biology: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=1280&auto=format&fit=crop",
  math: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1280&auto=format&fit=crop",
  physics: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1280&auto=format&fit=crop",
  bengali: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1280&auto=format&fit=crop",
  english: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1280&auto=format&fit=crop",
  general: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1280&auto=format&fit=crop"
};

function getFallbackImage(prompt: string): string {
  const p = prompt.toLowerCase();
  for (const key of Object.keys(ACADEMIC_DICTIONARY)) {
    if (p.includes(key)) {
      return ACADEMIC_DICTIONARY[key];
    }
  }
  
  if (p.includes("sperm") || p.includes("cell") || p.includes("plant") || p.includes("bio") || p.includes("reproduction") || p.includes("germ") || p.includes("pathogen")) {
    return DEFAULT_ACADEMIC_IMAGES.biology;
  }
  if (p.includes("math") || p.includes("equation") || p.includes("calc") || p.includes("theorem") || p.includes("physics")) {
    return DEFAULT_ACADEMIC_IMAGES.math;
  }
  if (p.includes("adarini") || p.includes("bengali") || p.includes("bhasha") || p.includes("bangla") || p.includes("shakti")) {
    return DEFAULT_ACADEMIC_IMAGES.bengali;
  }
  if (p.includes("roots") || p.includes("train") || p.includes("bet") || p.includes("english") || p.includes("ulysses") || p.includes("synge") || p.includes("play")) {
    return DEFAULT_ACADEMIC_IMAGES.english;
  }
  return DEFAULT_ACADEMIC_IMAGES.general;
}

const BoardImage: React.FC<{ content: string }> = ({ content }) => {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (content.startsWith("http")) {
      setImgUrl(content);
    } else {
      setImgUrl(getFallbackImage(content));
    }
    setLoading(false);
  }, [content]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-xl border border-white/5 w-full h-[300px] md:h-[450px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="mb-4 text-indigo-400"
        >
          <Sparkles size={40} className="animate-pulse" />
        </motion.div>
        <p className="text-sm font-black uppercase text-indigo-300 tracking-wider animate-pulse">Sourcing educational visual...</p>
        <p className="text-[10px] text-slate-500 font-mono mt-1 max-w-sm text-center font-bold tracking-widest">{content.toUpperCase()}</p>
      </div>
    );
  }

  return (
    <img
      src={imgUrl || getFallbackImage(content)}
      alt="Board visual"
      className="w-full h-full object-contain rounded-xl md:rounded-[2rem]"
      referrerPolicy="no-referrer"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        const fb = getFallbackImage(content);
        if (target.src !== fb) {
          target.src = fb;
        }
      }}
    />
  );
};

interface LiveBoardProps {
  elements: BoardElement[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClearBoard?: () => void;
}

export const LiveBoard: React.FC<LiveBoardProps> = ({ elements, isExpanded, onToggleExpand, onClearBoard }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smart Grouping: Group elements into slides based on content weight
  const slides = React.useMemo(() => {
    const pages: BoardElement[][] = [];
    let currentPageElements: BoardElement[] = [];
    let currentWeight = 0;
    const MAX_WEIGHT = 1200; // High character count or image weight

    elements.forEach((el) => {
      const weight = el.type === "image" ? 800 : el.content.length;
      
      if (el.type === "image" || currentWeight + weight > MAX_WEIGHT) {
        if (currentPageElements.length > 0) {
          pages.push(currentPageElements);
        }
        if (el.type === "image") {
          pages.push([el]);
          currentPageElements = [];
          currentWeight = 0;
        } else {
          currentPageElements = [el];
          currentWeight = weight;
        }
      } else {
        currentPageElements.push(el);
        currentWeight += weight;
      }
    });

    if (currentPageElements.length > 0) {
      pages.push(currentPageElements);
    }

    return pages.length > 0 ? pages : [[]];
  }, [elements]);

  useEffect(() => {
    if (slides.length > 0 && currentPage >= slides.length) {
      setCurrentPage(slides.length - 1);
    } else if (slides.length > 0 && currentPage < 0) {
      setCurrentPage(0);
    }
  }, [slides.length, currentPage]);

  const exportToPDF = async () => {
    if (!boardRef.current || elements.length === 0) return;
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Store initial page to restore later
      const originalPage = currentPage;

      for (let i = 0; i < slides.length; i++) {
        setExportProgress(Math.round(((i + 1) / slides.length) * 100));
        setCurrentPage(i);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        const dataUrl = await domToPng(boardRef.current, {
          scale: 2, // High quality for PDF
          backgroundColor: "#030712",
          style: { opacity: '1' }
        });
        
        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
      
      setCurrentPage(originalPage);
      pdf.save(`Study_Notes_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Export failed", error);
      alert("PDF Export failed. Try closing other tabs or reducing slide content.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <motion.div
      layout
      className={`relative bg-[#010103] flex flex-col transition-all duration-700 overflow-hidden ${
        isExpanded 
          ? "fixed inset-0 z-[1000] rounded-none shadow-none w-screen h-[100dvh] h-[100vh]" 
          : "h-full w-full rounded-3xl shadow-2xl border border-white/5"
      }`}
    >
      {/* PPT Decorative Background Elements - More Intense Design */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] blur-[150px] rounded-full rotate-45" 
          style={{ backgroundColor: 'rgba(79, 70, 229, 0.2)' }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] blur-[150px] rounded-full -rotate-12" 
          style={{ backgroundColor: 'rgba(49, 46, 129, 0.1)' }}
        />
        
        {/* Dynamic Graphic Blobs */}
        <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }} />
        
        {/* Techy PPT Lines & Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6366f1]/20 to-transparent" />
        <div className="absolute bottom-40 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        {/* Geometric Corner Accents */}
        <div className="absolute top-12 left-12 w-32 h-32 border-t-2 border-l-2 border-[#6366f1]/30 rounded-tl-3xl" />
        <div className="absolute bottom-12 right-12 w-48 h-48 border-b-2 border-r-2 border-white/10 rounded-br-3xl" />
      </div>

      {/* Header */}
      <div className={`px-4 md:px-12 py-3 md:py-6 flex justify-between items-center z-50 transition-all ${isExpanded ? 'bg-black/90 pt-[max(2rem,env(safe-area-inset-top))] md:pt-10' : 'bg-white/[0.03]'} backdrop-blur-3xl border-b border-white/10 shadow-2xl relative`} data-html2canvas-ignore="true">
        {isExporting && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${exportProgress}%` }}
            className="absolute bottom-0 left-0 h-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] z-[60]"
          />
        )}
        <div className="flex items-center gap-3 md:gap-6 overflow-hidden">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-[#6366f1] blur-xl opacity-50 animate-pulse" />
            <div className="relative p-3 md:p-4 bg-gradient-to-br from-[#6366f1] to-[#4338ca] rounded-2xl md:rounded-3xl shadow-2xl ring-4 ring-white/10">
              <BoardIcon className="text-white" size={isMobile ? 18 : 24} />
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-2xl font-black text-white uppercase tracking-wider md:tracking-[0.2em] truncate">Board</h2>
              <span className="px-1.5 py-0.5 bg-[#6366f1] text-[8px] md:text-[10px] font-black rounded-md md:rounded-lg shrink-0">LIVE</span>
            </div>
            <p className="hidden md:block text-[10px] text-white/40 font-bold tracking-widest mt-1 uppercase truncate font-mono">
               {isExporting ? `EXPORTING PDF... ${exportProgress}%` : "Collaborative Study Space"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button
            onClick={() => setShowOverview(!showOverview)}
            className={`flex items-center gap-2 ${isMobile ? 'p-2.5' : 'px-6 py-3'} bg-white/5 border border-white/10 text-white text-[11px] font-black rounded-xl md:rounded-2xl hover:bg-white/10 transition-all`}
          >
            <BoardIcon size={isMobile ? 20 : 14} />
            {!isMobile && <span className="hidden sm:inline">PAGES</span>}
          </button>

          {elements.length > 0 && (
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className={`flex items-center gap-2 ${isMobile ? 'p-2.5' : 'px-6 py-3'} bg-white text-black text-[11px] font-black rounded-xl md:rounded-2xl hover:bg-indigo-400 hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl disabled:opacity-50`}
            >
              <FileDown size={isMobile ? 20 : 14} />
              {!isMobile && <span className="hidden sm:inline">EXPORT PDF</span>}
            </button>
          )}
          
          <div className="flex gap-1 md:gap-2 bg-black/40 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-white/5">
            {onClearBoard && (
              <button
                onClick={onClearBoard}
                className="p-2.5 md:p-3 hover:bg-red-500/20 rounded-lg md:rounded-xl transition-all text-white/40 hover:text-red-400"
                title="Clear"
              >
                <RotateCcw size={isMobile ? 18 : 18} />
              </button>
            )}
            <button
              onClick={onToggleExpand}
              className="p-2.5 md:p-3 bg-white/5 hover:bg-indigo-500 rounded-lg md:rounded-xl transition-all text-white hover:text-white"
              title={isExpanded ? "Minimize" : "Full Screen"}
            >
              {isExpanded ? <Minimize2 size={isMobile ? 20 : 20} /> : <Maximize2 size={isMobile ? 20 : 20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation - Floating Glass Panels */}
      {slides.length > 1 && (
        <>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-[100] pointer-events-none hidden md:block">
            <button 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={`p-4 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white pointer-events-auto transition-all ${currentPage === 0 ? 'opacity-0 scale-50' : 'hover:scale-110 active:scale-95 shadow-2xl'}`}
            >
              <ChevronLeft size={32} />
            </button>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] pointer-events-none hidden md:block">
            <button 
              onClick={() => setCurrentPage(p => Math.min(slides.length - 1, p + 1))}
              disabled={currentPage === slides.length - 1}
              className={`p-4 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white pointer-events-auto transition-all ${currentPage === slides.length - 1 ? 'opacity-0 scale-50' : 'hover:scale-110 active:scale-95 shadow-2xl'}`}
            >
              <ChevronRight size={32} />
            </button>
          </div>
          
          {/* Mobile Navigation Bar */}
          <div className={`md:hidden absolute ${isExpanded ? 'bottom-12' : 'bottom-6'} left-1/2 -translate-x-1/2 flex items-center gap-6 z-[100] bg-black/60 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl`} data-html2canvas-ignore="true">
            <button 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={`text-white transition-opacity ${currentPage === 0 ? 'opacity-20' : 'active:scale-90'}`}
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-[10px] font-black text-indigo-400 tracking-widest">{currentPage + 1} / {slides.length}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(slides.length - 1, p + 1))}
              disabled={currentPage === slides.length - 1}
              className={`text-white transition-opacity ${currentPage === slides.length - 1 ? 'opacity-20' : 'active:scale-90'}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </>
      )}

      {/* Board Canvas (Slide Container) */}
      <div 
        ref={boardRef}
        className={`flex-1 overflow-hidden relative flex flex-col items-center justify-center ${isExpanded ? 'p-4 md:p-12 lg:p-16' : 'p-4'}`}
      >
        <AnimatePresence mode="wait">
          {!elements || elements.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-dashed border-indigo-500/20 flex items-center justify-center bg-white/2">
                <Sparkles size={isMobile ? 32 : 48} className="animate-pulse text-indigo-400" />
              </div>
              <p className="text-[10px] md:text-sm font-bold tracking-widest uppercase text-white/40">Select a topic to start lesson</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full flex flex-col items-center justify-center overflow-hidden"
            >
              <div className="w-full max-w-7xl h-full flex flex-col gap-4 md:gap-8 p-1 md:p-6 overflow-y-auto scrollbar-hide">
                {slides[currentPage]?.map((el) => (
                  <div key={el.id} className="w-full shrink-0">
                    {el.type === "text" ? (
                      <motion.div 
                        className="relative w-full p-[1px] md:p-[2px] bg-gradient-to-br from-[#6366f1]/40 via-white/5 to-transparent rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden"
                      >
                        <div className="w-full bg-[#050505]/95 border border-white/10 rounded-2xl md:rounded-[2.4rem] p-6 sm:p-10 md:p-16 shadow-inner backdrop-blur-3xl flex flex-col justify-center items-center">
                          <div className="w-full text-lg sm:text-2xl md:text-4xl lg:text-5xl text-white font-serif md:leading-snug bangla-text tracking-wide text-center">
                            <MathText text={el.content} />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="relative w-full aspect-video flex items-center justify-center my-4">
                        <div className="absolute inset-0 bg-[#6366f1]/10 blur-[100px] rounded-full opacity-20" />
                        <div className="relative w-full h-full rounded-2xl md:rounded-[2.5rem] overflow-hidden border-2 md:border-4 border-white/10 shadow-2xl bg-black/40 p-1 md:p-2 flex items-center justify-center">
                          <BoardImage content={el.content} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overview Grid Overlay */}
        <AnimatePresence>
          {showOverview && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-[150] bg-black/60 p-8 md:p-16"
            >
              <div className="max-w-6xl mx-auto h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest">Board Overview</h3>
                   <button onClick={() => setShowOverview(false)} className="p-4 bg-white/10 hover:bg-rose-500 rounded-full transition-all text-white">
                      <X size={24} />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pr-4 scrollbar-hide">
                   {slides.map((slide, idx) => (
                     <motion.button
                       key={idx}
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => {
                         setCurrentPage(idx);
                         setShowOverview(false);
                       }}
                       className={`relative aspect-[1.4/1] rounded-2xl overflow-hidden border-2 transition-all p-2 flex flex-col items-center justify-center bg-black/40 ${currentPage === idx ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'border-white/10'}`}
                     >
                       <div className="text-[8px] font-black uppercase text-white/20 mb-1">Page {idx + 1}</div>
                       <div className="text-[10px] text-white/60 text-center line-clamp-3 font-serif px-2">
                          {slide[0]?.type === 'image' ? 'Visual Resource' : slide[0]?.content.slice(0, 50) + '...'}
                       </div>
                       {slide.length > 1 && <div className="absolute bottom-2 right-2 text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md">+{slide.length - 1} MORE</div>}
                     </motion.button>
                   ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`${isMobile && !isExpanded ? 'hidden' : 'flex'} relative px-4 md:px-10 py-4 md:py-6 bg-white/[0.02] border-t border-white/5 backdrop-blur-3xl flex-col md:flex-row items-center justify-between z-50 gap-4 shrink-0`} data-html2canvas-ignore="true">
         <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-white/30 tracking-[0.3em] uppercase mb-1">Session Data</span>
               <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-indigo-400">SLIDE {currentPage + 1}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="text-[10px] font-bold text-white/60">{elements.length} BLOCKS TOTAL</span>
               </div>
            </div>
            
            <div className="hidden sm:flex h-8 w-[1px] bg-white/10" />
            
            <div className="hidden sm:flex items-center gap-3">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border border-black bg-slate-800 flex items-center justify-center text-[8px] font-bold">A</div>
                  ))}
               </div>
               <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Studying WBCHSE Class 12</span>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sync Active</span>
            </div>
            
            <div className="text-[9px] font-mono text-white/20 whitespace-nowrap">
               {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} PREVIEW
            </div>
         </div>
      </div>
    </motion.div>
  );
};
