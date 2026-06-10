import React, { useState, useRef, useEffect } from "react";
import { UserProfile, ChatMessage } from "../types";
import { SUGGESTED_CHIPS } from "../data";
import { 
  ArrowLeft, Mic, Send, HelpCircle, RefreshCw, ChevronRight, Bus, Play, CheckCircle 
} from "lucide-react";

interface AsistenteProps {
  profile: UserProfile;
  speakText: (text: string) => void;
  onBack: () => void;
  onNavigateToTab: (tab: string) => void;
}

export default function AsistenteScreen({ 
  profile, 
  speakText, 
  onBack,
  onNavigateToTab
}: AsistenteProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "w1",
      sender: "ai",
      text: `¡Hola Juan! Soy tu Chat de Ayuda de movilidad para Manizales en Ruta. 🗺️🚌\nPregúntame sobre qué empresas de transporte operan, las tarifas oficiales 2026 (bus básico $3.000, buseta ejecutiva $3.250, colectivo $3.350, cable aéreo $3.250) o cómo llegar a Chipre, El Cable, el Centro y los Termales.\n¿En qué te puedo asesorar hoy?`,
      timestamp: "10:40 AM"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // API call to server endpoint /api/gemini/chat
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Error del servidor (Código ${response.status})`);
      }

      setIsTyping(false);
      
      const aiResponse = data.text || "Disculpa, no obtuve respuesta del asistente virtual. Por favor intenta de nuevo.";
      
      // Auto-speak the response of Gemini if vocal readers enabled
      speakText(aiResponse);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

    } catch (e: any) {
      console.error(e);
      setIsTyping(false);
      const errorMsg = e.message || "Lo lamento, no logré conectarme al servidor del transporte. Por favor, verifica tu conexión de datos de internet.";
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: errorMsg.includes("GEMINI_API_KEY") 
            ? `⚠️ Clave GEMINI_API_KEY no configurada: Para usar el asistente IA, debes registrar tu clave de Gemini API en la configuración del servidor y en tu panel de Secrets.`
            : `⚠️ Error de conexión: ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
      speakText("Procesando comando de voz simulado.");
      handleSend("¿Qué bus me lleva desde Palermo hacia La Enea?");
    } else {
      setIsListening(true);
      speakText("Escuchando... Habla ahora.");
      setTimeout(() => {
        setIsListening(false);
        handleSend("Cuáles son las alertas de tráfico actuales");
      }, 3500);
    }
  };

  const handleClear = () => {
    speakText("Reiniciando el chat de ayuda.");
    setMessages([
      {
        id: "w1",
        sender: "ai",
        text: `¡Hola Juan! Soy tu Chat de Ayuda de Manizales en Ruta. Puedo resolver al instante tus consultas sobre empresas de buseta (Socobuses, Unitrans, etc.), las tarifas oficiales para 2026 (bus básico $3.000, buseta ejecutiva $3.250, colectivo $3.350, cable aéreo $3.250), o guiarte a destinos emblemáticos como Chipre, el Centro y los Termales. ¿En qué te ayudo? 🗺️`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 relative pb-0 animate-fade-in text-[#0b1c30] overflow-hidden">
      {/* Top App Bar Header */}
      <header className="bg-white z-50 shadow-sm flex justify-between items-center px-5 h-[64px] border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors active:scale-95 duration-100 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-blue-900" />
          </button>
          <span className="font-extrabold text-xl text-blue-900">Chat de Ayuda</span>
        </div>
        
        <button 
          onClick={handleClear}
          title="Reiniciar conversación"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-150 transition-colors active:scale-95 cursor-pointer text-slate-500 hover:text-blue-900"
        >
          <RefreshCw className="w-5 h-5 animate-spin-slow" />
        </button>
      </header>

      {/* Chat Messages scroll area */}
      <main className="flex-grow overflow-y-auto px-5 py-6 space-y-4 min-h-0">
        {messages.map((m) => {
          const isAi = m.sender === "ai";
          return (
            <div key={m.id} className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}>
              {isAi && (
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                  <HelpCircle className="w-5 h-5" />
                </div>
              )}
              
              <div className="flex flex-col max-w-[85%] space-y-1">
                <div className={`p-4 rounded-2xl shadow-sm ${
                  isAi 
                    ? "bg-white text-slate-900 rounded-tl-none border-l-4 border-blue-900" 
                    : "bg-blue-900 text-white rounded-tr-none"
                }`}>
                  <p className="font-semibold text-md whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  
                  {/* Embedded click to focus map action card inside first robot bubble or if Centro is mentioned */}
                  {isAi && (m.text.includes("Ruta 23") || m.text.includes("Centro")) && (
                    <div 
                      onClick={() => {
                        speakText("Mostrando mapa intermodal.");
                        onNavigateToTab("mapa");
                      }}
                      className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-blue-900">
                        <Bus className="w-5 h-5" />
                        <span className="font-bold text-sm">Ver en el mapa</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-900" />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-bold text-slate-400 px-2 ${isAi ? "text-left" : "text-right"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* AI Thinking/Typing State */}
        {isTyping && (
          <div className="flex items-start gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-2.5 h-2.5 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2.5 h-2.5 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Bottom Input & Suggestions Area */}
      <div className="shrink-0 w-full bg-white border-t border-slate-150 shadow-md z-40">
        
        {/* Suggestion Chips */}
        <div className="flex gap-2.5 px-5 py-3 overflow-x-auto hide-scrollbar border-b border-slate-100">
          {SUGGESTED_CHIPS.map((chip, index) => (
            <button 
              key={index}
              onClick={() => handleSend(chip)}
              className="shrink-0 px-4 py-2 bg-slate-50 text-blue-950 font-bold hover:bg-blue-900 hover:text-white rounded-full border border-slate-200 transition-all text-xs cursor-pointer active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Interactive Main Input bar */}
        <div className="px-5 pb-8 pt-3 flex items-center gap-3">
          <button 
            type="button"
            onClick={handleMicToggle}
            className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-md active:scale-90 transition-colors cursor-pointer ${
              isListening 
                ? "bg-red-650 text-white animate-pulse" 
                : "bg-slate-100 text-blue-900 hover:bg-blue-100"
            }`}
          >
            <Mic className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <input 
              className="w-full h-[56px] bg-slate-50 border border-slate-200 outline-none rounded-2xl pr-14 pl-5 focus:ring-2 focus:ring-blue-100 font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 transition-all"
              placeholder={isListening ? "Escuchando voz..." : "Escribe tu mensaje..."}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend(inputText);
              }}
            />
            <button 
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                inputText.trim() 
                  ? "bg-blue-900 text-white hover:bg-blue-800" 
                  : "text-slate-350 bg-slate-100"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
