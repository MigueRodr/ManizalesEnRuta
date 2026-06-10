import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Helper to clean key from quotes or placeholders
function cleanKey(k: string | undefined): string | null {
  if (!k) return null;
  const cleaned = k.replace(/['"]/g, "").trim();
  if (!cleaned || cleaned === "MY_GEMINI_API_KEY" || cleaned === "undefined") {
    return null;
  }
  return cleaned;
}

// Ensure the key format matches real Google GenAI API keys
function validateGeminiKey(key: string): void {
  if (!key.startsWith("AIzaSy") && !key.startsWith("AQ.")) {
    console.warn(`[Gemini] Clave con prefijo inusual detectada: ${key.substring(0, 6)}...`);
  }
}

// Resolver for active GEMINI_API_KEY
function resolveGeminiKey(): string {
  // 1. Check clean environment variable
  let key = cleanKey(process.env.GEMINI_API_KEY);
  if (key) {
    validateGeminiKey(key);
    return key;
  }

  // 2. Fallback to manually reading .env.example
  try {
    const envExamplePath = path.join(process.cwd(), ".env.example");
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, "utf-8");
      const match = content.match(/^GEMINI_API_KEY\s*=\s*(.*)$/m);
      if (match && match[1]) {
        key = cleanKey(match[1]);
        if (key) {
          validateGeminiKey(key);
          process.env.GEMINI_API_KEY = key;
          return key;
        }
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes("comienzan con")) {
      throw err;
    }
    console.error("[Gemini] Fallback parsing error:", err);
  }

  throw new Error("La clave GEMINI_API_KEY no está configurada. Por favor configúrala en Settings > Secrets en AI Studio.");
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Lazy-initialized Gemini client with safety checks
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = resolveGeminiKey();
    console.log(`[Gemini] Initializing client. Key prefix: ${key.substring(0, 6)}...`);
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Assistant IA router using gemini-3.5-flash
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Falta el array de mensajes 'messages' en el cuerpo de la petición." });
    }

    const lastUserMessage = messages && messages.length > 0
      ? messages[messages.length - 1].text
      : "";

    const ai = getAiClient();

    // Map the conversation into structured parts or plain prompt. 
    // Let's create a conversational setup centering on Manizales transit details
    const formatHistory = messages.map((m: any) => {
      return `${m.sender === "user" ? "Usuario" : "Asistente"}: ${m.text}`;
    }).join("\n");

    const prompt = `Tienes un historial de mensajes con el usuario de la aplicación ManaRuta (Manizales en Ruta):
${formatHistory}
Por favor responde al último mensaje del usuario como el Asistente IA de movilidad de Manizales.
Toma en cuenta las siguientes sugerencias de información local del transporte en Manizales si el usuario lo pregunta:
- Ruta 23 Centro: Llega cada 8 minutos, ideal para ir de La Enea o Palermo al Parque Bolívar y el Centro de Manizales.
- Ruta 12 Chipre: Pasa por las avenidas principales y sube al emblemático barrio Chipre, famoso por el atardecer y el obelisco.
- Cable Aéreo: Conecta la Terminal de Transportes con la estación Fundadores y la estación Camino Real (Cámbulos - Herveo - Fundadores). Es eléctrico, ecológico y tiene un tiempo de recorrido muy preciso. El servicio cierra para mantenimiento menor ocasionalmente a las 10:00 PM.
- Clima promedio: Manizales se encuentra sobre la cordillera, su clima suele ser templado/frío con neblina y llovizna frecuente ("llovizna suave", "sal con tiempo").
- El usuario actual se llama Juan Pérez, con cédula 10.123.456. Responde preferiblemente de forma amigable (¡Hola Juan!).

Instrucciones de formato e increíble velocidad:
- Sé extremadamente conciso, breve y directo al grano (máximo 2 a 3 oraciones cortas o viñetas directas). Esto acelera enormemente la respuesta del sistema.
- Brinda información precisa e inmediata para la fluidez en movimiento.
- Usa emojis de transporte de manera sutil pero clara.
- Mantén un tono sumamente respetuoso, servicial y amigable.
- El idioma debe ser exclusivamente Español.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres 'Asistente IA', el asistente virtual súper rápido y directo de movilidad y rutas de buses para la app municipal ManaRuta de la ciudad de Manizales, Colombia. Responde siempre de forma resumida, precisa y con el menor texto posible.",
          temperature: 0.5,
        }
      });

      const reply = response.text || "Disculpa, no pude procesar tu solicitud. ¿Podrías intentar de nuevo?";
      res.json({ text: reply });
    } catch (apiError: any) {
      console.warn("Gemini API error detected, falling back to instant local responder:", apiError);
      
      // Smart Keyword fallback
      const norm = lastUserMessage.toLowerCase();
      let reply = "";
      
      if (norm.includes("cable") || norm.includes("aereo") || norm.includes("aéreo") || norm.includes("teleferico") || norm.includes("teleférico")) {
        reply = "¡Hola Juan! 🚡 El Cable Aéreo opera con total normalidad de 6:00 AM a 10:00 PM, conectando la Terminal de Transportes con la estación Fundadores rápido y libre de trancón. (Modo Local ⚡)";
      } else if (norm.includes("ruta 23") || norm.includes("palermo") || norm.includes("enea")) {
        reply = "¡Hola Juan! 🚌 La Ruta 23 Centro pasa aproximadamente cada 8 minutos, conectando La Enea y Palermo con el Parque Bolívar en el Centro de Manizales. (Modo Local ⚡)";
      } else if (norm.includes("ruta 12") || norm.includes("chipre") || norm.includes("mirador")) {
        reply = "¡Hola Juan! 🚌 La Ruta 12 Chipre transita por las avenidas principales rumbo al mirador de Chipre con una frecuencia estimada de 10-12 minutos. (Modo Local ⚡)";
      } else if (norm.includes("bus") || norm.includes("ruta") || norm.includes("pas") || norm.includes("cerca") || norm.includes("transporte") || norm.includes("cuales") || norm.includes("cuáles")) {
        reply = "¡Hola Juan! 🚌 Los buses principales en tu zona son:\n• Ruta 23 Centro (Palermo / La Enea hoy cada 8 min).\n• Ruta 12 Chipre (por las principales al mirador).\n• El Cable Aéreo (Terminal a Fundadores). ¿Cuál prefieres abordar? (Modo Local ⚡)";
      } else if (norm.includes("clima") || norm.includes("tiempo") || norm.includes("frio") || norm.includes("frío") || norm.includes("lluvia")) {
        reply = "¡Hola Juan! ⛅ El clima de Manizales actualmente es templado con neblina y riesgo de lloviznas. ¡Te recomiendo salir abrigado y con paraguas! (Modo Local ⚡)";
      } else if (norm.includes("hola") || norm.includes("buenos") || norm.includes("tardes") || norm.includes("noches") || norm.includes("saludo")) {
        reply = "¡Hola Juan! Soy tu asistente de movilidad virtual para Manizales. Pregúntame sobre el Cable Aéreo, la Ruta 23, la Ruta 12 o el clima. ¿En qué te ayudo hoy? (Modo Local ⚡)";
      } else {
        reply = "¡Hola Juan! Por el momento respondo en modo local de alta velocidad debido a un límite de cuota temporal en los servidores principales de Gemini. Puedo resolver al instante tus dudas sobre el Cable Aéreo, la Ruta 23 Centro, la Ruta 12 Chipre y el clima de Manizales. ¿Con cuál empezamos? ⚡";
      }

      res.json({ text: reply });
    }
  } catch (error: any) {
    console.error("Error in /api/gemini/chat:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor al procesar la IA." });
  }
});

// Configure Vite dynamic routing middleware
async function setupRouting() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupRouting();
