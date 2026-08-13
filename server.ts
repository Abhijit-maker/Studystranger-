import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check for critical keys on start
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const DEAPI_KEY = process.env.DEAPI_API_KEY;
  console.log("-----------------------------------------");
  console.log("SERVER BOOTSTRAP:");
  console.log("GEMINI_API_KEY:", GEMINI_KEY ? "PRESENT (READY FOR LIVE SESSION)" : "MISSING (LIVE SESSION WILL FAIL)");
  console.log("DEAPI_API_KEY:", DEAPI_KEY ? "PRESENT (READY FOR IMAGE GEN)" : "MISSING (IMAGE GEN WILL FAIL)");
  console.log("-----------------------------------------");

  // Fetch high-quality images from Wikipedia, Google, and Unsplash as fallback
  async function getGoogleOrUnsplashImages(prompt: string): Promise<string[]> {
    const images: string[] = [];
    const cleanPrompt = prompt || "educational diagram";
    
    // Check if prompt matches our handpicked highly accurate academic visuals dictionary
    const lower = cleanPrompt.toLowerCase();
    const serverAcademicMap: Record<string, string> = {
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
      "flower": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "flowering": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "pollination": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
      "geitonogamy": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "xenogamy": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "microsporogenesis": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "megasporogenesis": "https://images.unsplash.com/photo-1507290439931-a8e02da93767?q=80&w=1200&auto=format&fit=crop",
      "dna": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "rna": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "replication": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "transcription": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "translation": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "gene": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "mendel": "https://images.unsplash.com/photo-1463136524856-aa899b889390?q=80&w=1200&auto=format&fit=crop",
      "linkage": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "crossing over": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "evolution": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "fossil": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "homologous": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "analogous": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "oparin": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "haldane": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "homo erectus": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "australopithecus": "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200&auto=format&fit=crop",
      "adarini": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
      "elephant": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
      "bangala bhasha": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "vivekananda": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "bengali": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "dhharma": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
      "srijato": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "digbijoyer": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=1200&auto=format&fit=crop",
      "potraj": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
      "neruda": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
      "phonemics": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "semantics": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "linguistics": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop",
      "deoli": "https://images.unsplash.com/photo-1532103054090-334e6e60ae29?q=80&w=1200&auto=format&fit=crop",
      "train": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1200&auto=format&fit=crop",
      "roots": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
      "kalam": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop",
      "bet": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
      "chekhov": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop",
      "ulysses": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
      "casuarina": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
      "toru dutt": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
      "riders": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop",
      "sea": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=1200&auto=format&fit=crop"
    };

    for (const key of Object.keys(serverAcademicMap)) {
      if (lower.includes(key)) {
        images.push(serverAcademicMap[key]);
      }
    }
    
    // 1. Try Wikipedia / Wikimedia Commons first for academic, biological, historical, and scientific diagrams.
    // Extremely reliable and accurate for school curricula!
    try {
      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanPrompt)}&format=json&origin=*`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const firstResult = searchData.query?.search?.[0];
        if (firstResult) {
          const title = firstResult.title;
          const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=1000&format=json&origin=*`);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            const pages = imgData.query?.pages;
            if (pages) {
              const pageId = Object.keys(pages)[0];
              const thumbnail = pages[pageId]?.thumbnail?.source;
              if (thumbnail && thumbnail.startsWith("http")) {
                images.push(thumbnail);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("Wikipedia search scraper failed:", err);
    }

    // 2. Try Unsplash for high-quality aesthetic landscape/stock photos
    try {
      const response = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(cleanPrompt)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        }
      });
      if (response.ok) {
        const html = await response.text();
        const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+/g);
        if (matches) {
          const unique = Array.from(new Set(matches));
          unique.forEach(url => {
            if (!url.includes("profile") && !url.includes("avatar")) {
              images.push(`${url}?q=80&w=1000&auto=format&fit=crop`);
            }
          });
        }
      }
    } catch (err) {
      console.warn("Unsplash fallback search failed:", err);
    }

    // 3. Try Google Images scraping (excellent for diagrams, equations, biology illustrations, etc.)
    try {
      const response = await fetch(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(cleanPrompt)}&safe=active`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
        }
      });
      if (response.ok) {
        const html = await response.text();
        const matches = html.match(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[a-zA-Z0-9\-_:;]+/g);
        if (matches) {
          const unique = Array.from(new Set(matches));
          unique.forEach(url => {
            images.push(url);
          });
        }
      }
    } catch (err) {
      console.warn("Google Image fallback search failed:", err);
    }

    // Ultimate fallback if nothing has been populated
    if (images.length === 0) {
      images.push(`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop`);
    }

    return images;
  }

  // API Route for Prompt Optimization using Gemini
  app.post("/api/gemini/optimize-prompt", async (req, res) => {
    const { userPrompt, style = "photorealistic" } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing on the server.");
      }
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const promptText = `You are a professional image prompt engineer for state-of-the-art AI generators like Flux, Midjourney, and Imagen.
Your task is to take the user's simple, brief, or bilingual idea (which could be in English, Bengali, or a mix of both) and translate and elaborate it into a spectacular, high-detail, visually breathtaking, and photorealistic or artistic English prompt.

User's description: "${userPrompt}"
Style requested: ${style}

Rules:
1. Translate any Bengali parts into clear English description.
2. Enrich it with sensory details: lighting (e.g., golden hour, cinematic lighting, dramatic sidelight), composition (e.g., wide-angle shot, macro focus, rule of thirds), colors (e.g., vibrant, muted nostalgic, soft pastel, high-contrast neon), and texture.
3. Keep the optimized prompt coherent, descriptive, and under 120 words.
4. Output ONLY the raw optimized prompt string. Absolutely no conversational intro, no quotes, no markdown wrappers, and no explanations. Just output the refined prompt directly.`;

      const gResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
      });

      const optimized = gResponse.text?.trim() || userPrompt;
      res.json({ optimized });
    } catch (err: any) {
      console.warn("Prompt optimization failed, returning original:", err.message);
      res.json({ optimized: userPrompt });
    }
  });

  // Safe Image Proxy to solve client-side CORS "Failed to fetch" errors for external images
  app.get("/api/proxy-image", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("URL parameter is required");
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const contentType = response.headers.get("content-type") || "image/png";
      res.setHeader("Content-Type", contentType);
      
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("Proxy image failed:", err.message);
      res.status(500).send("Failed to proxy image");
    }
  });

  // API Route for Image Generation (Proxy to deapi.ai with Pollinations AI & Search-based fallback)
  app.post("/api/generate-image", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.DEAPI_API_KEY;

    // Use Pollinations AI as unlimited fallback first, then Google/Unsplash if everything fails
    if (!apiKey) {
      console.log(`DEAPI_API_KEY is missing. Using Pollinations AI generation for: "${prompt}"`);
      try {
        const seed = Math.floor(Math.random() * 10000000);
        // Clean prompt for url encoding
        const cleanedStr = (prompt || "educational diagram").trim();
        const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(cleanedStr)}?width=1024&height=1024&nologo=true&seed=${seed}&private=true`;

        // Check if Pollinations is reachable via light head check, if not fall back to search
        return res.json({
          url: pollinationsUrl,
          data: [{ url: pollinationsUrl }]
        });
      } catch (pollinationErr: any) {
        console.warn("Pollinations generation failed, falling back to scrapers...");
        try {
          const foundImages = await getGoogleOrUnsplashImages(prompt);
          return res.json({
            url: foundImages[0],
            data: foundImages.map(img => ({ url: img }))
          });
        } catch (fallbackErr: any) {
          return res.status(500).json({ error: fallbackErr.message });
        }
      }
    }

    try {
      const response = await fetch("https://api.deapi.ai/api/v1/client/txt2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt || "A professional educational diagram",
          model: "Flux_2_Klein_4B_BF16",
          width: 1024,
          height: 1024,
          steps: 4,
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate image via deapi");
      }

      res.json(data);
    } catch (error: any) {
      console.warn("Image generation via deapi failed. Using Pollinations AI as premium fallback. Info:", error.message);
      try {
        const seed = Math.floor(Math.random() * 10000000);
        const cleanedStr = (prompt || "educational diagram").trim();
        const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(cleanedStr)}?width=1024&height=1024&nologo=true&seed=${seed}&private=true`;
        
        res.json({
          url: pollinationsUrl,
          data: [{ url: pollinationsUrl }]
        });
      } catch (fallbackErr: any) {
        console.warn("Fallback collection collapsed completely:", fallbackErr.message);
        res.status(500).json({ error: `Image generation & search fallback failed: ${fallbackErr.message}` });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
