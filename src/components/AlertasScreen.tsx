import React, { useState } from "react";
import { UserProfile, AlertItem } from "../types";
import { INITIAL_ALERTS } from "../data";
import { 
  Menu, CloudDrizzle, ShieldCheck, AlertTriangle, Info, Lightbulb, Map, Globe, Clock, ChevronRight 
} from "lucide-react";

interface AlertasProps {
  profile: UserProfile;
  speakText: (text: string) => void;
  onNavigateToTab: (tab: string) => void;
  onToggleSidebar: () => void;
}

export default function AlertasScreen({ 
  profile, 
  speakText, 
  onNavigateToTab,
  onToggleSidebar
}: AlertasProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  const handleAlertInteraction = (title: string, desc: string) => {
    speakText(`Alerta de movilidad: ${title}. ${desc}`);
  };

  const handleMapRedirect = () => {
    speakText("Abriendo mapa interactivo de congestión de tráfico de Manizales.");
    onNavigateToTab("mapa");
  };

  return (
    <div className="flex flex-col h-full min-h-full pb-24 animate-fade-in text-[#0b1c30] bg-slate-50">
      {/* Top App Bar Header */}
      <header className="bg-white sticky top-0 z-50 flex justify-between items-center px-5 h-[64px] border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            aria-label="Abrir menú" 
            className="flex items-center justify-center w-10 h-10 hover:bg-slate-105 active:scale-95 duration-100 rounded-full text-blue-900 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-extrabold text-xl text-blue-900 tracking-tight">Alertas y clima</span>
        </div>
        
        <div className="flex items-center">
          <img 
            alt="Juan Pérez profile" 
            className="w-[40px] h-[40px] rounded-full border-2 border-blue-200 shadow-sm" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtkoFYzEOFcsRfMWkvgpfsDk4HELFxudzVXjlUAtnJfazPhzOvvSxdu3ddoCHKz4uods0ooDvjl5CDPMYaAkp5ADu5UBRdVcindEusdEQEQNNkWx5Abzpp_rdSU5OKPCjmOMz689veikGVxqsmZObKictW5qjhFy-7AaeWNs4dAlhfqt7vSN6mDIEmGRsj8EZPxr6OhCeRlmbmpNORMtVjW75M-FnQCGuu1NwTvWc-gj7wdzHhnkTOy9CbNH4IcwQgXJgo1kHTy8U" 
          />
        </div>
      </header>

      <main className="flex-grow p-5 space-y-6">
        
        {/* Weather Bento-Style Card */}
        <section 
          onClick={() => speakText("Clima en Manizales Centro: 18 grados, con llovizna suave. Humedad del 88 por ciento.")}
          className="bg-blue-100/60 rounded-3xl p-5 grid grid-cols-2 gap-4 relative overflow-hidden shadow-sm cursor-pointer border border-blue-200"
        >
          <div className="col-span-1 space-y-1 z-10">
            <div className="flex items-center gap-1.5 text-blue-900">
              <CloudDrizzle className="w-6 h-6 text-blue-700" />
              <span className="font-bold text-[15px]">Manizales, Centro</span>
            </div>
            <div className="flex items-baseline pt-1">
              <span className="text-4xl font-black text-blue-900">18°C</span>
            </div>
            <p className="text-md font-extrabold text-[#0b1c30]">Llovizna suave</p>
          </div>

          <div className="col-span-1 flex flex-col justify-end items-end space-y-1 z-10 text-right">
            <div>
              <p className="text-sm font-bold text-slate-500">Humedad: <span className="text-slate-900 font-extrabold">88%</span></p>
              <p className="text-sm font-bold text-slate-500">Viento: <span className="text-slate-900 font-extrabold">10 km/h</span></p>
              <p className="text-xs font-black text-blue-800 uppercase tracking-widest mt-1">Lloviznando</p>
            </div>
          </div>

          {/* Background vector shadow decoration */}
          <div className="absolute -right-6 -top-6 opacity-[0.05] pointer-events-none">
            <CloudDrizzle className="w-40 h-40 text-blue-900" />
          </div>
        </section>

        {/* Alerts Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-[#0b1c30] px-1">Alertas activas</h2>
          
          <div className="space-y-4">
            {alerts.map((alert) => {
              const isTraffic = alert.type === "traffic";
              return (
                <div 
                  key={alert.id}
                  onClick={() => handleAlertInteraction(alert.title, alert.description)}
                  className={`bg-white rounded-3xl p-5 border-l-8 ${
                    isTraffic ? "border-red-600 shadow-sm" : "border-blue-700 shadow-sm"
                  } flex items-start gap-4 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer border`}
                >
                  <div className={`p-3 rounded-2xl ${
                    isTraffic ? "bg-red-50 text-red-650" : "bg-blue-50 text-blue-700"
                  }`}>
                    {isTraffic ? (
                      <AlertTriangle className="w-6 h-6 text-red-650 fill-red-100" />
                    ) : (
                      <Info className="w-6 h-6 text-blue-700" />
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-lg text-slate-900">{alert.title}</h3>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold text-slate-500 mt-1 lines-2">
                      {alert.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recommendation Section */}
        <section className="space-y-4">
          <div className="bg-amber-400 text-blue-950 p-5 rounded-3xl flex items-center gap-4 shadow-md">
            <div className="p-3 bg-white/20 rounded-2xl text-blue-950">
              <Lightbulb className="w-8 h-8 fill-blue-950" />
            </div>
            <div>
              <p className="font-black text-lg">¡Sal con tiempo!</p>
              <p className="text-sm font-semibold opacity-90 mt-0.5">
                Debido a la llovizna, se recomienda salir con 10 minutos de anticipación para evitar congestiones y asegurar tu transbordo al Cable Aéreo.
              </p>
            </div>
          </div>
        </section>

        {/* Traffic Density Map preview */}
        <section className="space-y-4">
          <div 
            onClick={handleMapRedirect}
            className="h-48 rounded-3xl overflow-hidden relative shadow-sm hover:shadow-md border border-slate-150 group cursor-pointer"
          >
            <img 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              alt="Densidad de tráfico en tiempo real" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYAJD07mlTYr0mM0seeJA2sdGKN4RooOd9X5CKSutocQiwBIHBXoYHQSOn1uoytpHS1NDS1J5ktAlQjOTqvc1BmhzBp88bTTWlsPGpakcqUetzi8W9oFUtMyZjrgQFrkDsf0wRIFcVpRlMEkehAHQPWpwcXjtkQzgbtXi5-cXSc8Dd6d8v_2Vz262eoL8dTgCubhxqBhOVrdulUBSvaxsB3rr4Kd7ihvrfRXkoj8BJ6CGc3sRxEJHxwgn06M1NI8bOK3SJLYy2V1E" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end p-5">
              <span className="text-white text-lg font-extrabold">Ver mapa de tráfico</span>
              <p className="text-white/80 text-sm font-semibold">Actualizado en tiempo real • Manizales Vías</p>
            </div>
            
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-lg text-blue-900 border border-slate-100">
              <Map className="w-5 h-5" />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
