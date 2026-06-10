import React, { useState, useEffect } from "react";
import { UserProfile, AccessibilitySettings, FavoriteDestination, BusRoute } from "./types";
import { INITIAL_ROUTES, INITIAL_FAVORITES } from "./data";

// Import Modular Components
import LoginScreen from "./components/LoginScreen";
import ExperienceScreen from "./components/ExperienceScreen";
import HomeScreen from "./components/HomeScreen";
import RutasScreen from "./components/RutasScreen";
import MapaScreen from "./components/MapaScreen";
import AlertasScreen from "./components/AlertasScreen";
import AsistenteScreen from "./components/AsistenteScreen";
import PerfilScreen from "./components/PerfilScreen";

import { 
  Home, Bus, Bell, User, HelpCircle, Settings, LogOut, Moon, Sun, Menu, X, Landmark, Compass, Sparkles, Star, AlertCircle
} from "lucide-react";

export default function App() {
  // Authentication State
  const [profile, setProfile] = useState<UserProfile>({
    nombre: "Juan Pérez",
    cedula: "10.123.456",
    isLoggedIn: false, // Starts at login selection
    isGuest: false,
  });

  // Accessibility State
  const [accessSettings, setAccessSettings] = useState<AccessibilitySettings>({
    letraGrande: false,
    altoContraste: false,
    lecturaVoz: false,
    botonesGrandes: false,
  });

  // Navigation Tabs: 'inicio' | 'rutas' | 'mapa' | 'alertas' | 'asistente' | 'perfil' | 'experiencia'
  const [activeTab, setActiveTab] = useState<string>("inicio");
  
  // Custom Dynamic State for Favorites & Routes
  const [routes, setActiveRoutes] = useState<BusRoute[]>(INITIAL_ROUTES);
  const [favorites, setSavedFavorites] = useState<FavoriteDestination[]>(INITIAL_FAVORITES);
  
  const [preSelectedDest, setPreSelectedDest] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Web Speech synthesis helper
  const speakText = (text: string) => {
    if (!accessSettings.lecturaVoz) return;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Clears any current queued sound
      
      // Sanitise HTML tags or too much markdown characters
      const cleanText = text.replace(/<[^>]*>/g, "").replace(/[*_#]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "es-CO"; // Colombian Spanish
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger Speech on page changes to assist navigation
  useEffect(() => {
    if (profile.isLoggedIn) {
      if (activeTab === "inicio") {
        speakText(`Pantalla de Inicio. Hola Juan, bienvenido a Manizales en Ruta. ¿A dónde deseas ir hoy?`);
      } else if (activeTab === "rutas") {
        speakText(`Planeador de viaje. Selecciona origen y destino.`);
      } else if (activeTab === "mapa") {
        speakText(`Mapa en vivo de rutas de buses, mostrando transportes activos.`);
      } else if (activeTab === "alertas") {
        speakText(`Canal de Alertas y Clima.`);
      } else if (activeTab === "asistente") {
        speakText(`Hablar con el Chat de Ayuda.`);
      } else if (activeTab === "perfil") {
        speakText(`Perfil de Juan Pérez. Revisa tus estadísticas y favoritos.`);
      } else if (activeTab === "experiencia") {
        speakText(`Configuración de diseño accesible y experiencia cómoda.`);
      }
    }
  }, [activeTab, profile.isLoggedIn]);

  // Sidebar controls
  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (!isSidebarOpen) {
      speakText("Menú de navegación desplegado.");
    }
  };

  // State Mutators
  const handleAddFavorite = (newFav: FavoriteDestination) => {
    setSavedFavorites((prev) => [...prev, newFav]);
  };

  const handleToggleStar = (id: string) => {
    setSavedFavorites((prev) => 
      prev.map(f => f.id === id ? { ...f, starred: !f.starred } : f)
    );
  };

  const handleSelectFrequent = (destination: string) => {
    setPreSelectedDest(destination);
    setActiveTab("rutas");
  };

  const handleUpdateProfile = (name: string, id: string) => {
    setProfile(prev => ({
      ...prev,
      nombre: name,
      cedula: id
    }));
  };

  const handleLogout = () => {
    speakText("Sesión cerrada. Esperamos volver a verte pronto.");
    setProfile({
      nombre: "Juan Pérez",
      cedula: "10.123.456",
      isLoggedIn: false,
      isGuest: false,
    });
    setActiveTab("inicio");
  };

  // Load classes contextually based on accessibility settings
  const containerClasses = [
    accessSettings.letraGrande ? "letra-grande-activa" : "",
    accessSettings.altoContraste ? "alto-contraste-activo" : "",
    accessSettings.botonesGrandes ? "botones-grandes-activa" : "",
  ].join(" ").trim();

  // If user is not logged in, render the login panel
  if (!profile.isLoggedIn) {
    return (
      <div className="min-h-screen w-full md:bg-[#081524] flex justify-center items-center px-4">
        <div className={`w-full max-w-md md:h-[650px] md:rounded-3xl md:overflow-hidden md:shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-slate-50 relative flex flex-col ${containerClasses}`}>
          <LoginScreen 
            onLoginSuccess={(prof) => {
              setProfile(prof);
              setActiveTab("experiencia");
              setIsOnboarded(false);
            }} 
            speakText={speakText} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full md:bg-[#081524] flex justify-center items-center md:py-8 md:px-4">
      <div className={`w-full max-w-md md:max-w-5xl md:rounded-3xl h-screen md:h-[800px] md:max-h-[85vh] md:min-h-0 bg-slate-50 md:shadow-[0_25px_60px_rgba(0,0,0,0.55)] md:border md:border-slate-800 relative flex flex-col md:flex-row overflow-hidden ${containerClasses}`}>
        
        {/* Persistent Left Sidebar: ONLY visible on desktop/PC (md and up). */}
        <aside className="hidden md:flex md:w-64 lg:w-72 bg-white flex-col justify-between p-6 border-r border-slate-200 sticky top-0 h-full shrink-0 z-40">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <img 
                alt="Logo Manizales en Ruta" 
                className="h-8 w-auto bg-blue-900 p-0.5 rounded-lg border border-slate-100" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeLJdYvCN8DcbwZjHPnFtQCThlyJrrcSDc8bR0WPFphMJUufrmzXAX_WcHWj8jqy2SYyVBW7MbYQ6LY03iO6XA6JNcds2ND5bU0r8sA81Gmoeo3KPMKiv22fN9PJvWSk48TWnwTV9L1jY3D9MjEm8MuzamElJuR5hI2SJn3uXJCypmLg7EOKJ9bqmFZA4msHm3719U3DcwrFnaJUs8AX23YfvK-lTnjiEFzg4K03yRCnGsKaH-N5pGQJlLB8CR4MS63t6SuALt71U" 
              />
              <span className="font-extrabold text-blue-900 tracking-tight text-lg">Manizales en Ruta</span>
            </div>

            <nav className="flex flex-col space-y-1">
              <button 
                onClick={() => setActiveTab("inicio")}
                className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                  activeTab === "inicio" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Inicio / Dashboard</span>
              </button>

              <button 
                onClick={() => setActiveTab("rutas")}
                className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                  activeTab === "rutas" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bus className="w-5 h-5" />
                <span>Planear viaje</span>
              </button>

              <button 
                onClick={() => setActiveTab("mapa")}
                className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                  activeTab === "mapa" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Compass className="w-5 h-5" />
                <span>Mapa de Rutas</span>
              </button>

              <button 
                onClick={() => setActiveTab("alertas")}
                className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                  activeTab === "alertas" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Alertas y clima</span>
              </button>

              <button 
                onClick={() => setActiveTab("asistente")}
                className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                  activeTab === "asistente" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span>Ayuda</span>
              </button>

              <button 
                onClick={() => setActiveTab("perfil")}
                className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                  activeTab === "perfil" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Mi Perfil</span>
              </button>

              <button 
                onClick={() => setActiveTab("experiencia")}
                className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                  activeTab === "experiencia" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Tu experiencia</span>
              </button>
            </nav>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full h-12 border border-red-200 hover:bg-red-550 hover:bg-red-50 text-red-650 font-bold px-4 rounded-xl flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </aside>

        {/* Content Panel Area */}
        <div className={`flex-grow flex flex-col relative w-full h-full pb-[80px] md:pb-0 ${
          activeTab === "asistente" || activeTab === "mapa" ? "overflow-hidden" : "overflow-y-auto"
        }`}>
      
        {/* Top Application header drawer */}
        {activeTab !== "experiencia" && activeTab !== "rutas" && activeTab !== "mapa" && activeTab !== "asistente" && (
          <header className="bg-blue-900 text-white flex justify-between items-center px-5 h-[64px] shadow-md z-45 sticky top-0 border-b-2 border-amber-400">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleToggleSidebar}
                aria-label="Menú principal" 
                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 active:scale-95 duration-100 rounded-full cursor-pointer md:hidden"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            <div className="flex items-center gap-2">
              <img 
                alt="Logo Manizales en Ruta" 
                className="h-8 w-auto bg-white p-0.5 rounded-lg border border-slate-100" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeLJdYvCN8DcbwZjHPnFtQCThlyJrrcSDc8bR0WPFphMJUufrmzXAX_WcHWj8jqy2SYyVBW7MbYQ6LY03iO6XA6JNcds2ND5bU0r8sA81Gmoeo3KPMKiv22fN9PJvWSk48TWnwTV9L1jY3D9MjEm8MuzamElJuR5hI2SJn3uXJCypmLg7EOKJ9bqmFZA4msHm3719U3DcwrFnaJUs8AX23YfvK-lTnjiEFzg4K03yRCnGsKaH-N5pGQJlLB8CR4MS63t6SuALt71U" 
              />
              <span className="font-extrabold text-[#facc15] tracking-tight">Manizales</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div 
              onClick={() => setActiveTab("perfil")}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white cursor-pointer hover:border-amber-400 active:scale-95 transition-all shadow-sm"
              title="Ir al perfil"
            >
              <img 
                alt="Retrato de Juan Pérez" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtkoFYzEOFcsRfMWkvgpfsDk4HELFxudzVXjlUAtnJfazPhzOvvSxdu3ddoCHKz4uods0ooDvjl5CDPMYaAkp5ADu5UBRdVcindEusdEQEQNNkWx5Abzpp_rdSU5OKPCjmOMz689veikGVxqsmZObKictW5qjhFy-7AaeWNs4dAlhfqt7vSN6mDIEmGRsj8EZPxr6OhCeRlmbmpNORMtVjW75M-FnQCGuu1NwTvWc-gj7wdzHhnkTOy9CbNH4IcwQgXJgo1kHTy8U" 
              />
            </div>
          </div>
        </header>
      )}

      {/* Main Pages router content */}
      <main className={`flex-grow flex flex-col min-h-0 ${
        activeTab === "asistente" || activeTab === "mapa" ? "h-full" : ""
      }`}>
        {activeTab === "inicio" && (
          <HomeScreen 
            profile={profile} 
            speakText={speakText} 
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onSelectFrequent={handleSelectFrequent}
            activeRoutes={routes}
            onToggleSidebar={handleToggleSidebar}
          />
        )}
        {activeTab === "rutas" && (
          <RutasScreen 
            profile={profile}
            speakText={speakText}
            onBack={() => {
              setPreSelectedDest("");
              setActiveTab("inicio");
            }}
            preSelectedDestination={preSelectedDest}
          />
        )}
        {activeTab === "mapa" && (
          <MapaScreen 
            profile={profile}
            speakText={speakText}
            onBack={() => setActiveTab("inicio")}
          />
        )}
        {activeTab === "alertas" && (
          <AlertasScreen 
            profile={profile}
            speakText={speakText}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onToggleSidebar={handleToggleSidebar}
          />
        )}
        {activeTab === "asistente" && (
          <AsistenteScreen 
            profile={profile}
            speakText={speakText}
            onBack={() => setActiveTab("inicio")}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === "perfil" && (
          <PerfilScreen 
            profile={profile}
            favorites={favorites}
            onAddFavorite={handleAddFavorite}
            onToggleStar={handleToggleStar}
            speakText={speakText}
            onSelectFavorite={handleSelectFrequent}
            onUpdateProfile={handleUpdateProfile}
            onToggleSidebar={handleToggleSidebar}
          />
        )}
        {activeTab === "experiencia" && (
          <ExperienceScreen 
            settings={accessSettings}
            onUpdateSettings={(updated) => {
              setAccessSettings(updated);
              setIsOnboarded(true);
              setActiveTab("inicio");
            }}
            onBack={() => {
              setIsOnboarded(true);
              setActiveTab("inicio");
            }}
            speakText={speakText}
          />
        )}
      </main>
      </div> {/* Close Content Panel Area */}

      {/* Sidebar Overlay Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop click closer */}
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-blue-950/40 backdrop-blur-xs cursor-pointer"
          ></div>
          
          <aside className="relative bg-white w-72 h-full flex flex-col justify-between p-6 shadow-2xl border-r border-slate-100 animate-slide-in">
            <div className="space-y-6">
              
              {/* Sidebar Header */}
              <div className="flex justify-between items-center pr-1 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <img 
                    alt="Logo principal" 
                    className="h-8 w-auto bg-blue-900 p-0.5 rounded-lg" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeLJdYvCN8DcbwZjHPnFtQCThlyJrrcSDc8bR0WPFphMJUufrmzXAX_WcHWj8jqy2SYyVBW7MbYQ6LY03iO6XA6JNcds2ND5bU0r8sA81Gmoeo3KPMKiv22fN9PJvWSk48TWnwTV9L1jY3D9MjEm8MuzamElJuR5hI2SJn3uXJCypmLg7EOKJ9bqmFZA4msHm3719U3DcwrFnaJUs8AX23YfvK-lTnjiEFzg4K03yRCnGsKaH-N5pGQJlLB8CR4MS63t6SuALt71U" 
                  />
                  <span className="font-extrabold text-blue-900 tracking-tight text-lg">Manizales en Ruta</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 cursor-pointer text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Menu Grid */}
              <nav className="flex flex-col space-y-1.5">
                <button 
                  onClick={() => { setActiveTab("inicio"); setIsSidebarOpen(false); }}
                  className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                    activeTab === "inicio" ? "bg-blue-50 text-blue-900" : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Inicio / Dashboard</span>
                </button>

                <button 
                  onClick={() => { setActiveTab("rutas"); setIsSidebarOpen(false); }}
                  className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                    activeTab === "rutas" ? "bg-blue-50 text-blue-900" : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <Bus className="w-5 h-5" />
                  <span>Planear viaje</span>
                </button>

                <button 
                  onClick={() => { setActiveTab("mapa"); setIsSidebarOpen(false); }}
                  className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                    activeTab === "mapa" ? "bg-blue-50 text-blue-900" : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <Compass className="w-5 h-5" />
                  <span>Mapa de Rutas</span>
                </button>

                <button 
                  onClick={() => { setActiveTab("alertas"); setIsSidebarOpen(false); }}
                  className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                    activeTab === "alertas" ? "bg-blue-50 text-blue-900" : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span>Alertas y clima</span>
                </button>

                <button 
                  onClick={() => { setActiveTab("asistente"); setIsSidebarOpen(false); }}
                  className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                    activeTab === "asistente" ? "bg-blue-50 text-blue-900" : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <HelpCircle className="w-5 h-5 animate-pulse" />
                  <span>Ayuda</span>
                </button>

                <button 
                  onClick={() => { setActiveTab("perfil"); setIsSidebarOpen(false); }}
                  className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                    activeTab === "perfil" ? "bg-blue-50 text-blue-900" : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Mi Perfil</span>
                </button>

                <button 
                  onClick={() => { setActiveTab("experiencia"); setIsSidebarOpen(false); }}
                  className={`w-full h-11 px-4 rounded-xl font-bold text-md flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer ${
                    activeTab === "experiencia" ? "bg-blue-50 text-blue-900" : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Tu experiencia</span>
                </button>
              </nav>
            </div>

            {/* Logout drawer footer */}
            <button 
              onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
              className="w-full h-12 border border-red-200 hover:bg-red-50 text-red-650 font-bold px-4 rounded-xl flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer mt-auto"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </aside>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      {activeTab !== "experiencia" && activeTab !== "asistente" && (
        <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full h-[80px] bg-white flex justify-around items-center px-4 pb-2 z-40 border-t border-slate-150 shadow-[0px_-4px_12px_rgba(0,0,0,0.06)] border-x border-slate-100">
          {/* Inicio Tab */}
          <button 
            onClick={() => setActiveTab("inicio")}
            className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 cursor-pointer transition-transform active:scale-90 duration-75 ${
              activeTab === "inicio" ? "text-blue-900 text-shadow-sm scale-110" : "text-slate-400 hover:text-blue-900"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Inicio</span>
          </button>

          {/* Rutas Tab */}
          <button 
            onClick={() => setActiveTab("rutas")}
            className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 cursor-pointer transition-transform active:scale-90 duration-75 ${
              activeTab === "rutas" ? "text-blue-900 text-shadow-sm scale-110" : "text-slate-400 hover:text-blue-900"
            }`}
          >
            <Bus className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Rutas</span>
          </button>

          {/* Map Tab */}
          <button 
            onClick={() => setActiveTab("mapa")}
            className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 cursor-pointer transition-transform active:scale-90 duration-75 ${
              activeTab === "mapa" ? "text-blue-900 text-shadow-sm scale-110" : "text-slate-400 hover:text-blue-900"
            }`}
          >
            <Compass className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Mapa</span>
          </button>

          {/* Alertas Tab */}
          <button 
            onClick={() => setActiveTab("alertas")}
            className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 cursor-pointer transition-transform active:scale-90 duration-75 ${
              activeTab === "alertas" ? "text-blue-900 text-shadow-sm scale-110" : "text-slate-400 hover:text-blue-900"
            }`}
          >
            <Bell className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Alertas</span>
          </button>

          {/* Chat/Asistente Tab */}
          <button 
            onClick={() => setActiveTab("asistente")}
            className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 cursor-pointer transition-transform active:scale-90 duration-75 ${
              activeTab === "asistente" ? "text-blue-900 text-shadow-sm scale-110" : "text-slate-400 hover:text-blue-900"
            }`}
          >
            <HelpCircle className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Ayuda</span>
          </button>

          {/* Profile Tab */}
          <button 
            onClick={() => setActiveTab("perfil")}
            className={`flex flex-col items-center justify-center rounded-2xl w-14 h-14 cursor-pointer transition-transform active:scale-90 duration-75 ${
              activeTab === "perfil" ? "text-blue-900 text-shadow-sm scale-110" : "text-slate-400 hover:text-blue-900"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">Perfil</span>
          </button>
        </nav>
      )}

    </div>
  </div>
);
}
