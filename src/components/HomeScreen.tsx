import React, { useState } from "react";
import { UserProfile, BusRoute } from "../types";
import { INITIAL_ROUTES } from "../data";
import { 
  Menu, Search, MapPin, ChevronRight, Bus, Landmark, Sparkles, Navigation, Heart, Share2, Compass, AlertCircle 
} from "lucide-react";

interface HomeProps {
  profile: UserProfile;
  speakText: (text: string) => void;
  onNavigateToTab: (tab: string) => void;
  onSelectFrequent: (destination: string) => void;
  activeRoutes: BusRoute[];
  onToggleSidebar: () => void;
}

export default function HomeScreen({ 
  profile, 
  speakText, 
  onNavigateToTab, 
  onSelectFrequent,
  activeRoutes,
  onToggleSidebar
}: HomeProps) {
  const [searchVal, setSearchVal] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    speakText(`Buscando viaje para ${searchVal}. Abriendo planeador de rutas.`);
    onSelectFrequent(searchVal);
  };

  const handleShareLocation = () => {
    setCopied(true);
    speakText("Ubicación compartida con éxito con tus familiares.");
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full min-h-full pb-16 animate-fade-in text-[#0b1c30] relative">
      {/* Search and Greeting Banner */}
      <section className="px-5 mt-6 mb-8">
        <h1 className="text-4xl font-black text-blue-900 tracking-tight leading-tight">
          ¡Buenos días, {profile.nombre.split(" ")[0]}!
        </h1>
        <p className="text-lg text-slate-500 font-medium mt-1">
          ¿Qué ruta tomaremos hoy?
        </p>
      </section>

      {/* Main Search Bar */}
      <section className="px-5 mb-8">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-6 h-6" />
          </span>
          <input
            aria-label="Search destination"
            className="w-full h-[64px] pl-14 pr-4 bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-2xl font-semibold text-lg shadow-sm placeholder:text-slate-400 transition-all outline-none"
            placeholder="¿A dónde quieres ir?"
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>
      </section>

      {/* Nearby Buses */}
      <section className="px-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-[#0b1c30]">Buses cercanos</h2>
          <button 
            onClick={() => {
              speakText("Mostrando todos los buses de Manizales.");
              onNavigateToTab("rutas");
            }}
            className="text-blue-900 font-bold text-md flex items-center gap-1 cursor-pointer hover:underline"
          >
            Ver todos <ChevronRight className="w-5 h-5 text-blue-900" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {activeRoutes.slice(0, 2).map((route) => {
            const isPronto = route.status === "Pronto";
            return (
              <div 
                key={route.id}
                onClick={() => {
                  speakText(`${route.name} llegará en ${route.arrivalTime} minutos.`);
                  onSelectFrequent(route.name.split(" - ")[1]);
                }}
                className={`bg-white p-5 rounded-2xl ${route.borderClass} border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md active:scale-[0.98] transition-all cursor-pointer h-[100px] border border-y-1`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    isPronto ? "bg-amber-400 text-amber-950" : "bg-blue-900 text-white"
                  }`}>
                    <Bus className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-extrabold text-lg text-slate-900">{route.name}</p>
                    <p className="text-sm font-semibold text-slate-400">{route.destination}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-extrabold ${isPronto ? "text-amber-800" : "text-blue-900"}`}>
                    {route.arrivalTime} min
                  </p>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isPronto ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-800"
                  }`}>
                    {route.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Routes Grid */}
      <section className="px-5 mb-8">
        <h2 className="text-2xl font-extrabold text-[#0b1c30] mb-4">Destinos frecuentes</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => {
              speakText("Planificando viaje a El Centro de Manizales.");
              onSelectFrequent("Centro");
            }}
            className="h-32 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:bg-slate-50 transition-all cursor-pointer group hover:border-blue-400"
          >
            <span className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center transition-colors group-hover:bg-blue-100">
              <Landmark className="w-6 h-6" />
            </span>
            <span className="font-bold text-slate-900">Centro</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              speakText("Planificando viaje al Cable Aéreo.");
              onSelectFrequent("Cable Aéreo");
            }}
            className="h-32 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:bg-slate-50 transition-all cursor-pointer group hover:border-blue-400"
          >
            <span className="w-12 h-12 bg-amber-50 text-amber-900 rounded-full flex items-center justify-center transition-colors group-hover:bg-amber-100">
              <Compass className="w-6 h-6" />
            </span>
            <span className="font-bold text-slate-900">Cable Aéreo</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              speakText("Planificando viaje a la zona de Universidades.");
              onSelectFrequent("Universidades");
            }}
            className="h-32 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:bg-slate-50 transition-all cursor-pointer group hover:border-blue-400"
          >
            <span className="w-12 h-12 bg-emerald-50 text-emerald-900 rounded-full flex items-center justify-center transition-colors group-hover:bg-emerald-100">
              <Sparkles className="w-6 h-6" />
            </span>
            <span className="font-bold text-slate-900">Universidades</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              speakText("Abriendo el menú de favoritos para agregar nuevo destino.");
              onNavigateToTab("perfil");
            }}
            className="h-32 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:bg-slate-50 transition-all cursor-pointer group hover:border-blue-400"
          >
            <span className="w-12 h-12 bg-slate-50 text-slate-900 rounded-full flex items-center justify-center transition-colors group-hover:bg-slate-100">
              <Heart className="w-6 h-6" />
            </span>
            <span className="font-bold text-slate-900">Agregar</span>
          </button>
        </div>
      </section>

      {/* Map Section */}
      <section className="px-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-[#0b1c30]">Mapa en vivo</h2>
          <span className="flex items-center gap-1.5 text-blue-900 font-bold text-sm bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>
            En vivo
          </span>
        </div>
        
        <div className="relative w-full h-[280px] rounded-3xl overflow-hidden shadow-lg border-2 border-slate-150">
          <img 
            alt="Mapa de Manizales" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8k9iiK4N2cv-_Dv7W1231f6lV2B3WOcW6CysINOdH4DktSkDtkWj4G9YFwYb1iGrG44lHfPwct0Qs__DN58y7yuFGvMCIxUY3u8MWz-sobBQOAjJ8n29CYjWK_hvlBqrQnNjheSIDOROt-ppEXWqcEhatz92gIup4kkvoc-KaFouodqYuCn_jA8YoPTEp4Pm_hFHq4b65LuaCVnnwCAkQfpJye0et5o_mhvcd34dPuMZpHwHE1o-EMSgPtzVHb8IUDcWCLDmQNOg"
          />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            <div className="bg-white/95 backdrop-blur px-3.5 py-2.5 rounded-2xl flex items-center gap-2 shadow-md border border-slate-100">
              <MapPin className="text-blue-900 w-4 h-4 flex-shrink-0" />
              <span className="font-bold text-xs text-slate-900">Mi ubicación: Palermo</span>
            </div>
            
            <button 
              type="button"
              onClick={handleShareLocation}
              className="bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold px-3.5 py-2.5 rounded-2xl flex items-center gap-2 shadow-md border border-white active:scale-95 transition-all cursor-pointer text-xs shrink-0"
            >
              <Share2 className="w-4 h-4 text-blue-950 shrink-0" />
              <span>{copied ? "¡Enlace copiado!" : "Compartir ubicación"}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
