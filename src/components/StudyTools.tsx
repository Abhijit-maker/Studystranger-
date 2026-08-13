import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ChevronLeft, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { Flashcard, QuizQuestion } from "../services/geminiService";
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

interface StudyToolsProps {
  type: "flashcards" | "quiz";
  data: any[];
  onClose: () => void;
  topic: string;
}

export const StudyTools: React.FC<StudyToolsProps> = ({ type, data, onClose, topic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handleQuizSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === (data[currentIndex] as QuizQuestion).correctAnswer) {
      setScore(score + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-serif text-emerald-400 capitalize">{type}</h2>
            <p className="text-xs text-white/40 font-mono uppercase tracking-widest mt-1">{topic}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center min-h-[400px]">
          {isFinished ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-emerald-400" size={40} />
              </div>
              <h3 className="text-2xl font-serif text-white mb-2">Session Complete!</h3>
              {type === "quiz" && (
                <p className="text-white/60 mb-8">You scored {score} out of {data.length}</p>
              )}
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-colors"
              >
                Back to Mentor
              </button>
            </motion.div>
          ) : type === "flashcards" ? (
            <div className="w-full max-w-md perspective-1000">
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="relative w-full aspect-[4/3] cursor-pointer preserve-3d"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-zinc-800 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-emerald-400/50 font-mono uppercase tracking-widest mb-4">Question</span>
                  <div className="text-xl text-white font-serif leading-relaxed">
                    <MathText text={(data[currentIndex] as Flashcard).question} />
                  </div>
                  <p className="mt-8 text-[10px] text-white/20 uppercase tracking-widest">Click to reveal answer</p>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 backface-hidden bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-4">Answer</span>
                  <div className="text-xl text-emerald-50 font-serif leading-relaxed">
                    <MathText text={(data[currentIndex] as Flashcard).answer} />
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="text-center mb-8">
                <span className="text-[10px] text-emerald-400/50 font-mono uppercase tracking-widest mb-2 block">Question {currentIndex + 1} of {data.length}</span>
                <div className="text-xl text-white font-serif leading-relaxed">
                  <MathText text={(data[currentIndex] as QuizQuestion).question} />
                </div>
              </div>

              <div className="grid gap-3">
                {(data[currentIndex] as QuizQuestion).options.map((option, idx) => {
                  const isCorrect = idx === (data[currentIndex] as QuizQuestion).correctAnswer;
                  const isSelected = selectedOption === idx;
                  
                  let borderColor = "border-white/5";
                  let bgColor = "bg-white/5";
                  let textColor = "text-white/70";

                  if (showExplanation) {
                    if (isCorrect) {
                      borderColor = "border-emerald-500/50";
                      bgColor = "bg-emerald-500/10";
                      textColor = "text-emerald-400";
                    } else if (isSelected) {
                      borderColor = "border-rose-500/50";
                      bgColor = "bg-rose-500/10";
                      textColor = "text-rose-400";
                    }
                  } else if (isSelected) {
                    borderColor = "border-emerald-500/50";
                    bgColor = "bg-emerald-500/5";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizSelect(idx)}
                      disabled={showExplanation}
                      className={`w-full p-4 rounded-2xl border ${borderColor} ${bgColor} ${textColor} text-left transition-all hover:bg-white/10 flex items-center justify-between group`}
                    >
                      <MathText text={option} />
                      {showExplanation && isCorrect && <CheckCircle2 size={18} className="text-emerald-400" />}
                      {showExplanation && isSelected && !isCorrect && <AlertCircle size={18} className="text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl"
                  >
                    <p className="text-xs text-emerald-400/70 font-mono uppercase tracking-widest mb-2">Explanation</p>
                    <div className="text-sm text-white/60 italic">
                      <MathText text={(data[currentIndex] as QuizQuestion).explanation} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isFinished && (
          <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-white/5 rounded-full text-white/70 hover:text-white transition-all flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
              >
                {currentIndex === data.length - 1 ? "Finish" : "Next"}
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              {currentIndex + 1} / {data.length}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}} />
    </motion.div>
  );
};
