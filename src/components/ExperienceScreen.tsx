import React, { useState } from "react";
import { AccessibilitySettings } from "../types";
import { 
  ArrowLeft, Type, Contrast, Volume2, Hand, ChevronRight, CheckCircle2 
} from "lucide-react";

interface ExperienceProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (settings: AccessibilitySettings) => void;
  onBack: () => void;
  speakText: (text: string) => void;
}

export default function ExperienceScreen({ 
  settings, 
  onUpdateSettings, 
  onBack, 
  speakText 
}: ExperienceProps) {
  const [localSettings, setLocalSettings] = useState<AccessibilitySettings>({ ...settings });
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "done">("idle");

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    const nextVal = !localSettings[key];
    const updated = { ...localSettings, [key]: nextVal };
    setLocalSettings(updated);
    
    // Quick user speech response feedback if requested
    if (key === "lecturaVoz") {
      if (nextVal) {
        speakText("Lectura por voz activada.");
      } else {
        speakText("Lectura por voz desactivada.");
      }
    } else if (key === "letraGrande") {
      speakText(nextVal ? "Letra más grande activada." : "Letra normal activada.");
    } else if (key === "altoContraste") {
      speakText(nextVal ? "Contraste alto activado." : "Contraste normal.");
    } else if (key === "botonesGrandes") {
      speakText(nextVal ? "Botones ampliados activados." : "Botones estándar.");
    }
  };

  const handleSave = () => {
    setSavingStatus("saving");
    speakText("Guardando tus preferencias de accesibilidad.");
    
    setTimeout(() => {
      setSavingStatus("done");
      speakText("Configuración guardada de forma exitosa.");
      
      setTimeout(() => {
        onUpdateSettings(localSettings);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full min-h-full bg-slate-50 text-[#0b1c30] animate-fade-in pb-24">
      {/* Top AppBar */}
      <header className="bg-white sticky top-0 z-40 flex justify-between items-center px-5 h-[64px] border-b border-slate-100 shadow-sm">
        <button 
          onClick={onBack}
          aria-label="Volver" 
          className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-slate-100 active:scale-95 transition-transform text-blue-900 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-xl text-blue-900 tracking-tight">Tu experiencia</span>
        <div className="w-12 h-12"></div> {/* Spacer for aligning center */}
      </header>

      <main className="w-full max-w-md mx-auto px-5 pt-8 flex-grow space-y-6">
        {/* Intro Heading */}
        <section>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            ¿Cómo podemos hacer tu experiencia más cómoda?
          </h2>
          <p className="text-lg text-slate-500 font-medium mt-2">
            Elige lo que necesitas para navegar mejor en Manizales en Ruta.
          </p>
        </section>

        {/* Option Grid */}
        <div className="flex flex-col space-y-4">
          
          {/* Option: Large Text */}
          <button
            type="button"
            onClick={() => toggleSetting("letraGrande")}
            className={`w-full relative flex items-center justify-between p-4 bg-white border-2 rounded-2xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all text-left group ${
              localSettings.letraGrande ? "border-blue-700 bg-blue-50/20" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xl">
                <span>TT</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Letra más grande</h3>
                <p className="text-[15px] font-medium text-slate-500">Aumenta el tamaño del texto</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                localSettings.letraGrande 
                  ? "border-blue-900 bg-blue-900 text-white" 
                  : "border-slate-300 bg-white"
              }`}>
                {localSettings.letraGrande && (
                  <svg className="w-4 h-4 stroke-[3] stroke-white" viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Option: High Contrast */}
          <button
            type="button"
            onClick={() => toggleSetting("altoContraste")}
            className={`w-full relative flex items-center justify-between p-4 bg-white border-2 rounded-2xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all text-left group ${
              localSettings.altoContraste ? "border-blue-700 bg-blue-50/20" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <Contrast className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Alto contraste</h3>
                <p className="text-[15px] font-medium text-slate-500">Mejora la visibilidad</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                localSettings.altoContraste 
                  ? "border-blue-900 bg-blue-900 text-white" 
                  : "border-slate-300 bg-white"
              }`}>
                {localSettings.altoContraste && (
                  <svg className="w-4 h-4 stroke-[3] stroke-white" viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Option: Voice Reading */}
          <button
            type="button"
            onClick={() => toggleSetting("lecturaVoz")}
            className={`w-full relative flex items-center justify-between p-4 bg-white border-2 rounded-2xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all text-left group ${
              localSettings.lecturaVoz ? "border-blue-700 bg-blue-50/20" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Volume2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Lectura por voz</h3>
                <p className="text-[15px] font-medium text-slate-500">Escucha la información</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                localSettings.lecturaVoz 
                  ? "border-blue-900 bg-blue-900 text-white" 
                  : "border-slate-300 bg-white"
              }`}>
                {localSettings.lecturaVoz && (
                  <svg className="w-4 h-4 stroke-[3] stroke-white" viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Option: Large Buttons */}
          <button
            type="button"
            onClick={() => toggleSetting("botonesGrandes")}
            className={`w-full relative flex items-center justify-between p-4 bg-white border-2 rounded-2xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all text-left group ${
              localSettings.botonesGrandes ? "border-blue-700 bg-blue-50/20" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
                <Hand className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Botones más grandes</h3>
                <p className="text-[15px] font-medium text-slate-500">Facilita la navegación</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                localSettings.botonesGrandes 
                  ? "border-blue-900 bg-blue-900 text-white" 
                  : "border-slate-300 bg-white"
              }`}>
                {localSettings.botonesGrandes && (
                  <svg className="w-4 h-4 stroke-[3] stroke-white" viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          </button>

        </div>

        {/* Scenic Dusk View Profile element */}
        <div className="relative rounded-2xl overflow-hidden h-44 shadow-lg group border border-slate-200">
          <img 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Catedral Basilica de Manizales" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5sm36zD5q5INW5Q5jCkRC6Pt-7Qeq4o9hDgHa4okmDiU8ZSOqVlwqAfaeUMnGS9SWkhVJrr48Eiq6mOntzviHUEhjmJ5V2h9Pn0GWSn2NVfo9hkiWaBUdNP9HZpOibbpfjZFCiEOWuQNKVG0oz2khQK0dmftOJWW0-q_J6kwhsd5hSfEFLLUv6rWpDhz2nEQxGxNsi8HEBB_-8dbh6GsHca1WjtD26riTtzcGgXT3bXA0LpYooVVdoTJVEZTuxRUrZvC-K7SPQ9o" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-5">
            <span className="text-white text-md font-bold text-shadow">Manizales, Siempre en Ruta</span>
          </div>
        </div>

      </main>

      {/* Button Save */}
      <footer className="w-full max-w-md mx-auto px-5 pb-8 pt-4 sticky bottom-0 bg-slate-50/95 backdrop-blur-sm">
        <button 
          onClick={handleSave}
          disabled={savingStatus === "saving"}
          className={`w-full h-[56px] text-white font-bold text-lg rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            savingStatus === "done" 
              ? "bg-emerald-600" 
              : "bg-blue-900 hover:bg-blue-800"
          }`}
        >
          {savingStatus === "saving" && (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Guardando configuración...</span>
            </>
          )}
          {savingStatus === "done" && (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Configurado exitosamente!</span>
            </>
          )}
          {savingStatus === "idle" && (
            <>
              <span>Guardar y continuar</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
