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

    const prompt = `Tienes un historial de mensajes con el usuario de la aplicación Manizales en Ruta:
${formatHistory}
Por favor responde al último mensaje del usuario como el Asistente IA de movilidad de Manizales.
Toma en cuenta la definición de tarifas aprobadas para 2026 en Manizales si el usuario lo pregunta:
- Tarifas Oficiales 2026:
  * Bus Básico: $3.000 COP (antes estaba en $2.650).
  * Bus y Buseta Ejecutiva: $3.250 COP (antes estaba en $2.900).
  * Microbús (Colectivo): $3.350 COP (antes estaba en $3.000).
  * Cable Aéreo: $3.250 COP (antes estaba en $2.900) por trayecto (conecta la Terminal de Transportes en Los Cámbulos con Fundadores y Villamaría).
- Análisis de la Medida Económica: Las alzas representan incrementos porcentuales del 11.7% al 13.2%, los cuales se encuentran muy por debajo del incremento del 23.7% decretado para el salario mínimo por el Gobierno Nacional, reflejando un esfuerzo por mitigar el impacto sobre el bolsillo de los ciudadanos.
- Empresas de Transporte principal en Manizales:
  * Socobuses: Cubre gran parte de las avenidas principales (Avenida Santander, Paralela, etc.) y barrios como Palermo, Chipre y La Enea.
  * Unitrans: Conecta La Enea, Centro, San Jorge, etc.
  * Sideral, Autolegal y Gran Caldas: Ofrecen busetas y colectivos rápidos por la ciudad.
  * Serviturismo y Expreso Sidón: Rutas complementarias para diversas comunas.
- Cómo llegar a lugares turísticos y emblemáticos de Manizales:
  * Al Centro / Parque Bolívar / Catedral Basílica: Tomar cualquier buseta con letrero "Centro" o "Carrera 22" (por ejemplo, de Socobuses o Autolegal desde Palermo o Milán tarda unos 20 min). También usando el Cable Aéreo hasta la Estación Fundadores y caminando por la Carrera 23.
  * A Chipre / Mirador / Monumento a los Colonizadores: Abordar rutas con letrero "Santander - Chipre" de las empresas Sideral o Autolegal. Cruza toda la Avenida Santander.
  * Al Cable / Zona Rosa: Tomar rutas que vayan por la "Avenida Santander" y bajarse en el sector de El Cable (frente a la Torre de Herveo).
  * A los Termales (Termales del Otoño / Tierra Viva): Tomar transporte hacia la vereda Gallinazo. Hay colectivos especiales o taxis desde el sector de la Terminal de Transportes o San Marcel/Vía al Magdalena. No hay ruta directa de buseta urbana ordinaria, por lo que se recomienda taxi o colectivo intermunicipal de Villamaría.
- El usuario actual se llama Juan Pérez, con cédula 10.123.456. Responde preferiblemente de forma amigable (¡Hola Juan!).

Instrucciones de formato:
- Sé detallado, informativo y muy amigable. Explica bien cuáles empresas sirven, el precio de la tarifa correspondiente de forma precisa y cómo debe abordar el vehículo o trayecto.
- Explica de forma clara que el alza moderada (11.7% - 13.2%) estuvo pensada para aliviar el bolsillo en comparación con el 23.7% de incremento salarial.
- Brinda información precisa e inmediata para la fluidez en movimiento.
- Usa emojis de transporte de manera sutil pero clara.
- El idioma debe ser exclusivamente Español.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres 'Chat de Ayuda', el asistente virtual experto en movilidad de la aplicación municipal Manizales en Ruta para la ciudad de Manizales, Colombia. Eres capaz de explicar detalladamente las empresas de transporte colectivo (Socobuses, Unitrans, Sideral, Autolegal, Gran Caldas, Serviturismo), tarifas definitivas vigentes para 2026 (Bus básico $3.000, Bus/Buseta ejecutiva $3.250, Microbús $3.350, Cable Aéreo $3.250) y explicar que estos incrementos (11.7% a 13.2%) buscan contrarrestar el impacto del 23.7% del salario mínimo. Brinda guías turísticas o de transporte precisas para llegar a puntos clave como Chipre, El Centro, El Cable y los Termales. Responde siempre con amabilidad, estructura tus respuestas con viñetas claras y saludando a Juan Pérez.",
          temperature: 0.6,
        }
      });

      const reply = response.text || "Disculpas, Juan. No pude procesar tu solicitud de asistencia en este momento. ¿Te gustaría volver a intentarlo?";
      res.json({ text: reply });
    } catch (apiError: any) {
      console.warn("Gemini API error detected, falling back to instant local responder:", apiError);
      
      // Smart Keyword fallback
      const norm = lastUserMessage.toLowerCase();
      let reply = "";
      
      if (norm.includes("empresa") || norm.includes("empresas") || norm.includes("cooperativa") || norm.includes("cooperativas")) {
        reply = `¡Hola Juan! 🚌 En Manizales operan principalmente las siguientes empresas de transporte público municipal:

1. **Socobuses**: Líder en rutas por las avenidas principales (Santander, Paralela), conectando Palermo, Milán, Chipre y La Enea.
2. **Unitrans**: Cobertura excelente en La Enea, Centro, San Jorge y sectores universitarios.
3. **Autolegal, Sideral y Gran Caldas**: Ofrecen recorridos ágiles de busetas y colectivos (microbuses) por toda la ciudad.
4. **Serviturismo y Expreso Sidón**: Rutas complementarias para comunas periféricas.

Todas estas flotas están integradas en la movilidad urbana de la ciudad, facilitando el trasbordo a pie de calle. ¿Deseas saber cuál te sirve para una ruta específica? 🗺️ (Modo de Ayuda Local ⚡)`;
      } else if (norm.includes("tarifa") || norm.includes("precio") || norm.includes("costo") || norm.includes("pagar") || norm.includes("pasaje") || norm.includes("valor")) {
        reply = `¡Hola Juan! 💳 Las tarifas oficiales para **2026** de transporte público en Manizales están establecidas de la siguiente manera:

• 🚌 **Bus básico**: **$3.000 COP** (subió de $2.650 COP).
• 🚌 **Bus y Buseta ejecutiva**: **$3.250 COP** (subió de $2.900 COP).
• 🚐 **Microbús / Colectivo**: **$3.350 COP** (subió de $3.000 COP).
• 🚡 **Cable Aéreo**: **$3.250 COP** por trayecto (subió de $2.900 COP).

*Nota de contexto:* Estos incrementos se ubican entre el **11.7% y el 13.2%**. Este rango es significativamente inferior al aumento del **23.7%** del salario mínimo decretado por el Gobierno Nacional, lo que evidencia una decisión de la administración orientada a mitigar el impacto económico sobre el bolsillo de todos los usuarios. ¡Buen viaje! ⚡ (Modo de Ayuda Local ⚡)`;
      } else if (norm.includes("como ir") || norm.includes("cómo ir") || norm.includes("como llegar") || norm.includes("cómo llegar") || norm.includes("ruta a") || norm.includes("destino") || norm.includes("llegar a")) {
        // 1. HOSPITALES Y CENTROS DE SALUD
        if (norm.includes("hospital") || norm.includes("clinica") || norm.includes("clínica") || norm.includes("salud") || norm.includes("urgencias") || norm.includes("presentacion") || norm.includes("presentación") || norm.includes("sofia") || norm.includes("sofía") || norm.includes("ses")) {
          if (norm.includes("sofia") || norm.includes("sofía")) {
            reply = `¡Hola Juan! 🏥 Para llegar al **Hospital Santa Sofía** (ubicado cerca de Villa Pilar):
• **Buseta recomendada**: Toma cualquier buseta de la empresa **Autolegal** o **Socobuses** que tenga en el letrero "VILLA PILAR - SANTA SOFÍA" por la Avenida Santander o desde el Centro.
• **Precio**: **$3.250 COP** (tarifa ejecutiva 2026).
• **Consejo**: El hospital está al extremo occidente de la ciudad, un trayecto de aproximadamente 20-25 minutos por la vía Chipre/Villa Pilar. (Modo de Ayuda Local ⚡)`;
          } else if (norm.includes("ses") || norm.includes("caldas") || norm.includes("universitario")) {
            reply = `¡Hola Juan! 🏥 Para llegar al **SES Hospital de Caldas** (ubicado en la Calle 48 con Avenida Paralela):
• **Buseta recomendada**: Toma la famosa **Ruta 23 Centro** de **Socobuses** o cualquier buseta que transite por la **Avenida Paralela** o la **Avenida Santander**. Te dejan justo afuera o a solo una cuadra de distancia.
• **Precio**: **$3.250 COP** (tarifa ejecutiva 2026).
• **Consejo**: Al ser una zona sumamente céntrica, hay frecuencias de paso inferiores a 5 minutos. Si deseas mayor rapidez, puedes abordar colectivos (como Gran Caldas o Sideral) por **$3.350 COP**. (Modo de Ayuda Local ⚡)`;
          } else if (norm.includes("presentacion") || norm.includes("presentación")) {
            reply = `¡Hola Juan! 🏥 Para llegar a la **Clínica de la Presentación** (Av. Santander con Calle 60):
• **Buseta recomendada**: Sirve cualquier buseta de **Socobuses**, **Unitrans** o **Sideral** con letrero "AV. SANTANDER". Te dejará justo en la entrada de la clínica.
• **Precio**: **$3.250 COP** (tarifa ejecutiva 2026).
• **Consejo**: Queda en la zona de Multicentro Estrella. Es un sector muy activo y de fácil acceso. (Modo de Ayuda Local ⚡)`;
          } else if (norm.includes("infantil") || norm.includes("san marcel")) {
            reply = `¡Hola Juan! 🏥 Para llegar a la **Clínica San Marcel** o el **Hospital Infantil**:
• **Clínica San Marcel**: Toma busetas de **Socobuses** con destino "LA ENEA" o "PALERMO - SAN MARCEL". Pasan de forma constante frente a la clínica.
• **Hospital Infantil**: Sirve cualquier buseta de la **Avenida Santander** bajándote cerca de la calle 50 (frente al Batallón).
• **Precio**: **$3.250 COP** por buseta o **$3.350 COP** si tomas colectivo rápido. (Modo de Ayuda Local ⚡)`;
          } else {
            reply = `¡Hola Juan! 🏥 En Manizales disponemos de excelentes servicios de salud. Dime en cuál tienes tu cita para detallarte la mejor opción, o revisa estas guías rápidas:
• **SES Hospital de Caldas** (Calle 48 con Paralela): Toma la **Ruta 23** de Socobuses o cualquier buseta por Av. Paralela/Santander (**$3.250 COP**).
• **Hospital Santa Sofía** (Vía Villa Pilar): Aborda busetas de **Autolegal** marca "VILLA PILAR" (**$3.250 COP**).
• **Clínica de la Presentación** (Calle 60): Cualquier ruta de la Av. Santander (**$3.250 COP**).
• **Clínica San Marcel / Hospital Infantil**: Usa rutas con letrero "LA ENEA" o "SAN MARCEL" (**$3.250 / $3.350 COP**).
¿Cuál es tu punto de origen hoy para indicarte la parada más cercana? 🗺️ (Modo de Ayuda Local ⚡)`;
          }
        }
        // 2. UNIVERSIDADES
        else if (norm.includes("universidad") || norm.includes(" u ") || norm.includes(" u.") || norm.includes("unacional") || norm.includes("ucaldas") || norm.includes("umanizales") || norm.includes("autonoma") || norm.includes("autónoma") || norm.includes("catolica") || norm.includes("católica")) {
          if (norm.includes("caldas") || norm.includes("ucaldas")) {
            reply = `¡Hola Juan! 🎓 Para ir a la **Universidad de Caldas** (Sede Principal / Palogrande en El Cable):
• **Buseta recomendada**: Toma cualquier buseta o colectivo que pase por la **Avenida Santander** con letrero "AV. SANTANDER" o "EL CABLE / CALDAS" (Sideral, Unitrans o Socobuses).
• **Precio**: **$3.250 COP**. (Para las sedes de Versalles o Bellas Artes te sirven las de letrero "CENTRO"). (Modo de Ayuda Local ⚡)`;
          } else if (norm.includes("nacional") || norm.includes("unacional") || norm.includes("unal")) {
            reply = `¡Hola Juan! 🎓 Para ir a la **Universidad Nacional** (Sedes El Cable o La Nubia):
• **Campus El Cable / Palogrande**: Cualquier ruta por la **Avenida Santander** (**$3.250 COP**) te deja directamente al frente de la icónica facultad de Arquitectura o Ingeniería.
• **Campus La Nubia**: Toma la buseta de **Socobuses** o **Unitrans** que indique "LA ENEA" o "LA NUBIA" (**$3.250 COP**), o un microbús/colectivo rápido por **$3.350 COP**. (Modo de Ayuda Local ⚡)`;
          } else if (norm.includes("manizales") || norm.includes("umanizales")) {
            reply = `¡Hola Juan! 🎓 Para ir a la **Universidad de Manizales** (ubicada en Campohermoso):
• **Buseta recomendada**: Aborda busetas de la empresa **Autolegal** o **Sideral** con aviso claro de "CAMPOHERMOSO" o "U. DE MANIZALES" transitando desde el Centro o la Av. Santander.
• **Precio**: **$3.250 COP**. (Modo de Ayuda Local ⚡)`;
          } else {
            reply = `¡Hola Juan! 🎓 Manizales destaca como ciudad universitaria. Para llegar a los campus principales:
• **U. Caldas & U. Nacional (El Cable)**: Cualquier buseta con aviso de "AV. SANTANDER" (**$3.250 COP**).
• **U. Nacional (La Nubia)**: Busetas a "LA ENEA" de Socobuses o Unitrans (**$3.250 COP**).
• **U. de Manizales (Campohermoso)**: Busetas de Autolegal con letrero "CAMPOHERMOSO" (**$3.250 COP**).
• **U. Autónoma & U. Católica (Cerca a Fundadores)**: Cualquier ruta al "CENTRO" (**$3.250 COP**) o usa el **Cable Aéreo ($3.250 COP)** bajándose en Fundadores. (Modo de Ayuda Local ⚡)`;
          }
        }
        // 3. CENTROS COMERCIALES
        else if (norm.includes("comercial") || norm.includes("centro comercial") || norm.includes("cc") || norm.includes("c.c") || norm.includes("mallplaza") || norm.includes("mall plaza") || norm.includes("cable plaza") || norm.includes("fundadores")) {
          if (norm.includes("mall") || norm.includes("plaza") && norm.includes("carola")) {
            reply = `¡Hola Juan! 🛍️ Para ir al **Centro Comercial Mallplaza** (Sector La Carola / Kevin Ángel):
• **Buseta recomendada**: Toma cualquier colectivo o buseta que baje o suba por la **Avenida Kevin Ángel** operados por **Sideral** o **Gran Caldas**.
• **Precio**: **$3.250 COP** (buseta ejecutiva) o **$3.350 COP** (colectivo continuo). Te dejarán en el puente peatonal que conecta directamente con el centro comercial. (Modo de Ayuda Local ⚡)`;
          } else if (norm.includes("cable") && norm.includes("plaza")) {
            reply = `¡Hola Juan! 🛍️ Para ir al **Centro Comercial Cable Plaza** (en El Cable):
• **Buseta recomendada**: Cualquier buseta que suba o baje por la **Avenida Santander**. Te dejará en el paradero de El Cable, justo frente al centro comercial.
• **Precio**: **$3.250 COP**. (Modo de Ayuda Local ⚡)`;
          } else if (norm.includes("fundadores")) {
            reply = `¡Hola Juan! 🛍️ Para ir al **Centro Comercial Fundadores**:
• **Medio sugerido**: Te súper recomiendo el **Cable Aéreo ($3.250 COP)** bajando en la Estación Fundadores. Hay una conexión directa y techada desde el andén de la estación hacia el centro comercial.
• **Vía alternativa**: Aborda cualquier colectivo o buseta con letrero "CENTRO" transitando por la Av. Santander. (Modo de Ayuda Local ⚡)`;
          } else {
            reply = `¡Hola Juan! 🛍️ En Manizales cuentas con grandes alternativas de comercio y ocio:
• **CC Mallplaza (Av. Kevin Ángel)**: Colectivos o busetas por la Kevin Ángel de Sideral o Gran Caldas (**$3.250 - $3.350 COP**).
• **CC Cable Plaza (El Cable)**: Cualquier buseta que transite por la Av. Santander (**$3.250 COP**).
• **CC Fundadores (Centro)**: Utiliza preferiblemente el **Cable Aéreo ($3.250 COP)** para una llegada ágil y sin tacos. (Modo de Ayuda Local ⚡)`;
          }
        }
        // 4. TERMINAL DE TRANSPORTES Y AEROPUERTO
        else if (norm.includes("terminal") || norm.includes("aeropuerto") || norm.includes("cambulos") || norm.includes("cámbulos") || norm.includes("nubia")) {
          if (norm.includes("terminal") || norm.includes("cambulos") || norm.includes("cámbulos")) {
            reply = `¡Hola Juan! 🚌 Para llegar a la **Terminal de Transportes de Manizales (Los Cámbulos)**:
• **La Opción Estrella (Súper Ecológica)**: Toma el **Cable Aéreo** desde la estación Fundadores (Centro) o la estación Villamaría. Te tardas solo unos minutos y viajas libre de tacos por un costo de **$3.250 COP**.
• **En Buseta**: Aborda busetas de **Socobuses** con aviso "TERMINAL" que bajen por la Avenida Paralela. Tarifa: **$3.250 COP**. (Modo de Ayuda Local ⚡)`;
          } else {
            reply = `¡Hola Juan! ✈️ Para llegar al **Aeropuerto La Nubia**:
• **Buseta recomendada**: Aborda las busetas de **Socobuses** o **Unitrans** destinadas a **LA ENEA** que pasan por la Avenida Santander y San Marcel. Indícale al conductor que te deje en la glorieta frente al aeropuerto.
• **Precio**: **$3.250 COP** (buseta) o **$3.350 COP** (colectivo rápido). Un taxi para este trayecto suele rondar entre **$17.000 a $20.000 COP** según tu punto de origen. (Modo de Ayuda Local ⚡)`;
          }
        }
        // 5. DESTINOS TURÍSTICOS CONOCIDOS - CHIPRE
        else if (norm.includes("chipre") || norm.includes("colonizadores") || norm.includes("mirador")) {
          reply = `¡Hola Juan! 🌅 Para llegar al emblemático barrio **Chipre** o al **Monumento a los Colonizadores**:
• **Desde El Cable / Av. Santander**: Toma cualquier buseta o colectivo de **Sideral** o **Autolegal** que diga "SANTANDER - CHIPRE". Te llevará directo por toda la Av. Santander hasta el mirador en unos 15-20 minutos por **$3.250 COP** (Tarifa Buseta 2026).
• **Desde el Centro**: Puedes tomar un colectivo corto de la empresa **Socobuses** subiendo por la carrera 22. Son solo 8 minutos.
• **Recomendación**: El mejor momento para ir es al atardecer para disfrutar de oblea, café y una vista espectacular sobre el cañón del río Cauca. ☕ (Modo de Ayuda Local ⚡)`;
        } else if (norm.includes("termal") || norm.includes("termales") || norm.includes("otoño") || norm.includes("tierra viva") || norm.includes("gallinazo")) {
          reply = `¡Hola Juan! 🌋 Para llegar a la zona de **Termales (Termales del Otoño, Tierra Viva o El Otoño)** en la vereda Gallinazo:
1. **Ubicación**: Se encuentran saliendo de Manizales, vía al Parque Nacional Natural Los Nevados.
2. **Cómo llegar**:
   • **En Colectivo de Villamaría**: En el sector de la Terminal de Transportes (Los Cámbulos) o en San Marcel, puedes tomar colectivos intermunicipales que suben a la vereda Gallinazo (Tarifa aprox: **$4.000 COP**).
   • **En Taxi**: Te llevará directamente desde cualquier punto de la ciudad (Ej. desde El Cable tarda unos 20 minutos; costo aproximado de **$17.000 a $20.000 COP**).
   • **Nota**: No hay rutas directas de busetas tradicionales del servicio urbano municipal de Manizales hasta los termales mismos. ¡Disfruta del agua termal y del nevado! 🧖‍♂️ (Modo de Ayuda Local ⚡)`;
        } else if (norm.includes("centro") || norm.includes("bolivar") || norm.includes("bolívar") || norm.includes("catedral")) {
          reply = `¡Hola Juan! ⛪ Para llegar al **Centro Histórico, Plaza de Bolívar o la Catedral Basílica**:
• **Desde Palermo**: Toma la **Ruta 23 Centro** de **Socobuses** o **Unitrans**. Pasa cada 8 minutos por la avenida principal de Palermo y baja directamente por la Av. del Centro (Carrera 20) dejándote a una cuadra de la Catedral en 20 minutos por **$3.250 COP** (Tarifa Ejecutiva 2026).
• **Mediante Cable Aéreo**: Si vienes de Villamaría o de la Terminal de Transportes, usa el **Cable Aéreo** hasta la **Estación Fundadores** ($3.250 COP en 2026). Desde allí puedes caminar plácidamente 8 cuadras sobre la peatonalizada Carrera 23 hasta la Plaza de Bolívar. ¡Es un trayecto limpio, ecológico y libre de tacos! 🚡 (Modo de Ayuda Local ⚡)`;
        } else if (norm.includes("cable") || norm.includes("zona rosa") || norm.includes("torre")) {
          reply = `¡Hola Juan! 🗼 Para llegar al céntrico sector de **El Cable (Zona Rosa de Manizales)**:
• **Desde el Centro**: Cualquier buseta que transite con la indicación "AV. SANTANDER". Pasa constantemente por la carrera 22 y te deja frente a la icónica Torre de Herveo por **$3.250 COP**.
• **Desde La Enea / Palermo**: Las rutas de **Unitrans** y **Socobuses** que suben por San Marcel ingresando a la Santander te dejarán directo en El Cable en menos de 15 minutos.
• **Dato de interés**: Allí encontrarás centros comerciales, restaurantes y gran actividad universitaria. ⚡ (Modo de Ayuda Local ⚡)`;
        }
        // 6. RESPONDEDOR INTELIGENTE GENÉRICO EXTRAÍDO (CUALQUIER OTRO DESTINO INGRESO POR EL USUARIO)
        else {
          // Extraer destino si es posible
          const match = norm.match(/(?:como|cómo)\s+(?:ir|llegar|viajar)\s+(?:a|al|hacia|para|en)\s+(.+)/i);
          const destName = match ? match[1].replace(/[?¿!¡.]/g, "").trim() : "";
          const destTitle = destName ? `**${destName.toUpperCase()}**` : "tu destino";
          
          reply = `¡Hola Juan! 🗺️ Para llegar a ${destTitle} en Manizales, estas son las pautas universales de transporte colectivo urbano que te guiarán de forma coherente y segura:
          
• 📍 **Si queda sobre la Avenida Santander**: Pasa casi cualquier ruta de **Socobuses**, **Unitrans** o **Sideral** con aviso frontal "AV. SANTANDER". Cruzará toda la columna vertebral de la ciudad desde Palermo/Enea hasta Fundadores/Centro por **$3.250 COP** (precio aprobado 2026).
• 📍 **Si queda sobre la Avenida Paralela**: Aborda la clásica **Ruta 23 Centro** de **Socobuses** u otras busetas con aviso frontal "PARALELA" (**$3.250 COP**).
• 📍 **Si queda en el Centro Histórico**: Súbete a busetas marcadas con "CENTRO" (**$3.250 COP**) o usa el ecológico y rápido sistema de **Cable Aéreo ($3.250 COP)** bajando en la Estación Fundadores.
• 📍 **Sectores lejanos o periféricos**: Para viajar más ágilmente a barrios como *La Enea, San Marcel, Palermo, Milán o Villa Pilar*, prefiere los ágiles **Microbuses/Colectivos** con su valor unificado de **$3.350 COP**.

¿Me podrías indicar de qué punto sales o si ${destName ? `'${destName}'` : "tu destino"} se encuentra en algún barrio o calle en específico? Te daré al instante la empresa de buseta exacta y su letrero de ruta. 🚌 (Modo de Ayuda Local ⚡)`;
        }
      } else if (norm.includes("cable") || norm.includes("aereo") || norm.includes("aéreo") || norm.includes("teleferico") || norm.includes("teleférico")) {
        reply = "¡Hola Juan! 🚡 El Cable Aéreo opera con total normalidad de 6:00 AM a 10:00 PM, conectando la Terminal de Transportes con la estación Fundadores rápido y libre de trancón. Tarifa unificada 2026 por trayecto: **$3.250 COP**. Cuenta con estaciones en Los Cámbulos, Herveo (Camino Real), Fundadores y el ramal a Villamaría. (Modo de Ayuda Local ⚡)";
      } else if (norm.includes("ruta 23") || norm.includes("palermo") || norm.includes("enea")) {
        reply = "¡Hola Juan! 🚌 La famosa **Ruta 23 Centro** (Socobuses / Unitrans) tiene una fantástica frecuencia de 8 minutos. Sirve de gran ayuda para ir desde La Enea y Palermo por toda la Av. Paralela hasta La 19 y el Parque Bolívar en el Centro de Manizales por **$3.250 COP** (tarifa ejecutiva 2026). (Modo de Ayuda Local ⚡)";
      } else if (norm.includes("ruta 12") || norm.includes("chipre") || norm.includes("mirador")) {
        reply = "¡Hola Juan! 🚌 La **Ruta 12 Chipre** transita con fluidez por las avenidas principales rumbo al mirador de Chipre con una frecuencia estimada de 10-12 minutos y una tarifa de **$3.250 COP**. Es ideal para ir a disfrutar del obelisco y divisar los municipios aledaños. (Modo de Ayuda Local ⚡)";
      } else if (norm.includes("bus") || norm.includes("colectivo") || norm.includes("ruta") || norm.includes("pas") || norm.includes("cerca") || norm.includes("transporte") || norm.includes("cuales") || norm.includes("cuáles")) {
        reply = `¡Hola Juan! 🚌 Manizales cuenta con excelentes opciones de transporte público colectivo operados por Socobuses, Unitrans, Sideral, Autolegal y Gran Caldas:

• **Bus básico**: $3.000 COP.
• **Bus / Buseta ejecutiva**: $3.250 COP.
• **Microbús / Colectivo**: $3.350 COP.
• **Cable Aéreo**: $3.250 COP.

Dime a qué destino te diriges o qué tarifa quieres consultar para guiarte en tu viaje. 🗺️ (Modo de Ayuda Local ⚡)`;
      } else if (norm.includes("clima") || norm.includes("tiempo") || norm.includes("frio") || norm.includes("frío") || norm.includes("lluvia")) {
        reply = "¡Hola Juan! ⛅ El clima de Manizales actualmente es de montaña (templado/frío) con neblina y llovizna intermitente. Te sugiero salir abrigado y con paraguas por si se presenta el típico \"parapara\" o lluvia suave manizaleña. Recuerda que el Cable Aéreo opera con normalidad salvo eventos de tormenta eléctrica grave. (Modo de Ayuda Local ⚡)";
      } else if (norm.includes("hola") || norm.includes("buenos") || norm.includes("tardes") || norm.includes("noches") || norm.includes("saludo")) {
        reply = "¡Hola Juan! Soy tu Chat de Ayuda de movilidad para Manizales en Ruta. Pregúntame sobre qué empresas de transporte operan, las tarifas oficiales 2026 (bus básico $3.000, buseta $3.250, colectivo $3.350, cable aéreo $3.250), cómo desplazarte a Chipre, Termales, El Cable, o el clima hoy. ¿En qué te puedo asesorar? 😊 (Modo de Ayuda Local ⚡)";
      } else {
        reply = "¡Hola Juan! Estoy activo como tu asistente inteligente local de Manizales en Ruta. Cuéntame: ¿Deseas información de las empresas de transporte en Manizales, las tarifas definitivas de 2026 ($3.000 - $3.350 COP), o cómo ir a destinos tradicionales como Chipre, el Centro, El Cable o los Termales? Estoy aquí para guiarte. 🗺️ (Modo de Ayuda Local ⚡)";
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
