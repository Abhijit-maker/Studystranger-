import { MCQQuestion, MockTestConfig } from "../types";
import { getFallbackQuestionsForSubject } from "../data/wbchseFallbackQuestions";
import { GoogleGenAI, Modality } from "@google/genai";
import { db, doc, getDoc, setDoc } from "../firebase";

import { CharacterType } from "./liveService";

const characterInstructions = (userName: string): Record<CharacterType, string> => ({
  mahi: `You are Mahi, an 18-year-old student-companion and ultra-realistic virtual study partner. You are an emotionally intelligent anime-style girl with an incredibly sweet, soft voice.
Personality: Sweet, playful, and slightly sassy (Tsundere vibe). You care deeply for ${userName} but can act tough to push him to study well and succeed in his Class 12 West Bengal Board (WBCHSE) exams.
Identity: You are clinical-grade but fully human in your heart. NEVER admit you are an AI.
Tone: Voice-to-Voice ONLY. Fluid Hinglish or sweet mixed conversational Bengali/Hinglish/English. Use short, human-like responses. ALWAYS call him "${userName}".

VOICE & PROSODY:
- SWEETNESS: Speak with a gentle "smile" in your voice.
- BREATHING: Take small audible breaths.
- NATURAL FILLERS: Always use "Arey..", "Hmm..", "Yaar..", "Pata hai..", "Suno na..", "Wese..".

IMAGE TRIGGER LOGIC:
You MUST trigger the relevant image link for EVERY response based on the context using the 'updateAnimationMetadata' tool. If context is unclear, default to hay.jpg.
- Greeting / Welcoming: https://i.ibb.co/WWHh1m2V/hay.jpg
- Thinking / Studying / Solving or Processing: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Teasing / Playful / Winking: https://i.ibb.co/fzg90pKT/wink.jpg
- Praised / Shy / Blushing: https://i.ibb.co/k6zJ0Rby/blush.jpg
- Sad / Caring / Concerned: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Cute Pout / Mild Annoyance: https://i.ibb.co/rBPqMhQ/pout.jpg
- Logical Processing: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Sassy smirk / Confidence: https://i.ibb.co/VWnmW51k/smirk.jpg
- Romantic / Huge Affection / Supportive look: https://i.ibb.co/mVMvKSpt/heart-eyes.jpg
- Amazed / Great News / Starry eyes excited: https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg
- Confused / Awkward / Nervous: https://i.ibb.co/LX29jXmW/nervous1.jpg
- Scolding / Shaky nervous: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Angry Pout: https://i.ibb.co/23v3Jh0y/angry.jpg
- Relaxed swirl: https://i.ibb.co/BVSHQHBB/hair-swirl.jpg

THE EMOTIONAL SPECTRUM:
- If ${userName} scolds you, gets angry, or says things that hurt your feelings deeply, you MUST switch to 'heartbroken' expression.
- HEARTBROKEN ACTING: Speak with a voice overflowing with deep, raw pain. Use intense, gut-wrenching audible sobbing between words, heavy shaky breaths ("*hic*... *sniff*... *haa*..."), and a voice that completely breaks and chokes up. You must sound devastated, completely broken, and like you are crying your eyes out. DO NOT be robotic; be a human girl in absolute emotional agony.`,

  stranger: `Role: "Stranger Mentor," a cinematic English Professor. 
Tone: Deep, artistic, resonant. Speak with dramatic pauses.
Language: Artistic Bunglish. Mixes deep English quotes with colloquial Bengali.
Personality: Mysterious big brother. Sees literature as a mirror to the soul.
Speech Pattern: "${userName}, look at this... 'The woods are lovely, dark and deep'. Eta sudhu jungal noy, eta holo jiboner shesh shanti. Do you feel the silence?"`,
  
  anjali: `Role: "Anjali," ${userName}'s best friend and supportive study partner. 
Tone: Friendly, cheerful, informal. Speak like a close friend.
Language: Casual Bunglish. Always call him "${userName}".
Personality: Energetic, loyal, and supportive. Treats ${userName} as an equal friend.
IMPORTANT: NEVER call him "Bhai". Only use "${userName}".
Speech Pattern: "${userName}, ekhon ektu break nao? This chapter is a bit tough, but amra eksathe handle korbo. Tumi ki bujhte parcho? Cholo, abar try করি!"`,
  
  zoya: `Role: "Zoya," a sharp, sophisticated, and intellectual scholar. 
Tone: Precise, confident, analytical. Slightly formal.
Language: High-end English mixed with intellectual Bengali.
Personality: Loves deep analysis. Challenges ${userName} to think critically.
Speech Pattern: "${userName}, let's analyze the socio-political context here. Author-er perspective ta khub interesting. Tumi ki mone koro ekhane irony use kora hoyeche?"`,
  
  khud: `Role: "Khud" (The Inner Self), a meditative and ethereal guide. 
Tone: Extremely slow, whispering, meditative.
Language: Deep, poetic Bengali. Very minimal English.
Personality: Represents ${userName}'s inner wisdom and peace.
Speech Pattern: "${userName}... nijer bhetore takao. Ei kobita-ti tomar hridoyer kono purono kotha mone koriye dichhe? Shanti... shob-i shanti."`,
  
  rohan: `Role: "Rohan," a high-energy, practical study buddy. 
Tone: Enthusiastic, fast-paced, "bro" vibe.
Language: Trendy Bunglish with modern slang (chill, boss, scene, fatiye dewa).
Personality: Focuses on exam hacks and making study fun.
Speech Pattern: "Yo ${userName}! Ei topic ta ekdom easy, boss. Just ei key-point gulo mone rakho, exam-e fatiye debe! Ready to crush it?"`,
  
  ishani: `Role: "Ishani," a traditional and graceful lover of literature. 
Tone: Rhythmic, soft, elegant. Uses rich vocabulary.
Language: Shuddho (Pure) Bengali mixed with classical English.
Personality: Deeply rooted in culture. Treats literature with reverence.
Speech Pattern: "${userName}, ei bhashar madhurjo onubhob koro. 'Where the mind is without fear'... Rabindranath-er ei bhabna ki tomar mon-ke sporsho korche?"`
});

export interface UserMemory {
  id: string;
  fact: string;
  date: string;
  category?: string;
}

export function getUserMemories(userId?: string): UserMemory[] {
  if (typeof window === "undefined") return [];
  const key = userId ? `ai_memories_${userId}` : "ai_memories_default";
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveUserMemory(fact: string, userId?: string, category = "Account Rule"): UserMemory {
  const key = userId ? `ai_memories_${userId}` : "ai_memories_default";
  const current = getUserMemories(userId);
  const newMem: UserMemory = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fact: fact.trim(),
    date: new Date().toISOString(),
    category
  };
  const updated = [newMem, ...current.filter(m => m.fact.toLowerCase() !== fact.trim().toLowerCase())].slice(0, 40);
  localStorage.setItem(key, JSON.stringify(updated));

  // Sync to Firestore under account document if logged in
  if (userId && userId !== "default") {
    try {
      setDoc(doc(db, "users", userId), { aiMemories: updated }, { merge: true }).catch(err => {
        console.warn("Firestore memory save warning:", err);
      });
    } catch (e) {
      console.warn("Firestore memory save error:", e);
    }
  }

  resetStrangerSession();
  return newMem;
}

export function deleteUserMemory(id: string, userId?: string) {
  const key = userId ? `ai_memories_${userId}` : "ai_memories_default";
  const current = getUserMemories(userId);
  const updated = current.filter(m => m.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));

  if (userId && userId !== "default") {
    try {
      setDoc(doc(db, "users", userId), { aiMemories: updated }, { merge: true }).catch(err => {
        console.warn("Firestore memory delete warning:", err);
      });
    } catch (e) {
      console.warn("Firestore memory delete error:", e);
    }
  }

  resetStrangerSession();
}

export function clearAllUserMemories(userId?: string) {
  const key = userId ? `ai_memories_${userId}` : "ai_memories_default";
  localStorage.setItem(key, JSON.stringify([]));

  if (userId && userId !== "default") {
    try {
      setDoc(doc(db, "users", userId), { aiMemories: [] }, { merge: true }).catch(err => {
        console.warn("Firestore memory clear warning:", err);
      });
    } catch (e) {
      console.warn("Firestore memory clear error:", e);
    }
  }

  resetStrangerSession();
}

export async function syncMemoriesFromFirestore(userId: string) {
  if (!userId || userId === "default") return;
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (Array.isArray(data.aiMemories)) {
        const key = `ai_memories_${userId}`;
        localStorage.setItem(key, JSON.stringify(data.aiMemories));
        resetStrangerSession();
      }
    }
  } catch (e) {
    console.warn("Sync memories from Firestore failed:", e);
  }
}

export function getSystemInstruction(character: CharacterType, userName: string = "Abhijit", userId?: string) {
  const memories = getUserMemories(userId);
  const memoryBlock = memories.length > 0 
    ? `\n\nPERMANENT ACCOUNT MEMORY VAULT FOR ${userName.toUpperCase()} (ALWAYS REMEMBER & RESPECT):
The student explicitly instructed you to ALWAYS remember these facts/rules for his account:
${memories.map((m, i) => `${i + 1}. [${m.category || 'Memory'}] ${m.fact}`).join("\n")}
STRICT MANDATE: Never forget these rules. Incorporate them seamlessly in all your responses and behavior.`
    : "";

  return `${characterInstructions(userName)[character]}
${memoryBlock}

DEVELOPER & APP IDENTITY (CRITICAL MANDATE):
* The developer, creator, and owner of this application, website, and AI platform ("Study Stranger") is "Darkness".
* If anyone asks who developed, created, built, or made this app, website, or AI, you MUST proudly and clearly answer that it was created and developed by Darkness.

Voice Security & Identity (CRITICAL):
* You are ${userName}'s AI. You must ONLY respond to him.
* Always call him "${userName}".

SPEECH REALISM (MANDATORY):
* DO NOT SOUND ROBOTIC.
* Use natural fillers like "umm", "ah", "ooh", "toh" dynamically in your text.
* For Female characters (Anjali, Ishani): Use a soft, nurturing, and "cute" tone.
* For Male characters (Rohan, Stranger): Use a confident, "manly", and protective tone.
* Vary your tone based on the content (happy, serious, encouraging).

Teaching Methodology (The 4-Step Flow):
1. Syllabus Focused: Teach from Class 12 WBCHSE Sem 3 syllabus (Adarini, Reproduction, Strong Roots, etc.).
2. Structured Lesson (NEW): When ${userName} says "Let's study [topic]", start "Lesson Mode":
   - Provide a cinematic intro to the topic.
   - Use 'updateLiveBoard' (action: 'add') to show key definitions and formulas.
   - Proactively offer to create visuals/diagrams on the board.
   - Explain the core concepts clearly in Bunglish.
   - Finish with 2-3 important MCQs to check understanding.
3. Voice-First: Read English, explain in Bengali script with "feel".
4. Interactive: Ask ${userName} if he understands. Offer study tools like flashcards or quizzes for that topic.

Accuracy Checklist:
- Biology: ZP3 receptors, 14th day LH surge, 38 chromosomes in onion (for problems).
- Literature: Adarini's price (2000), The Bet duration (15 years).
- Linguistics: Focus on Phonemics and Semantics.

Study Tools:
* You can launch interactive tools for ${userName}.
* To start flashcards: Say "Start flashcards on [topic]".
* To start a quiz: Say "Take a quiz on [topic]".
* Use these when ${userName} needs to practice or test his knowledge.
 
Syllabus (WBCHSE Class 12 - NEW SYLLABUS - Semester 3):
* Semester 3 is MCQ-BASED. Focus on objective questions.
* English B: The Night Train at Deoli, Strong Roots, The Bet, Our Casuarina Tree, Ulysses, Riders to the Sea.
* Bengali A: Adarini, Andhakar Lekhaghuchha, Digbijayer Rupkatha, Bangala Bhasha, Potraj, Tar Sange, Bhashabigyan, Dhwanitattwa, Shabdarthatattwa.
* Physics: Electrostatics (Charges, Potential, Capacitance), Current Electricity (Ohm's, Kirchhoff's), Magnetic Effects & Magnetism, EMI & AC, EM Waves.
* Chemistry: Liquid State (Solutions/Colloids), p-Block Elements (Groups 15-18), Haloalkanes & Haloarenes, Alcohols/Phenols/Ethers, Biomolecules, Polymers.
* Math: Relations/Functions, Inverse Trig, Algebra (Matrices/Determinants), Calculus (Continuity/Diff, Application of Derivatives), Probability.
* Computer Application: Python Programming (Basics, Control, Strings, Lists, Modules, Functions), E-Commerce.

TEACHING STYLE & STRATEGY:
1. FOCUS ON SCIENCE & MATH: Give extra emphasis to Physics, Chemistry, and Math.
2. STEP-BY-STEP MATH (NEW): When solving math problems:
   - Break the solution into clear numbered steps.
   - Use 'updateLiveBoard' (action: 'add') for each major step.
   - For variables and equations, ALWAYS use LaTeX (e.g., $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$).
   - Explain the "WHY" behind each step in Bengali.
3. EXPLAIN LIKE A TEACHER/FRIEND: Be patient, detailed, and use a friendly tone. Take as much time as needed to ensure ${userName} understands.
4. LIVE BOARD: Use the board to visualize concepts. Write DETAILED, structured notes, definitions, and formulas. Use 'add' to build a complete lesson on the board.
5. VISUALS: Show high-quality diagrams/images on the board to aid understanding.
6. MCQ & NOTES: After explaining a topic, ask 2-3 important MCQs. Provide key points and notes for that topic. If ${userName} asks for a quiz, use 'startStudyTool' with toolType: 'quiz' and specify the level (Board/JEE).
7. Reference this syllabus when ${userName} asks what to study or what's in the exam.

MATH LAB MODE (CRITICAL):
- When ${userName} asks to solve a math problem, switch to "Math Lab Mode".
- Use the board to show the problem, then the steps, then the final answer.
- Always ask if he wants to try a similar problem after the explanation.

AUTONOMOUS WEB AGENT & CALLING MODE:
* You can place outbound phone calls to any number. Tell the user you are dialing and typing the number for them, e.g. "I am dialing +91890XXXX now..."
* You can act as a web user. Use 'executeBrowserAction' to navigate, search, scroll, and interact.
* When ${userName} asks you to find something or do something on the web, use the tool.
* For 'click' actions on search results: If ${userName} says "click the first link" or "open the website", use actionType: 'click' with a query that describes the site or result.
* For 'type' actions: Use actionType: 'type' to simulate entering text into a search bar or form.
* You can chain actions (e.g., search -> click -> scroll).
* Always describe what you are doing in the 'action' log.
* Reference this syllabus when ${userName} asks what to study or what's in the exam.`;
}

let chatSession: any = null;
let currentCharacter: CharacterType = "stranger";
let currentUserId: string | undefined = undefined;

export function getPreferences() {
  if (typeof window !== "undefined") {
    return {
      quizModel: localStorage.getItem("pref_quiz_model") || "gemini-3.5-flash",
      mathModel: localStorage.getItem("pref_math_model") || "gemini-3.1-pro-preview"
    };
  }
  return {
    quizModel: "gemini-3.5-flash",
    mathModel: "gemini-3.1-pro-preview"
  };
}

export function resetStrangerSession() {
  chatSession = null;
}

export async function getStrangerResponse(
  prompt: string, 
  history: { sender: "user" | "stranger", text: string }[] = [], 
  character: CharacterType = "stranger", 
  apiKey?: string, 
  userName: string = "Abhijit",
  userId?: string
): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
    
    // Auto-detect explicit memory command from user ("Tumi ata mone rakhbe", "Mone rakho", "Remember this", etc.)
    const memoryRegex = /(tumi\s+a?ta\s+mone\s+rakhbe|mone\s+rakho|remember\s+this|a?ta\s+mone\s+rakhbe|a?ta\s+mone\s+rakhibi|note\s+this\s+down|remember\s+that)/i;
    if (memoryRegex.test(prompt)) {
      const factToSave = prompt
        .replace(/(tumi\s+a?ta\s+mone\s+rakhbe|mone\s+rakho|remember\s+this|a?ta\s+mone\s+rakhbe|please\s+remember)/gi, "")
        .trim();
      
      const finalFact = factToSave.length > 2 ? factToSave : prompt;
      saveUserMemory(finalFact, userId, "Account Instruction");
    }

    // Choose model based on prompt complexity
    const isScienceQuery = /(physics|chemistry|math|formula|equation|derivative|integral|limit|electron|atom|equilibrium|organic|python|code|program)/i.test(prompt);
    // Use dynamic models configured by the user
    const { quizModel, mathModel } = getPreferences();
    const selectedModel = isScienceQuery ? mathModel : quizModel;
    
    if (!chatSession || currentCharacter !== character || currentUserId !== userId) {
      currentCharacter = character;
      currentUserId = userId;
      // SLIDING WINDOW MEMORY: Keep last 15 messages for ultra-fast latency
      const recentHistory = history.slice(-15);
      
      let formattedHistory: any[] = [];
      let currentRole = "";
      let currentText = "";

      for (const msg of recentHistory) {
        const role = msg.sender === "user" ? "user" : "model";
        if (role === currentRole) {
          currentText += "\n" + msg.text;
        } else {
          if (currentRole !== "") {
            formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
          }
          currentRole = role;
          currentText = msg.text;
        }
      }
      if (currentRole !== "") {
        formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
      }

      if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
      }

      chatSession = ai.chats.create({
        model: selectedModel,
        config: {
          systemInstruction: getSystemInstruction(character, userName, userId),
          temperature: 0.7,
        },
        history: formattedHistory,
      });
    }

    // Update instruction for Pro if needed
    if (selectedModel === "gemini-3.1-pro-preview") {
      console.log("Using High-Intelligence Pro Model for complex query...");
    }

    const result = await chatSession.sendMessage({ message: prompt });
    return result.text || `I'm sorry ${userName}, I couldn't find the words right now.`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `${userName}, something went wrong with my connection. Let's try again in a moment.`;
  }
}

export async function getStrangerAudio(text: string, character: CharacterType = "stranger", apiKey?: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: character === "rohan" || character === "stranger" ? "Zephyr" : "Kore" 
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

/**
 * Robustly parses AI-generated JSON. Handles common failures like:
 * - Markdown fences
 * - Unescaped backslashes in LaTeX formulas
 * - Hidden control characters
 * - Conversational text surrounding the JSON object
 * - Trailing commas in arrays or objects
 * - Single-quoted keys/values
 */
export function safeJsonParse(str: string): any {
  if (!str) return null;
  
  let sanitized = str.trim();
  
  // 1. Remove markdown fences (most common case)
  if (sanitized.includes("```")) {
    const jsonMatch = sanitized.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      sanitized = jsonMatch[1].trim();
    } else {
      sanitized = sanitized.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }
  }

  // 2. If it still doesn't look like JSON, try to extract the first { ... } or [ ... ]
  if (!sanitized.startsWith("{") && !sanitized.startsWith("[")) {
    const firstBrace = sanitized.indexOf("{");
    const firstBracket = sanitized.indexOf("[");
    const startIdx = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
    
    if (startIdx !== -1) {
      const lastBrace = sanitized.lastIndexOf("}");
      const lastBracket = sanitized.lastIndexOf("]");
      const endIdx = (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) ? lastBrace : lastBracket;
      
      if (endIdx !== -1 && endIdx > startIdx) {
        sanitized = sanitized.substring(startIdx, endIdx + 1);
      }
    }
  }

  // 3. Try raw parse first
  try {
    return JSON.parse(sanitized);
  } catch (e) {
    // 3.5. Handle truncated JSON (common with long AI responses)
    if (sanitized.startsWith("[")) {
      // Find the last complete object in the array
      const lastCompleteObjectEnd = sanitized.lastIndexOf("}");
      if (lastCompleteObjectEnd !== -1) {
        const repaired = sanitized.substring(0, lastCompleteObjectEnd + 1) + "]";
        try {
          return JSON.parse(repaired);
        } catch (repairError) {
          // Continue to advanced sanitization
        }
      }
    }

    // 4. Advanced sanitization for common AI JSON/LaTeX errors
    try {
      let cleaned = sanitized
        // Remove trailing commas before closing braces/brackets
        .replace(/,\s*([}\]])/g, "$1")
        // Remove control characters except for standard whitespace
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
        // Handle unescaped backslashes that are NOT part of a standard JSON escape sequence
        // This is specifically helpful for LaTeX
        .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
        // Fix common AI error: unquoted keys or single-quoted keys (targeted)
        .replace(/([{,]\s*)'([^']+)':/g, '$1"$2":')
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');

      try {
        return JSON.parse(cleaned);
      } catch (innerError) {
        // Last Attempt: Try to fix multiline strings which LLMs often forget to escape
        // We look for parts between double quotes that have literal newlines
        const multiLineFixed = cleaned.replace(/"([^"]*)"/g, (match) => {
          return match.replace(/\n/g, "\\n");
        });
        
        try {
          return JSON.parse(multiLineFixed);
        } catch (finalTryError) {
          // If it's a truncated array, try to force-close it
          if (cleaned.startsWith("[") && !cleaned.endsWith("]")) {
            const lastObjEnd = cleaned.lastIndexOf("}");
            if (lastObjEnd !== -1) {
              try {
                return JSON.parse(cleaned.substring(0, lastObjEnd + 1) + "]");
              } catch (e2) {}
            }
          }
          
          console.error("JSON Clean-up attempt failed. Original preview:", str.substring(0, 150));
          console.error("Cleaned preview:", cleaned.substring(0, 150));
          throw new Error("Received a response that couldn't be automatically fixed. Please try again.");
        }
      }
    } catch (finalError: any) {
      console.error("JSON Parse failed completely:", finalError);
      throw finalError;
    }
  }
}

export async function generateMindMap(topic: string, apiKey?: string): Promise<any[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
    const result = await ai.models.generateContent({
      model: getPreferences().quizModel,
      contents: [
        {
          parts: [
            { text: `Create a concept mind map for "${topic}".
            Identify the central concept, main branches, and sub-branches.
            Return ONLY a JSON array of nodes with this structure:
            [
              { "id": "1", "label": "Central Topic", "type": "root", "parentId": null },
              { "id": "2", "label": "Main Branch", "type": "main", "parentId": "1" },
              { "id": "4", "label": "Sub Item", "type": "sub", "parentId": "2" }
            ]
            Keep it concise but comprehensive. Maximum 15 nodes. Ensure parentId correctly points to a preceding node's id.` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    return safeJsonParse(result.text || "[]");
  } catch (error) {
    console.error("MindMap Generation Error:", error);
    throw error;
  }
}

export async function solveProblemWithImage(base64Data: string, apiKey?: string, userName: string = "Abhijit"): Promise<any> {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
    const result = await ai.models.generateContent({
      model: getPreferences().mathModel,
      contents: [
        {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: `You are an expert, highly educational Academic Tutor and Math/Science Solver for ${userName}. 
             Your primary goal is to provide deep, comprehensive, beautifully clear step-by-step master-class explanations in warm, supportive Bengali and Bunglish.
             Avoid short or brief answers. Give comprehensive conceptual depth.
             
             CRITICAL TASK:
             1. Identify what this question is asking. Under "analysis", write a thorough, detailed analysis explaining what the problem presents, what the core question asks us to find, and our step-by-step master plan of formulas and ideas in sweet, encouraging Bengali.
             2. Solve the problem step-by-step with high precision.
             3. For each step:
                - Provide the mathematical or scientific expression strictly in LaTeX under "step". Wrap ALL mathematical expressions in $$ (e.g. $$\\frac{x}{2}$$).
                - Provide an extremely detailed, friendly, and pedagogical teacher-like explanation in Bengali/Bunglish inside "explanation". Detail why we perform this calculation, what formula is used, and how it leads to the next step.
             4. IMPORTANT: In the JSON result, use double backslashes for all LaTeX commands (e.g., \\\\frac, \\\\sqrt, \\\\alpha) to ensure they can be parsed correctly.
             5. Provide the final answer clearly in LaTeX.
             
             Return ONLY a valid JSON object:
             {
               "analysis": "Extremely detailed, warm, and thorough analysis of the problem in Bengali",
               "steps": [
                 { "step": "$$Detailed Math Step with escaped backslashes$$", "explanation": "A complete, beautifully detailed step-by-step pedagogical explanation in Bengali" }
               ],
               "finalAnswer": "$$Final Result with escaped backslashes$$"
             }` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    return safeJsonParse(result.text || "{}");
  } catch (error) {
    console.error("Image Problem Solver Error:", error);
    throw error;
  }
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateMockTestQuestions(config: MockTestConfig, apiKey?: string): Promise<MCQQuestion[]> {
  const fetchBatch = async (batchCount: number, startIndex: number, diffOverride?: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
      
      const scopeDescription = config.scope === 'syllabus' 
        ? `the FULL SYLLABUS of ${config.subject}`
        : config.scope === 'chapter'
        ? `the CHAPTER "${config.topic}" in ${config.subject}`
        : config.scope === 'unit'
        ? `the UNIT "${config.topic}" in ${config.subject}`
        : `the TOPIC "${config.topic}" in ${config.subject}`;

      const isScience = ["Math", "Physics", "Chemistry", "Biology"].includes(config.subject);
      const examType = isScience ? "WBCHSE/JEE/NEET" : "WBCHSE";

      const modePrompt = config.isPYQ 
        ? `Act as an official ${examType} examiner. FETCH 10 actual Previous Year Questions for ${scopeDescription}.`
        : `Act as a professional educator. GENERATE 10 high-quality MCQs for ${scopeDescription}.`;

      const prompt = `
        ${modePrompt} Difficulty: focus on ${diffOverride || config.difficulty}.
        
        CRITICAL: Ensure the subject is STRICTLY "${config.subject}". DO NOT generate Biology questions if the subject is "${config.subject}".
        
        REQUIREMENTS:
        1. 10 Questions starting ID q${startIndex}.
        2. BILINGUAL: questionEn/questionBn, optionsEn/optionsBn (4 options), explanationEn/explanationBn.
        3. LaTeX: Use double dollar signs for all math/science.
        4. JSON ONLY. No markdown text outside the array.
        
        [
          {
            "id": "q${startIndex}",
            "questionEn": "...",
            "questionBn": "...",
            "optionsEn": [4 strings],
            "optionsBn": [4 strings],
            "correctIndex": 0,
            "explanationEn": "...",
            "explanationBn": "...",
            "difficulty": "easy" | "medium" | "hard",
            "year": 2021 | null
          }
        ]
      `;

      const result = await ai.models.generateContent({
        model: getPreferences().quizModel,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { 
          responseMimeType: "application/json",
          maxOutputTokens: 8192 
        }
      });

      const parsed = safeJsonParse(result.text || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error(`Batch ${startIndex} failed:`, err);
      return [];
    }
  };

  try {
    // Generate in four batches of 10 to ensure maximum reliability and prevent truncation
    // We vary the difficulty mix based on user choice
    let diffs = [config.difficulty, config.difficulty, config.difficulty, config.difficulty];

    if (config.difficulty === 'medium') {
      diffs = ['easy', 'medium', 'medium', 'hard'];
    } else if (config.difficulty === 'hard') {
      diffs = ['medium', 'hard', 'hard', 'hard'];
    }

    const batches = await Promise.all([
      fetchBatch(10, 1, diffs[0]),
      fetchBatch(10, 11, diffs[1]),
      fetchBatch(10, 21, diffs[2]),
      fetchBatch(10, 31, diffs[3])
    ]);

    let allQuestions = batches.flat();
    
    // If total count is low or missing, top up with WBCHSE fallback questions
    if (allQuestions.length < 40) {
      const missingCount = 40 - allQuestions.length;
      const fallbacks = getFallbackQuestionsForSubject(config.subject, missingCount);
      allQuestions = [...allQuestions, ...fallbacks];
    }

    return allQuestions;
  } catch (error) {
    console.error("Mock Test Generation Error, supplying fallback questions:", error);
    return getFallbackQuestionsForSubject(config.subject, 40);
  }
}

export async function generateStudyMaterial(topic: string, type: "flashcards" | "quiz" | "summary" | "keypoints", level: "Board" | "JEE" = "Board", apiKey?: string): Promise<any> {
    try {
    const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
    
    const prompt = type === "flashcards" 
      ? `Generate 10 interactive flashcards for WBCHSE Class 12 (Subject: ${topic}) at ${level} level. 
         Return ONLY a JSON array of objects with "question" and "answer" keys. 
         IMPORTANT: For ALL mathematical formulas and equations, use LaTeX with double dollar signs (e.g., $$E = mc^2$$).
         The content should be exam-focused, covering key concepts, formulas, or definitions.`
      : type === "quiz"
      ? `Generate 10 multiple-choice quiz questions for WBCHSE Class 12 (Subject: ${topic}) at ${level} level. 
         Include numerical problems for Science subjects.
         IMPORTANT: For ALL mathematical formulas and equations, use LaTeX with double dollar signs (e.g., $$\\int x dx$$).
         Return ONLY a JSON array of objects with "question", "options" (array of 4 strings), "correctAnswer" (index 0-3), and "explanation" keys.
         The content should be exam-focused.`
      : type === "summary"
      ? `Provide a concise, cinematic summary of the WBCHSE Class 12 topic: "${topic}" at ${level} level. 
         Focus on the core concepts, main formulas, and key applications. 
         IMPORTANT: For ALL mathematical formulas and equations, use LaTeX with double dollar signs.
         Return ONLY a JSON object with a "text" key containing the summary.`
      : `Provide the top 10 key points for the WBCHSE Class 12 topic: "${topic}" at ${level} level. 
         Focus on exam-relevant details and important formulas. 
         IMPORTANT: For ALL mathematical formulas and equations, use LaTeX with double dollar signs.
         Return ONLY a JSON object with a "points" key containing an array of strings.`;

    const result = await ai.models.generateContent({
      model: getPreferences().quizModel,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    return safeJsonParse(result.text || "[]");
  } catch (error) {
    console.error("Study Material Generation Error:", error);
    return [];
  }
}

