import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, Image as ImageIcon, Sparkles, Brain, Upload, CheckCircle2, ChevronRight, AlertCircle, FileText } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { safeJsonParse } from "../services/geminiService";
import { MathText } from "./MathText";

interface GeneratedMCQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const SmartScanner: React.FC<{ onClose: () => void; apiKey?: string; onScanned?: (topic: string) => void }> = ({ onClose, apiKey, onScanned }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mcqs, setMcqs] = useState<GeneratedMCQ[]>([]);
  const [currentView, setCurrentView] = useState<"upload" | "processing" | "result">("upload");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        stopCamera();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMCQs = async () => {
    if (!image) return;
    setIsLoading(true);
    setCurrentView("processing");

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
      const base64Data = image.split(',')[1];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: base64Data } },
              { text: "Analyze this image. It is a study note or textbook page for WBCHSE Class 12, potentially in Bengali or English. If it is handwritten, decode the relevant academic concepts carefully. Generate 5 high-quality MCQs at Board/WBCHSE level based on the content. Output in JSON format only with questions and explanations in the language of the source text (Bunglish/Bengali/English)." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctIndex", "explanation"]
            }
          }
        }
      });

      const responseText = response.text || "[]";
      const data = safeJsonParse(responseText);
      setMcqs(data || []);
      setCurrentView("result");
      if (onScanned) onScanned("New note scan");
    } catch (error) {
      console.error("Scanner Error:", error);
      alert("Error generating questions. Please try again.");
      setCurrentView("upload");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl"
    >
      <div className="bg-white w-full max-w-2xl h-full md:h-[80vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-none">Smart Scanner</h2>
              <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-2">Convert Notes to MCQs</p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm"
          >
            <X size={18} className="md:w-6 md:h-6" />
          </button>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/30">
          <AnimatePresence mode="wait">
            {currentView === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center py-4"
              >
                {!image ? (
                  <div className="w-full max-w-sm space-y-4">
                    {isCameraActive ? (
                      <div className="relative w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
                          <button 
                            onClick={stopCamera}
                            className="p-4 bg-slate-900/80 backdrop-blur-md text-white rounded-2xl hover:bg-rose-500"
                          >
                            <X size={20} />
                          </button>
                          <button 
                            onClick={takePhoto}
                            className="w-16 h-16 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-full" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div 
                          onClick={startCamera}
                          className="w-full p-8 bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-200 hover:bg-blue-50/20 transition-all gap-4 group"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera size={32} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-700">Open Camera</p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Take photo of your book</p>
                          </div>
                        </div>

                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full p-8 bg-white/50 border-2 border-slate-100 rounded-[2.5rem] flex items-center justify-center gap-4 cursor-pointer hover:bg-white hover:border-indigo-100 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-600">Upload from Gallery</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-sm space-y-6">
                    <div className="relative group">
                       <img src={image} className="w-full aspect-[3/4] object-cover rounded-[2.5rem] shadow-xl border border-white" alt="Note Preview" />
                       <button 
                        onClick={() => setImage(null)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-900/80 text-white backdrop-blur-md flex items-center justify-center hover:bg-rose-500 transition-all"
                       >
                         <X size={16} />
                       </button>
                    </div>
                    <button 
                      onClick={generateMCQs}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                    >
                      <Sparkles size={18} /> Generate 5 Questions
                    </button>
                  </div>
                )}
                
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            )}

            {currentView === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                    <Brain size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800">Analyzing Your Notes</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating high-quality MCQs...</p>
                </div>
              </motion.div>
            )}

            {currentView === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Generated Quiz</h3>
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase border border-emerald-100">
                    5 Questions Ready
                  </div>
                </div>

                <div className="space-y-4">
                  {mcqs.map((mcq, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-4 group"
                    >
                      <div className="flex gap-4">
                         <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">
                           {i + 1}
                         </div>
                         <p className="text-sm font-bold text-slate-800 pt-1 leading-relaxed">
                           <MathText text={mcq.question} />
                         </p>
                      </div>
                      
                      <div className="grid gap-2 pl-12">
                        {mcq.options.map((opt, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-xl border text-[11px] font-bold ${
                              idx === mcq.correctIndex ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-500"
                            }`}
                          >
                             <MathText text={opt} />
                          </div>
                        ))}
                      </div>

                      <div className="pl-12 pt-4 border-t border-slate-50 flex items-center gap-2">
                         <AlertCircle size={14} className="text-blue-500" />
                         <p className="text-[10px] font-bold text-slate-400 leading-tight">
                           <MathText text={mcq.explanation} />
                         </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentView("upload")}
                  className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-slate-100 hover:bg-white hover:text-slate-900 transition-all mt-8"
                >
                  Scan Another Page
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
