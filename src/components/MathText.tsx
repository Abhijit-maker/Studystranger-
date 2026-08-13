import React from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Robust MathText component that handles both plain text and LaTeX ($...$ or $$...$$).
 * Includes automatic brace-fixing and error handling.
 */
export const MathText: React.FC<MathTextProps> = ({ text, className }) => {
  if (!text) return null;

  // Clean up $ delimiters if they are weirdly escaped by AI (sometimes happens)
  let cleanText = text
    .replace(/\\\[/g, "$$")
    .replace(/\\\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\\\)/g, "$")
    .replace(/\\\\\$/g, "$")
    .replace(/\\\$/g, "$");
  
  // Split by $$...$$ or $...$
  const parts = cleanText.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        
        try {
          // Handle Block Math
          if (part.startsWith("$$") && part.endsWith("$$")) {
            let math = part.slice(2, -2).trim();
            if (!math) return null;
            
            // Basic fix for common AI LaTeX errors (unbalanced braces)
            const openBraces = (math.match(/\{/g) || []).length;
            const closeBraces = (math.match(/\}/g) || []).length;
            if (openBraces > closeBraces) {
              math += "}".repeat(openBraces - closeBraces);
            }
            
            return <BlockMath key={i} math={math} />;
          } 
          
          // Handle Inline Math
          if (part.startsWith("$") && part.endsWith("$")) {
            let math = part.slice(1, -1).trim();
            if (!math) return null;

            const openBraces = (math.match(/\{/g) || []).length;
            const closeBraces = (math.match(/\}/g) || []).length;
            if (openBraces > closeBraces) {
              math += "}".repeat(openBraces - closeBraces);
            }

            return <InlineMath key={i} math={math} />;
          }

          // Check for raw LaTeX indicators in the text part if it looks like it escaped the regex
          // This is a safety net for cases where AI might skip delimiters
          if (/\\frac|\\sqrt|\\sum|\\int|\\times|\\div|\^|\_|\{/.test(part) && part.length > 5) {
             return <InlineMath key={i} math={part} />;
          }
        } catch (err) {
          console.error("KaTeX Error:", err);
          // Fallback to plain text if KaTeX fails
          return <span key={i} className="font-mono text-xs opacity-70">[{part.replace(/\$/g, '')}]</span>;
        }

        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};
