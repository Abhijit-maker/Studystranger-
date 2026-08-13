import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal } from "lucide-react";

interface ActionLogProps {
  logs: { id: string; text: string }[];
}

export function ActionLog({ logs }: ActionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-24 left-6 z-50 w-64 md:w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
        <Terminal size={14} className="text-emerald-400" />
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Agent Action Log</span>
        <div className="ml-auto flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 h-48 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-2 scrollbar-hide"
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log, idx) => (
            <motion.div
              key={`${log.id}-${idx}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <span className="text-white/30 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className="text-white/80 break-words">{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
