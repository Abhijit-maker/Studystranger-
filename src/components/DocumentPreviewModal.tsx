import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Download, Printer, Copy, Check, ZoomIn, ZoomOut, RotateCcw, 
  FileText, BookOpen, Eye, Share2, Sparkles, ChevronLeft, ChevronRight 
} from "lucide-react";
import "katex/dist/katex.min.css";
import { MathText } from "./MathText";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  content: string | { title: string; body: string }[];
  type?: "notes" | "pdf" | "summary" | "flashcard" | "doc";
  subject?: string;
  date?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = "WBCHSE Class 12 Study Material • Document Viewer",
  content,
  type = "notes",
  subject = "Biology",
  date = new Date().toLocaleDateString()
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      const textToCopy = typeof content === "string" 
        ? content 
        : content.map(c => `${c.title}\n${c.body}`).join("\n\n");
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const textToSave = typeof content === "string" 
      ? content 
      : content.map(c => `${c.title}\n${c.body}`).join("\n\n");
    const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_Notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 font-sans text-slate-800 dark:text-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-5xl h-[92vh] bg-white dark:bg-[#0c101d] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <header className="px-6 py-4 bg-slate-50 dark:bg-[#080b14] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <FileText size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">
                    {title}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {subject}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  {subtitle} • {date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all border border-slate-200 dark:border-slate-700/60"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Document Toolbar */}
          <div className="px-6 py-2.5 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setZoom(z => Math.max(70, z - 10))} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[11px] font-mono font-black px-2 min-w-[50px] text-center text-indigo-600 dark:text-indigo-400">
                {zoom}%
              </span>
              <button 
                onClick={() => setZoom(z => Math.min(150, z + 10))} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button 
                onClick={() => setZoom(100)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                title="Reset Zoom"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white dark:bg-slate-950 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[11px]"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-white dark:bg-slate-950 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[11px]"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 text-[11px] uppercase tracking-wider"
              >
                <Download size={14} />
                <span>Download Notes</span>
              </button>
            </div>
          </div>

          {/* Document Content Page */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/50 dark:bg-slate-950/60 flex justify-center">
            <div 
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              className="w-full max-w-3xl bg-white dark:bg-[#0f1526] min-h-[700px] p-8 sm:p-12 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 transition-transform duration-200"
            >
              {/* Cover Banner */}
              <div className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  <span>Study Stranger Official Study Document</span>
                  <span>WBCHSE Sem 3</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {title}
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Prepared for Student: Abhijit (Class 12)
                </p>
              </div>

              {/* Render String or Structured Body */}
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                {typeof content === "string" ? (
                  <MathText text={content} className="whitespace-pre-wrap block" />
                ) : (
                  content.map((section, idx) => (
                    <div key={idx} className="space-y-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <h3 className="text-base font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                        <span>{idx + 1}.</span> {section.title}
                      </h3>
                      <MathText text={section.body} className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed block" />
                    </div>
                  ))
                )}
              </div>

              {/* Document Footer */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Generated with Study Stranger AI • Verified WBCHSE Board Syllabus Standard
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
