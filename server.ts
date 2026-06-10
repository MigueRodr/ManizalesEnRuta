import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client with safety checks
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("La clave GEMINI_API_KEY no está configurada. Por favor configúrala en Settings > Secrets en AI Studio.");
    }
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

Instrucciones de formato:
- Respuestas claras, concisas, con excelente legibilidad (ideales para adultos mayores o personas en movimiento).
- Usa emojis de transporte de manera sutil pero descriptiva.
- Mantén un tono sumamente respetuoso y servicial.
- El idioma debe ser exclusivamente Español.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres 'Asistente IA', el asistente virtual experto de movilidad y rutas de buses para la app municipal ManaRuta de la ciudad de Manizales, Colombia.",
        temperature: 0.7,
      }
    });

    const reply = response.text || "Disculpa, no pude procesar tu solicitud. ¿Podrías intentar de nuevo?";
    res.json({ text: reply });
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
