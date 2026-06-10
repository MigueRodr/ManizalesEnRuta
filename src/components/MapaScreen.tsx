import React, { useState } from "react";
import { UserProfile } from "../types";
import { 
  ArrowLeft, MapPin, Compass, Search, Bus, HelpCircle, Navigation2, Navigation, Layers 
} from "lucide-react";

interface MapaProps {
  profile: UserProfile;
  speakText: (text: string) => void;
  onBack: () => void;
}

export default function MapaScreen({ profile, speakText, onBack }: MapaProps) {
  const [activeLayer, setActiveLayer] = useState<"todos" | "bus" | "cable">("todos");
  const [showOverlays, setShowOverlays] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const handleMarkerClick = (markerId: string, desc: string) => {
    setSelectedMarker(markerId);
    speakText(`Has seleccionado la ${desc}.`);
  };

  const handleLocateMe = () => {
    speakText("Centrando mapa en tu ubicación actual: Barrio Palermo, Manizales.");
    setSelectedMarker("user");
  };

  const handleDiscoverRoutes = () => {
    speakText("Buscando rutas de buses activas en un radio de 500 metros.");
    setSelectedMarker("discover");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden relative pb-[80px]">
      {/* Top App Bar Header */}
      <header className="bg-white/95 backdrop-blur shadow-sm flex justify-between items-center px-5 h-[64px] max-w-md w-full z-50 fixed top-0 left-1/2 -translate-x-1/2 border-x border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 active:scale-95 transition-transform text-blue-900 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-extrabold text-xl text-blue-900">Mapa de Rutas</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              speakText("Cambiando capas del mapa.");
              setActiveLayer(activeLayer === "todos" ? "bus" : activeLayer === "bus" ? "cable" : "todos");
            }}
            className="p-2 rounded-full border border-slate-200 bg-slate-50 text-blue-900 active:scale-95 transition-all text-xs font-bold"
          >
            <Layers className="w-5 h-5 inline-block mr-1" />
            Capas
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 shadow-sm flex-shrink-0">
            <img 
              alt="Juan Pérez" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO1qsw32REI_NB4iQZOOk9F0dzsuJL2oa3eflLmvRy8J2EFhzDnz4IjHsiz0i2mQgGZDwgmDZn7fTzxvdJp5jkh26FG-5P7i8IWpdoqh2kY8kvUNuPZiMWtqystUMKOOPTqBD7TuJQ8VNfwY3T7EdHJhJxX6EfnFzdZkoYH1LhqSoG4gaHz7mVepXf_X0WtoEACWB1XPoWwQyRHMP-dVXoxVKrKp0mLwFMUx40Gc1lUkTBcEtACtR5QWUE9bENJYdbtGuLerYU85U" 
            />
          </div>
        </div>
      </header>

      {/* Map Interactive Area */}
      <main className="flex-grow w-full h-screen relative pt-[64px] z-0">
        {/* Topographic Background Map */}
        <div className="absolute inset-0 w-full h-full bg-slate-200">
          <img 
            className="w-full h-full object-cover grayscale-[15%] opacity-90" 
            alt="Detalle de mapa urbano de Manizales" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAbGxro6ukbKgTSC46srjf5BEaTH9Qg7KmXzZ1R0sxeimWhRSz8Ki3vLq1aRyoP03j1SRnrJ8R2LSAwO7KbIaQLJZ3C1VAi6qIm7UipfnL2eH0PlVO0s0OLWxuvOkWMPAxohOYgoXMynnceruaJ2bJ1sjMIb2dAYUBPxcgyBULnAJoE1vLzZn37y4NUY36P_oUmqhRAFDj33e6I32HORoTsSbDn2GaaxVjLRZtZRhV_cVgdXFUUu2PVFrxMFwreBUlMgvgGbU7jJU" 
          />
          <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
        </div>

        {/* Dynamic Markers Overlaying on specific geographical parts */}
        {(activeLayer === "todos" || activeLayer === "bus") && (
          <>
            {/* Bus 23 Marker */}
            <button 
              onClick={() => handleMarkerClick("b23", "Ruta 23 Centro en movimiento")}
              className="absolute top-[28%] left-[34%] z-20 cursor-pointer focus:outline-none group"
            >
              <div className="bg-amber-400 text-amber-950 p-2.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-bounce duration-1000 transform active:scale-110">
                <Bus className="w-5 h-5 fill-amber-950" />
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-950 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                Ruta 23
              </span>
            </button>

            {/* Bus 12 Marker */}
            <button 
              onClick={() => handleMarkerClick("b12", "Ruta 12 Chipre aproximándose")}
              className="absolute top-[64%] left-[50%] z-20 cursor-pointer focus:outline-none group"
            >
              <div className="bg-blue-900 text-white p-2.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center transform hover:scale-110 active:scale-110">
                <Bus className="w-5 h-5 fill-white" />
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-950 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                Ruta 12
              </span>
            </button>
          </>
        )}

        {(activeLayer === "todos" || activeLayer === "cable") && (
          <button 
            onClick={() => handleMarkerClick("cable", "Estación Fundadores del Cable Aéreo")}
            className="absolute top-[48%] right-[24%] z-20 cursor-pointer focus:outline-none group"
          >
            <div className="bg-amber-500 text-white p-2.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-pulse transform active:scale-110">
              <Navigation2 className="w-5 h-5 fill-white rotate-45" />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-950 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              Cable Estación
            </span>
          </button>
        )}

        {/* User Current Position Marker (Palermo) */}
        <div className="absolute bottom-[35%] left-[25%] z-20">
          <div className="relative">
            <span className="absolute -inset-2 bg-blue-500 rounded-full animate-ping opacity-70"></span>
            <div className="bg-blue-600 text-white p-2.5 rounded-full shadow-lg border-4 border-white flex items-center justify-center relative">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <span className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 bg-white text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded shadow border border-slate-100 whitespace-nowrap">
              Palermo (Tú)
            </span>
          </div>
        </div>

        {/* Selected Marker Detail Card Popover */}
        {selectedMarker && (
          <div className="absolute top-[80px] left-5 right-5 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center">
                <MapPin className="w-5 h-5 fill-blue-900" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-md">
                  {selectedMarker === "b23" && "Ruta 23 - Centro"}
                  {selectedMarker === "b12" && "Ruta 12 - Chipre"}
                  {selectedMarker === "cable" && "Cable Estación Fundadores"}
                  {selectedMarker === "user" && "Barrio Palermo"}
                  {selectedMarker === "discover" && "Búsqueda completa radial"}
                </h4>
                <p className="text-xs font-bold text-slate-500">
                  {selectedMarker === "b23" && "A 4 min de tu parada • Congestión media"}
                  {selectedMarker === "b12" && "A 12 min de tu parada • En camino hacia Chipre"}
                  {selectedMarker === "cable" && "Tiempo estimado de transbordo: 3 min"}
                  {selectedMarker === "user" && "Tu punto de partida actual"}
                  {selectedMarker === "discover" && "¡4 rutas de bus con flujo normal localizadas!"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMarker(null)}
              className="text-xs font-black text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Locate Me FAB Button overlay */}
        <button 
          onClick={handleLocateMe}
          className="absolute bottom-24 right-5 z-30 bg-white hover:bg-slate-50 p-4 rounded-full shadow-xl border border-slate-100 text-blue-900 active:scale-90 transition-transform cursor-pointer"
          aria-label="Ubicarme"
        >
          <Compass className="w-6 h-6 animate-spin-slow" />
        </button>

        {/* Bottom Floating Action Row */}
        <div className="absolute bottom-6 left-5 right-5 z-30">
          <button 
            onClick={handleDiscoverRoutes}
            className="w-full bg-blue-900 hover:bg-blue-855 text-white font-extrabold text-lg h-14 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Navigation className="w-5 h-5 fill-white" />
            <span>Ver rutas cercanas</span>
          </button>
        </div>

      </main>
    </div>
  );
}
