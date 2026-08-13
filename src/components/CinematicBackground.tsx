import React from "react";
import { motion } from "motion/react";
import { CharacterType } from "../services/liveService";

interface CinematicBackgroundProps {
  character: CharacterType;
  state: "idle" | "listening" | "processing" | "speaking";
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({ state }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#FCFAF7]">
      {/* Exquisite Topographic/Abstract Waves on a Soft Peach/Biscuit Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FCFAF7] via-[#FAF3EB] to-[#FCEFE3]" />

      {/* Dynamic Ambient Color Splashes inside top left/right like in the designer images */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#E5DEFF]/40 blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFEADA]/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#F3EBE3]/60 blur-[140px] pointer-events-none" />

      {/* SVG Topographic/Abstract Contour lines matching the reference screenshots */}
      <svg className="absolute inset-0 w-full h-full opacity-65 text-[#EBDBCC]/45" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="1.5" fill="none">
          {/* Wave 1 */}
          <motion.path 
            animate={{ d: [
              "M-200,100 C150,-100 400,200 900,50 C1400,-100 1600,300 2100,200",
              "M-200,120 C180,-70 380,230 920,30 C1380,-80 1620,280 2100,220",
              "M-200,100 C150,-100 400,200 900,50 C1400,-100 1600,300 2100,200"
            ]}}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            d="M-200,100 C150,-100 400,200 900,50 C1400,-100 1600,300 2100,200" 
          />
          {/* Wave 2 */}
          <motion.path 
            animate={{ d: [
              "M-200,200 C200,0 450,300 1000,150 C1500,0 1700,450 2100,350",
              "M-200,180 C220,20 430,280 1020,170 C1480,-20 1720,430 2100,330",
              "M-200,200 C200,0 450,300 1000,150 C1500,0 1700,450 2100,350"
            ]}}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            d="M-200,200 C200,0 450,300 1000,150 C1500,0 1700,450 2100,350" 
          />
          {/* Wave 3 */}
          <motion.path 
            animate={{ d: [
              "M-200,350 C250,150 500,450 1100,300 C1600,150 1800,600 2100,500",
              "M-200,370 C230,130 520,470 1080,280 C1620,170 1780,580 2100,520",
              "M-200,350 C250,150 500,450 1100,300 C1600,150 1800,600 2100,500"
            ]}}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            d="M-200,350 C250,150 500,450 1100,300 C1600,150 1800,600 2100,500" 
          />
          {/* Wave 4 */}
          <motion.path 
            animate={{ d: [
              "M-200,550 C300,350 600,600 1200,450 C1700,300 1900,750 2100,650",
              "M-200,530 C320,370 580,580 1220,470 C1680,280 1920,730 2100,670",
              "M-200,550 C300,350 600,600 1200,450 C1700,300 1900,750 2100,650"
            ]}}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            d="M-200,550 C300,350 600,600 1200,450 C1700,300 1900,750 2100,650" 
          />
          {/* Wave 5 (Deep) */}
          <motion.path 
            animate={{ d: [
              "M-200,750 C400,550 700,800 1300,650 C1850,500 2000,900 2100,850",
              "M-200,770 C380,530 720,780 1280,670 C1870,480 1980,920 2100,830",
              "M-200,750 C400,550 700,800 1300,650 C1850,500 2000,900 2100,850"
            ]}}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            d="M-200,750 C400,550 700,800 1300,650 C1850,500 2000,900 2100,850" 
          />
        </g>
      </svg>

      {/* Film Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

      {/* Dynamic Blur Overlay with Peach overlay when state changes */}
      <motion.div 
        animate={{ 
          backdropFilter: state === "processing" ? "blur(6px)" : "blur(0px)",
          backgroundColor: state === "processing" ? "rgba(250,243,235,0.4)" : "rgba(250,243,235,0.0)"
        }}
        className="absolute inset-0 transition-all duration-700"
      />

      {/* Soft warm light beam */}
      <motion.div
        animate={{
          opacity: [0.15, 0.25, 0.15],
          x: [-50, 50, -50],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-[150%] h-full bg-gradient-to-r from-transparent via-[#F27438]/5 to-transparent blur-[140px]"
      />
    </div>
  );
};
