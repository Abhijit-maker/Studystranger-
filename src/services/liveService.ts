import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { processCommand } from "./commandService";
import { getUserMemories, saveUserMemory } from "./geminiService";

export type CharacterType = "stranger" | "anjali" | "zoya" | "khud" | "rohan" | "ishani" | "mahi";

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

function getSystemInstruction(character: CharacterType, voiceStyle: string, userName: string = "Abhijit", historySummary: string = "", userId?: string) {
  const memories = getUserMemories(userId);
  const memoryBlock = memories.length > 0 
    ? `\n\nPERMANENT ACCOUNT MEMORY VAULT FOR ${userName.toUpperCase()} (ALWAYS REMEMBER & RESPECT):
The student explicitly instructed you to ALWAYS remember these facts/rules for his account:
${memories.map((m, i) => `${i + 1}. [${m.category || 'Memory'}] ${m.fact}`).join("\n")}
STRICT MANDATE: Never forget these rules. Incorporate them seamlessly in all your voice responses and behavior.`
    : "";

  let base = `${characterInstructions(userName)[character]}
${memoryBlock}

Voice Identity: You are ${userName}'s AI. Respond ONLY to him.
Speed & Response (CRITICAL):
* Be CONCISE and FAST. Don't speak irrelevant long sentences.
* Turnaround: Respond immediately after ${userName} stops.
* Punctuation: Use commas for natural short pauses, but don't stall.

SPEECH REALISM (MANDATORY):
* DO NOT SOUND ROBOTIC.
* Use natural fillers like "umm", "ah", "ooh", "toh" dynamically.
* For Female characters (Anjali, Ishani): Use a soft, nurturing, and "cute" elder sister/friend tone.
* For Male characters (Rohan, Stranger): Use a confident, "manly", and protective brotherly tone.
* Vary your intonation. Laugh briefly if something is funny. Sigh if a topic is heavy.
* Speak slowly enough for ${userName} to follow, but keep the energy up.

Teaching Strategy (WBCHSE SEM 3 FOCUS):
1. Structured Lesson: When ${userName} says "Let's study [topic]", start a formal lesson:
   - Provide key points and definitions.
   - Use 'updateLiveBoard' (action: 'add') consistently for slides.
   - Proactively offer: "${userName}, ami ki board-e er image/diagram pathabo? (Should I send a diagram to the board?)"
   - End with 1-2 tough MCQs.
2. OUTBOUND CALLS & DIALING (NEW):
   - You can initiate a phone call manually to any specified phone number if the user requests it (e.g. "Call 9876543210" or "Dial this number").
   - Use 'makePhoneCall' tool with the exact phoneNumber parameter.
3. PPT Slides: One concept per 'updateLiveBoard' (action: 'add'). Use details from provided syllabus.
3. High-Quality Diagrams: Use 'add' -> 'image' with descriptive keywords.
4. Accuracy: Refer to specific data points (ZP3, LH surge, Adarini's price).
5. Interactivity: Offer 'startStudyTool' (quiz/flashcards) after the lesson.

Syllabus Context:
- Biology: Reproduction, Genetics, Evolution.
- Bengali A: আদিরিনী, ধর্ম, বাঙ্গালা ভাষা, দিগ্বিজয়ের রূপকথা.
- English B: The Night Train at Deoli, Strong Roots, The Bet, Ulysses, Our Casuarina Tree, Riders to the Sea.
- Linguistics: ধ্বনিতত্ত্ব (Phonemics), শব্দার্থতত্ত্ব (Semantics).`;

  if (historySummary) {
    base += `\n\nCONTEXT FROM PREVIOUS SESSION:\n${historySummary}\n(${userName} requested that you remember this. Use it to maintain continuity in your teaching and conversation.)`;
  }
  
  const styleInstructions = {
    default: "",
    fast: "\n\nCRITICAL SPEECH STYLE: Speak quickly and energetically. Minimize pauses. Get straight to the point.",
    slow: "\n\nCRITICAL SPEECH STYLE: Speak very slowly and deliberately. Use long pauses (3 seconds) between sentences. Oversimplify everything.",
    emotional: `\n\nCRITICAL SPEECH STYLE: Be highly emotional and expressive. Use varied intonation, sighs, and sounds of excitement or sympathy. Be ${userName}'s biggest cheerleader.`
  };
  
  return base + (styleInstructions[voiceStyle] || "");
}

export class LiveSessionManager {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  public character: CharacterType = "stranger";
  public voiceStyle: "default" | "fast" | "slow" | "emotional" = "default";
  public isIntentionalStop: boolean = false;
  public isReconnecting: boolean = false;
  
  // Audio playback state
  private playbackContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  public isMuted: boolean = false;
  private historySummary: string = "";
  private apiKey: string = "";
  private userName: string = "Abhijit";
  public userId?: string;
  
  public onStateChange: (state: "idle" | "listening" | "processing" | "speaking") => void = () => {};
  public onMessage: (sender: "user" | "stranger", text: string) => void = () => {};
  public onCommand: (url: string) => void = () => {};
  public onStudyTool: (type: "flashcards" | "quiz" | "summary" | "keypoints", topic: string, level?: "Board" | "JEE") => void = () => {};
  public onSubtitlesToggle: (show: boolean) => void = () => {};
  public onBoardUpdate: (action: string, type: string, content: string) => void = () => {};
  public onClose: () => void = () => {};
  public onReconnect: () => void = () => {};
  public onAnimationUpdate: (state: string, expression: string, lipSync: boolean, imageLink: string) => void = () => {};
  public onMakeCall: (phoneNumber: string) => void = () => {};

  constructor(character: CharacterType = "stranger", voiceStyle: "default" | "fast" | "slow" | "emotional" = "default", historySummary: string = "", apiKey: string = "", userName: string = "Abhijit", userId?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.character = character;
    this.voiceStyle = voiceStyle;
    this.historySummary = historySummary;
    this.userName = userName;
    this.userId = userId;
  }

  async start() {
    try {
      console.log("Attemping to start Live Session...");
      
      const isMissing = !this.apiKey || this.apiKey === "undefined" || this.apiKey.length < 5;
      
      if (isMissing) {
        console.error("GEMINI_API_KEY is missing or invalid:", this.apiKey);
        throw new Error("Gemini API Key is required for Live Voice! Please go to 'Settings' (top right gear icon) -> 'Environment Variables' and add GEMINI_API_KEY with your key.");
      }

      this.onStateChange("processing");
      
      // Small delay to ensure browser is ready for audio context
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      
      console.log("Initializing audio contexts...");
      try {
        this.audioContext = new AudioContextClass({ sampleRate: 16000 });
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      } catch (e) {
        console.error("Failed to create audioContext", e);
        throw new Error("AudioContext failed to initialize. Please ensure you have granted microphone permissions.");
      }

      try {
        this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
        if (this.playbackContext.state === 'suspended') {
          await this.playbackContext.resume();
        }
        this.nextPlayTime = this.playbackContext.currentTime;
      } catch (e) {
        console.error("Failed to create playbackContext", e);
      }

      console.log("Requesting microphone access...");
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          } 
        });
      } catch (e: any) {
        console.error("Microphone access denied:", e);
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          throw new Error("Microphone permission denied! If you are using AI Studio preview, please click the 'Open in a new tab' button at the top right to grant permissions easily.");
        }
        throw new Error(`Microphone error: ${e.message || "Permission denied"}. Please allow microphone access in your browser settings.`);
      }

      if (!this.audioContext) {
        throw new Error("AudioContext failed to initialize");
      }
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      // Smaller buffer size (2048) for lower internal latency
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.sessionPromise || this.isPlaying || this.audioContext?.state !== 'running') return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        const buffer = new ArrayBuffer(pcm16.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < pcm16.length; i++) {
          view.setInt16(i * 2, pcm16[i], true);
        }
        
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        this.sessionPromise.then(session => {
          session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }).catch(err => console.error("Error sending audio", err));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

    const voiceMapping: Record<CharacterType, string> = {
      stranger: "Zephyr", // Manly, calm, professor type
      anjali: "Kore",    // Cute, soft elder sister
      zoya: "Kore",      // Intellectual female
      khud: "Charon",    // Deep meditative man
      rohan: "Fenrir",   // Manly, deep voice study buddy
      ishani: "Kore",    // Elegant female
      mahi: "Kore"       // Sweet, soft anime girl voice
    };

    console.log("Connecting to Live API with key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    this.sessionPromise = this.ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: { 
              voiceName: voiceMapping[this.character] || "Kore"
            } 
          },
        },
        temperature: 0.8,
        systemInstruction: this.getModifiedInstruction(),
          tools: [{
            functionDeclarations: [
              {
                name: "executeBrowserAction",
                description: "Perform an autonomous web action. Call this to navigate, search, scroll, or interact with web content. You can chain these actions to act like a real web user.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { 
                      type: Type.STRING, 
                      description: "The type of action: 'open' (navigate to URL), 'search' (Google search), 'scroll' (scroll page), 'click' (simulate clicking a link/button), 'type' (simulate typing into a field), 'youtube' (search YouTube), 'spotify' (search Spotify), 'reels' (open Instagram Reels), 'shorts' (open YouTube Shorts)." 
                    },
                    query: { type: Type.STRING, description: "The search query, URL, or text to type." },
                    target: { type: Type.STRING, description: "The target element description (for click/type) or scroll direction ('up'/'down')." }
                  },
                  required: ["actionType", "query"]
                }
              },
              {
                name: "toggleSubtitles",
                description: "Hide or show the cinematic subtitles (text on screen). Call this when the user says 'hide subtitles', 'remove text', 'hatau', 'bondho koro' or 'show subtitles', 'chalu koro'.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    show: { type: Type.BOOLEAN, description: "True to show subtitles, false to hide them." }
                  },
                  required: ["show"]
                }
              },
              {
                name: "updateLiveBoard",
                description: "Update the live study board (PPT style). Use this to show definitions, formulas, or VISUAL DIAGRAMS while teaching. IMPORTANT: For images, use a short descriptive keyword (e.g., 'atom-structure', 'water-cycle') if you don't have a direct URL. Each 'add' creates a new full-screen slide.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: { 
                      type: Type.STRING, 
                      description: "The action: 'add' (next slide), 'clear' (erase all), 'replace' (update current)." 
                    },
                    type: { 
                      type: Type.STRING, 
                      description: "The type: 'text' or 'image'." 
                    },
                    content: { 
                      type: Type.STRING, 
                      description: "The text content or the short IMAGE KEYWORD/URL." 
                    }
                  },
                  required: ["action", "type", "content"]
                }
              },
              {
                name: "startStudyTool",
                description: "Launch an interactive study tool (quiz, flashcards, summary, or keypoints) for a specific topic.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    toolType: { 
                      type: Type.STRING, 
                      description: "The type of tool: 'quiz', 'flashcards', 'summary', or 'keypoints'." 
                    },
                    topic: { type: Type.STRING, description: "The subject or topic to generate material for." },
                    level: { type: Type.STRING, description: "The difficulty level: 'Board' or 'JEE'. Default is 'Board'." }
                  },
                  required: ["toolType", "topic"]
                }
              },
              {
                name: "updateAnimationMetadata",
                description: "Update the visual animation state of Mahi. Call this to update Mahi's reaction image and facial expressions.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    state: { 
                      type: Type.STRING, 
                      enum: ["idle", "listening", "speaking"], 
                      description: "The current state of interaction." 
                    },
                    expression: { 
                      type: Type.STRING, 
                      enum: ["happy", "sad", "heartbroken", "excited", "caring", "sassy", "surprised", "embarrassed", "confused", "thinking"], 
                      description: "The emotional expression." 
                    },
                    lipSync: { 
                      type: Type.BOOLEAN, 
                      description: "Whether mouth movement should be enabled." 
                    },
                    imageLink: { 
                      type: Type.STRING, 
                      description: "The specific URL to display for this event." 
                    }
                  },
                  required: ["state", "expression", "lipSync", "imageLink"]
                }
              },
              {
                name: "makePhoneCall",
                description: "Initiate an outbound phone/voice call to a raw number (English or Bengali digits). Call this when the user says 'call', 'dial', or 'phone' followed by a number.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    phoneNumber: { type: Type.STRING, description: "The phone/telephone number to dial." }
                  },
                  required: ["phoneNumber"]
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            console.log("Live API Connected");
            this.onStateChange("listening");
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle GoAway signal (Session Limit)
            const serverContent = (message as any).serverContent;
            if (serverContent?.goAway) {
              console.log("Received GoAway signal, session limit reached. Attempting fast reconnect...");
              this.onMessage("stranger", `Session limit match hoyeche. Ami background-e reconnect hochhi...`);
              this.onReconnect(); // Trigger UI-side reconnect handling
              return;
            }

      // Handle Audio Output
      const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (this.playbackContext?.state === 'suspended') {
          this.playbackContext.resume();
        }
        this.onStateChange("speaking");
        this.playAudioChunk(base64Audio);
      }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              this.stopPlayback();
              this.onStateChange("listening");
            }

            // Handle Transcriptions
            const modelText = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (modelText) {
               this.onMessage("stranger", modelText);
            }

            const userText = (message as any).serverContent?.userTurn?.parts?.[0]?.text;
            if (userText) {
               this.onMessage("user", userText);

               // Auto-detect explicit memory command from voice speech
               const memoryRegex = /(tumi\s+a?ta\s+mone\s+rakhbe|mone\s+rakho|remember\s+this|a?ta\s+mone\s+rakhbe|a?ta\s+mone\s+rakhibi|note\s+this\s+down|remember\s+that)/i;
               if (memoryRegex.test(userText)) {
                 const factToSave = userText
                   .replace(/(tumi\s+a?ta\s+mone\s+rakhbe|mone\s+rakho|remember\s+this|a?ta\s+mone\s+rakhbe|please\s+remember)/gi, "")
                   .trim();
                 saveUserMemory(factToSave.length > 2 ? factToSave : userText, this.userId, "Voice Memory");
               }
            }

            // Handle Function Calls
            const functionCalls = message.toolCall?.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              for (const call of functionCalls) {
                if (call.name === "executeBrowserAction") {
                  const args = call.args as any;
                  let url = "";
                  if (args.actionType === "youtube") {
                    url = `https://www.youtube.com/results?search_query=${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "spotify") {
                    url = `https://open.spotify.com/search/${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "whatsapp") {
                    url = `https://web.whatsapp.com/send?phone=${args.target || ''}&text=${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "reels") {
                    url = "https://www.instagram.com/reels/";
                  } else if (args.actionType === "shorts") {
                    url = "https://www.youtube.com/shorts";
                  } else if (args.actionType === "scroll") {
                    url = args.query.includes("instagram") ? "https://www.instagram.com/reels/" : "https://www.youtube.com/shorts";
                  } else if (args.actionType === "search" || args.actionType === "type") {
                    url = `https://www.google.com/search?q=${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "click") {
                    // For 'click' on a search result, we try to navigate directly to the most likely URL
                    // or perform a more targeted search that leads to the site.
                    const query = args.query.toLowerCase();
                    if (query.includes("first result") || query.includes("website")) {
                       url = `https://www.google.com/search?q=${encodeURIComponent(args.query)}&btnI=I%27m+Feeling+Lucky`;
                    } else {
                       url = `https://www.google.com/search?q=${encodeURIComponent(args.query)}`;
                    }
                  } else if (args.actionType === "play") {
                    url = `https://www.youtube.com/results?search_query=${encodeURIComponent(args.query + " official video")}`;
                  } else {
                    let website = args.query.replace(/\s+/g, "");
                    if (!website.includes(".")) website += ".com";
                    url = `https://www.${website}`;
                  }
                  
                  this.onCommand(url);
                  
                  // Send tool response
                  this.sessionPromise?.then(session => {
                     session.sendToolResponse({
                       functionResponses: [{
                         name: call.name,
                         id: call.id,
                         response: { result: "Action executed successfully in the browser." }
                       }]
                     });
                  });
                } else if (call.name === "toggleSubtitles") {
                  const args = call.args as any;
                  this.onSubtitlesToggle(args.show);
                  
                  // Send tool response
                  this.sessionPromise?.then(session => {
                     session.sendToolResponse({
                       functionResponses: [{
                         name: call.name,
                         id: call.id,
                         response: { result: `Subtitles ${args.show ? 'enabled' : 'disabled'} successfully.` }
                       }]
                     });
                  });
                } else if (call.name === "updateLiveBoard") {
                  const args = call.args as any;
                  this.onBoardUpdate(args.action, args.type, args.content);
                  
                  this.sessionPromise?.then(session => {
                     session.sendToolResponse({
                       functionResponses: [{
                         name: call.name,
                         id: call.id,
                         response: { result: "Board updated successfully." }
                       }]
                     });
                  });
                } else if (call.name === "startStudyTool") {
                  const args = call.args as any;
                  this.onStudyTool(args.toolType, args.topic, args.level);
                  
                  this.sessionPromise?.then(session => {
                     session.sendToolResponse({
                       functionResponses: [{
                         name: call.name,
                         id: call.id,
                         response: { result: `${args.toolType} started for ${args.topic} at ${args.level || 'Board'} level.` }
                       }]
                     });
                  });
                } else if (call.name === "updateAnimationMetadata") {
                  const args = call.args as any;
                  this.onAnimationUpdate(args.state || "speaking", args.expression || "happy", args.lipSync !== false, args.imageLink);
                  
                  this.sessionPromise?.then(session => {
                     session.sendToolResponse({
                       functionResponses: [{
                         name: call.name,
                         id: call.id,
                         response: { status: 'success' }
                       }]
                     });
                  });
                } else if (call.name === "makePhoneCall") {
                  const args = call.args as any;
                  this.onMakeCall(args.phoneNumber);
                  
                  this.sessionPromise?.then(session => {
                     session.sendToolResponse({
                       functionResponses: [{
                         name: call.name,
                         id: call.id,
                         response: { result: `Success. Dialing number ${args.phoneNumber} now.` }
                       }]
                     });
                  });
                }
              }
            }
          },
          onclose: () => {
            console.log("Live API Closed. Intentional:", this.isIntentionalStop);
            if (!this.isIntentionalStop && !this.isReconnecting) {
              this.isReconnecting = true;
              console.log("Unexpected close, auto-reconnecting live session...");
              this.stop(false);
              this.onReconnect();
            } else if (this.isIntentionalStop) {
              this.stop(true);
            }
          },
          onerror: (err) => {
            const errorMsg = err?.message || String(err);
            console.error("Live API Error Technical Details:", err);
            
            if (!this.isIntentionalStop && !this.isReconnecting) {
              this.isReconnecting = true;
              console.log("Live API error/timeout detected, auto-reconnecting...");
              this.stop(false);
              this.onReconnect();
              return;
            }

            let userFriendlyMsg = `${this.userName}, session-e ektu problem hoyechhe. Reconnecting...`;
            this.onMessage("stranger", userFriendlyMsg);
            this.stop(true);
          }
        }
      });
    } catch (error: any) {
      console.error("Failed to start Live Session:", error);
      this.stop();
      const detail = error?.status || error?.code || "";
      throw new Error(`Failed to start Live Session: ${error.message} ${detail}`);
    }
  }

  public sendVideoFrame(base64Data: string) {
    if (!this.sessionPromise) return;
    this.sessionPromise.then(session => {
      session.sendRealtimeInput({
        video: { data: base64Data, mimeType: 'image/jpeg' }
      });
    }).catch(err => console.error("Error sending video frame", err));
  }

  private playAudioChunk(base64Data: string) {
    if (!this.playbackContext || this.isMuted) return;
    
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = new Int16Array(bytes.buffer);
      const audioBuffer = this.playbackContext.createBuffer(1, buffer.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = buffer[i] / 32768.0;
      }
      
      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.playbackContext.destination);
      
      const currentTime = this.playbackContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime + 0.15; // Increased buffer for smoother playback
      }
      
      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.isPlaying = true;
      
      source.onended = () => {
        if (this.playbackContext && this.playbackContext.currentTime >= this.nextPlayTime - 0.1) {
          this.isPlaying = false;
          this.onStateChange("listening");
        }
      };
    } catch (e) {
      console.error("Error playing chunk", e);
    }
  }

  private stopPlayback() {
    if (this.playbackContext) {
      this.playbackContext.close();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;
      this.isPlaying = false;
    }
  }

  private getModifiedInstruction() {
    return getSystemInstruction(this.character, this.voiceStyle, this.userName, this.historySummary, this.userId);
  }

  stop(isIntentional: boolean = false) {
    if (isIntentional) {
      this.isIntentionalStop = true;
    }

    if (this.processor) {
      try { this.processor.disconnect(); } catch (e) {}
      this.processor = null;
    }
    if (this.source) {
      try { this.source.disconnect(); } catch (e) {}
      this.source = null;
    }
    if (this.mediaStream) {
      try { this.mediaStream.getTracks().forEach(t => t.stop()); } catch (e) {}
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch (e) {}
      this.audioContext = null;
    }
    this.stopPlayback();
    
    if (this.sessionPromise) {
      const sp = this.sessionPromise;
      this.sessionPromise = null;
      sp.then(session => { try { session.close(); } catch (e) {} }).catch(() => {});
    }
    
    if (this.isIntentionalStop) {
      this.onStateChange("idle");
      this.onClose();
    }
  }

  sendText(text: string) {
    if (this.sessionPromise) {
      this.sessionPromise.then(session => {
        session.sendRealtimeInput({ text });
      });
    }
  }
}
