import React, { useState } from "react";
import { UserProfile } from "../types";
import { 
  ArrowLeft, MapPin, Search, ArrowUpDown, Clock, Navigation, AlertTriangle, Info, ShieldCheck, CheckCircle
} from "lucide-react";

interface RutasProps {
  profile: UserProfile;
  speakText: (text: string) => void;
  onBack: () => void;
  preSelectedDestination?: string;
}

export default function RutasScreen({ 
  profile, 
  speakText, 
  onBack,
  preSelectedDestination = ""
}: RutasProps) {
  const [desde, setDesde] = useState("Mi ubicación");
  const [hasta, setHasta] = useState(preSelectedDestination || "Centro de Manizales");
  const [isTripStarted, setIsTripStarted] = useState(false);

  const handleSwap = () => {
    speakText("Intercambiando origen y destino del viaje.");
    const temp = desde;
    setDesde(hasta);
    setHasta(temp);
  };

  const handleStartTrip = () => {
    setIsTripStarted(true);
    speakText(`Iniciando viaje de ${desde} hacia ${hasta}. Mantén activado el GPS. Tu ruta recomendada por Bus 23 y Cable Aéreo tardará aproximadamente 25 minutos.`);
    
    setTimeout(() => {
      setIsTripStarted(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col h-full min-h-full bg-slate-50 text-[#0b1c30] animate-fade-in pb-24">
      {/* Top App Bar */}
      <header className="flex justify-between items-center px-5 h-[64px] sticky top-0 bg-white z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition-transform text-blue-900 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-extrabold text-xl text-blue-900">Planear viaje</span>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm flex-shrink-0">
          <img 
            alt="User profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtkoFYzEOFcsRfMWkvgpfsDk4HELFxudzVXjlUAtnJfazPhzOvvSxdu3ddoCHKz4uods0ooDvjl5CDPMYaAkp5ADu5UBRdVcindEusdEQEQNNkWx5Abzpp_rdSU5OKPCjmOMz689veikGVxqsmZObKictW5qjhFy-7AaeWNs4dAlhfqt7vSN6mDIEmGRsj8EZPxr6OhCeRlmbmpNORMtVjW75M-FnQCGuu1NwTvWc-gj7wdzHhnkTOy9CbNH4IcwQgXJgo1kHTy8U" 
          />
        </div>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-6 w-full">
        {/* Input Group with swapped pathing */}
        <section className="bg-blue-50/50 rounded-3xl p-5 space-y-4 border border-blue-100 shadow-sm relative">
          <div className="absolute left-[31px] top-[46px] bottom-[46px] w-[2px] bg-slate-300 border-dashed border-l-2"></div>
          
          {/* Origen Input */}
          <div className="relative pl-8">
            <span className="absolute left-0 top-[28px] -translate-y-1/2 text-blue-700">
              <MapPin className="w-5 h-5 fill-blue-500" />
            </span>
            <label className="block text-xs font-bold text-slate-500 mb-1">Desde</label>
            <div className="flex items-center bg-white rounded-xl border border-slate-200/80 pr-3 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
              <input 
                className="w-full h-12 bg-transparent border-none outline-none focus:ring-0 px-4 font-semibold text-slate-900"
                type="text"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                placeholder="Ingresar origen..."
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-end pr-3 select-none">
            <button 
              type="button"
              onClick={handleSwap}
              className="w-12 h-12 bg-blue-900 text-white hover:bg-blue-850 rounded-full flex items-center justify-center shadow-md active:rotate-180 transition-transform duration-300 cursor-pointer"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          {/* Destino Input */}
          <div className="relative pl-8">
            <span className="absolute left-0 top-[28px] -translate-y-1/2 text-red-600">
              <MapPin className="w-5 h-5 fill-red-500" />
            </span>
            <label className="block text-xs font-bold text-slate-500 mb-1">Hasta</label>
            <div className="flex items-center bg-white rounded-xl border border-slate-200/80 pr-3 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
              <input 
                className="w-full h-12 bg-transparent border-none outline-none focus:ring-0 px-4 font-semibold text-slate-900"
                type="text"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                placeholder="Ingresar destino..."
              />
              <Search className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </section>

        {/* Recommended Route details */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 ml-1">Ruta recomendada</h2>
          
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-150 shadow-sm hover:shadow-md transition-all">
            {/* Map image placeholder overlay */}
            <div className="h-36 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img 
                alt="Map routing preview" 
                className="w-full h-full object-cover opacity-70" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRz1zyGm-lEZPooUpAf4wuKIa7hxElvWgjypYl-1JqOEi5UZN_x6qbYYXrjo9l_OuGDGB49Lg8y_dyeieY_XKthBLkeNNWylkVILgkvUlixlXFdkJd1hQ3SC8qz8ocjp0VUSSUz2SABtH_jxoYRWzD3AdpG1btFuCf5gFgv5xRFzxfWWos8N0Jk-p-uYPe8FT2bsJjRggQ_1Apha_gjORqLeycYZNi05wqJVwMtXkSS6OEZ8Pjdv85b4dCUcgzEGxRCxLH1CjagRM" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 bg-blue-900 text-white rounded-lg font-bold text-xs">Bus 23</span>
                <span className="px-2.5 py-1 bg-amber-400 text-blue-950 rounded-lg font-bold text-xs shadow-sm">Cable Aéreo</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Transit vehicle connections details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <span className="text-blue-900 font-extrabold text-lg">B23</span>
                  </div>
                  <span className="font-semibold text-slate-400 text-lg">→</span>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-800 font-extrabold text-lg">Cable</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Tiempo estimado</p>
                  <p className="text-3xl font-black text-blue-900">25 min</p>
                </div>
              </div>

              {/* Congestion indicator */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 items-end h-6">
                    <div className="w-1.5 h-3 bg-blue-600 rounded-full"></div>
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <div className="w-1.5 h-4 bg-slate-200 rounded-full"></div>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-400">Nivel de congestión</span>
                    <span className="font-bold text-slate-900">Media</span>
                  </div>
                </div>
                
                <span className="text-slate-400 cursor-pointer">
                  <Info className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Launch Trip button */}
        <button 
          onClick={handleStartTrip}
          disabled={isTripStarted}
          className={`w-full h-[56px] text-white font-extrabold text-lg rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isTripStarted 
              ? "bg-emerald-600 shadow-emerald-100" 
              : "bg-blue-900 hover:bg-blue-850"
          }`}
        >
          {isTripStarted ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Navegación GPS Iniciada</span>
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5 fill-white" />
              <span>Iniciar viaje</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
}
