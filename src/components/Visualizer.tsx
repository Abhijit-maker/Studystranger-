import { motion } from "motion/react";
import { Bot } from "lucide-react";
import mahiAvatar from "../assets/images/mahi_avatar_1780353082547.png";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";

interface VisualizerProps {
  state: VisualizerState;
  characterName: string;
  currentVisual?: string;
  expression?: string;
}

export default function Visualizer({ state, characterName, currentVisual, expression }: VisualizerProps) {
  const getRingAnimation = (index: number, reverse: boolean = false) => {
    const baseSpeed = state === "listening" ? 3 : state === "processing" ? 1.5 : state === "speaking" ? 2 : 15;
    return {
      rotate: reverse ? [-360, 0] : [0, 360],
      transition: { duration: baseSpeed + index * 2, repeat: Infinity, ease: "linear" }
    };
  };

  const getPulseAnimation = () => {
    if (state === "speaking") {
      return {
        scale: [1, 1.02, 0.99, 1.01, 1],
        opacity: [0.3, 0.5, 0.3, 0.5, 0.3],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      };
    }
    if (state === "listening") {
      return {
        scale: [1, 1.02, 1],
        opacity: [0.7, 1, 0.7],
        transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
      };
    }
    if (state === "processing") {
      return {
        scale: [0.98, 1.02, 0.98],
        opacity: [0.6, 0.9, 0.6],
        transition: { duration: 0.8, repeat: Infinity, ease: "linear" }
      };
    }
    return {
      scale: [1, 1.01, 1],
      opacity: [0.4, 0.6, 0.4],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    };
  };

  // Cinematic color palette (Indigo/Emerald/Rose)
  const getTheme = () => {
    switch (state) {
      case "listening": return { color: "rgba(16, 185, 129, 0.8)", glow: "shadow-emerald-500/40", border: "border-emerald-500/40" };
      case "processing": return { color: "rgba(99, 102, 241, 0.8)", glow: "shadow-indigo-500/60", border: "border-indigo-500/40" };
      case "speaking": return { color: "rgba(244, 63, 94, 0.8)", glow: "shadow-rose-500/60", border: "border-rose-400/40" };
      default: return { color: "rgba(148, 163, 184, 0.3)", glow: "shadow-slate-300/20", border: "border-slate-300/30" };
    }
  };

  const theme = getTheme();

  return (
    <div className="absolute inset-0 flex items-center justify-center pb-24 md:pb-0 overflow-hidden pointer-events-none">
      {/* Ambient Glow */}
      <motion.div
        animate={getPulseAnimation() as any}
        className={`absolute w-[60%] h-[60%] rounded-full blur-[80px] ${theme.glow}`}
        style={{ backgroundColor: theme.color, opacity: 0.15 }}
      />

      {/* Ring 1: Massive Outer Dashed */}
      <motion.div
        animate={getRingAnimation(4, false) as any}
        className={`absolute w-[100%] h-[100%] rounded-full border-[1px] border-dashed ${theme.border} opacity-20`}
      />

      {/* Ring 2: Segmented Thick Ring */}
      <motion.div
        animate={getRingAnimation(3, true) as any}
        className={`absolute w-[85%] h-[85%] rounded-full border-[2px] border-dotted ${theme.border} opacity-30`}
      />

      {/* Ring 3: Scanner Ring (Solid with gaps) */}
      <motion.div
        animate={getRingAnimation(2, false) as any}
        className={`absolute w-[70%] h-[70%] rounded-full border-[1px] ${theme.border} border-t-transparent border-b-transparent opacity-40`}
      />

      {/* Ring 4: Inner Dashed */}
      <motion.div
        animate={getRingAnimation(1, true) as any}
        className={`absolute w-[55%] h-[55%] rounded-full border-[2px] border-dashed ${theme.border} opacity-50`}
      />
      
      {/* Ring 5: Core HUD Ring */}
      <motion.div
        animate={getRingAnimation(0, false) as any}
        className={`absolute w-[40%] h-[40%] rounded-full border-[4px] border-dotted ${theme.border} opacity-70`}
      />

      {/* Core Circle / Cinematic Square */}
      <motion.div
        animate={getPulseAnimation() as any}
        className={`absolute border-[1px] ${theme.border} bg-black/10 backdrop-blur-[2px] flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] w-[95%] h-[95%] max-w-[370px] max-h-[370px] md:max-w-[485px] md:max-h-[485px] aspect-square rounded-[2.5rem] md:rounded-[3rem] shadow-2xl`}
        style={{ boxShadow: `0 0 40px ${theme.color}, inset 0 0 30px ${theme.color}` }}
      >
        {/* Center Content */}
        {(() => {
          const avatarMapping: Record<string, string> = {
            stranger: "https://picsum.photos/seed/mentor/400/400",
            anjali: "https://picsum.photos/seed/anjali/400/400",
            zoya: "https://picsum.photos/seed/scholar/400/400",
            khud: "https://picsum.photos/seed/spirit/400/400",
            rohan: "https://picsum.photos/seed/student/400/400",
            ishani: "https://picsum.photos/seed/poet/400/400",
            mahi: currentVisual || mahiAvatar
          };

          const activeAvatar = avatarMapping[characterName.toLowerCase()] || "https://picsum.photos/seed/companion/400/400";
          
          return (
            <div className="relative w-full h-full rounded-[2.3rem] md:rounded-[2.8rem] overflow-hidden flex flex-col items-center justify-center">
              <img 
                src={activeAvatar} 
                alt={`${characterName} Partner`}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover rounded-[2.3rem] md:rounded-[2.8rem] select-none"
              />
              {/* Soft inner vignette/shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none rounded-[2.3rem] md:rounded-[2.8rem]" />
              
              {/* Mini HUD overlay for speaking/thinking status */}
              <div className="absolute bottom-4 flex flex-col items-center justify-center z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <span className="text-[10px] md:text-xs font-bold font-mono tracking-wider text-rose-300 uppercase">
                  {expression || (state === "idle" ? "idle" : state)}
                </span>
                <span className="text-[8px] md:text-[10px] text-white/60 tracking-[0.2em] uppercase mt-0.5">
                  {characterName}
                </span>
              </div>
            </div>
          );
        })()}
      </motion.div>
    </div>
  );
}

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
