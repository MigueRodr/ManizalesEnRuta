import React, { useState } from "react";
import { UserProfile, FavoriteDestination } from "../types";
import { 
  Menu, User, ChevronRight, Star, Plus, Check, StarOff, Landmark, History, Coins, Edit3, Save, Compass
} from "lucide-react";

interface PerfilProps {
  profile: UserProfile;
  favorites: FavoriteDestination[];
  onAddFavorite: (fav: FavoriteDestination) => void;
  onToggleStar: (id: string) => void;
  speakText: (text: string) => void;
  onSelectFavorite: (destination: string) => void;
  onUpdateProfile: (name: string, id: string) => void;
  onToggleSidebar: () => void;
}

export default function PerfilScreen({ 
  profile, 
  favorites, 
  onAddFavorite, 
  onToggleStar, 
  speakText,
  onSelectFavorite,
  onUpdateProfile,
  onToggleSidebar
}: PerfilProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputName, setInputName] = useState(profile.nombre);
  const [inputIdCard, setInputIdCard] = useState(profile.cedula);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFavName, setNewFavName] = useState("");
  const [newFavDesc, setNewFavDesc] = useState("");

  const handleSaveProfile = () => {
    onUpdateProfile(inputName, inputIdCard);
    setIsEditing(false);
    speakText(`Perfil actualizado con éxito, Juan.`);
  };

  const handleAddFavoriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFavName.trim()) return;

    const newFav: FavoriteDestination = {
      id: `fav-${Date.now()}`,
      name: newFavName.trim(),
      description: newFavDesc.trim() || "Dirección o barrio en Manizales",
      icon: "map-pin",
      starred: true
    };

    onAddFavorite(newFav);
    speakText(`Se agregó ${newFavName} a tus favoritos.`);
    
    // Reset Form
    setNewFavName("");
    setNewFavDesc("");
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full min-h-full pb-24 animate-fade-in text-[#0b1c30] bg-slate-50">
      
      {/* TopAppBar */}
      <header className="bg-white flex justify-between items-center px-5 h-[64px] shadow-sm z-10 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6 text-blue-900" />
          </button>
          <span className="font-extrabold text-xl text-blue-900">Perfil de Usuario</span>
        </div>
        
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-blue-600 shadow-sm flex-shrink-0">
          <img 
            alt="Juan Pérez" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtkoFYzEOFcsRfMWkvgpfsDk4HELFxudzVXjlUAtnJfazPhzOvvSxdu3ddoCHKz4uods0ooDvjl5CDPMYaAkp5ADu5UBRdVcindEusdEQEQNNkWx5Abzpp_rdSU5OKPCjmOMz689veikGVxqsmZObKictW5qjhFy-7AaeWNs4dAlhfqt7vSN6mDIEmGRsj8EZPxr6OhCeRlmbmpNORMtVjW75M-FnQCGuu1NwTvWc-gj7wdzHhnkTOy9CbNH4IcwQgXJgo1kHTy8U" 
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        
        {/* User Card */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/50 flex flex-col gap-4">
          {!isEditing ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 h-14 w-14 rounded-full flex items-center justify-center border border-blue-100">
                  <User className="w-8 h-8 text-blue-900 fill-blue-105" />
                </div>
                <div>
                  <h2 className="font-black text-xl text-slate-900 leading-tight">{profile.nombre}</h2>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">Cédula: {profile.cedula}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditing(true)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-blue-900 cursor-pointer active:scale-95 transition-all text-sm font-black flex items-center gap-1.5"
                title="Editar Perfil"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                <input 
                  type="text"
                  className="w-full h-12 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded-xl px-4 font-bold text-slate-900 outline-none"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Documento de Cédula</label>
                <input 
                  type="text"
                  className="w-full h-12 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded-xl px-4 font-bold text-slate-900 outline-none"
                  value={inputIdCard}
                  onChange={(e) => setInputIdCard(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleSaveProfile}
                  className="flex-grow h-12 bg-blue-900 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                <button 
                  onClick={() => {
                    setInputName(profile.nombre);
                    setInputIdCard(profile.cedula);
                    setIsEditing(false);
                  }}
                  className="px-4 h-12 bg-slate-100 hover:bg-slate-150 text-slate-600 font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Stats segment */}
        <section className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => speakText("Has acumulado 124 viajes con nosotros en este periodo mensual.")}
            className="bg-blue-900 p-5 rounded-3xl text-white shadow-md flex flex-col justify-between h-32 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <History className="w-6 h-6 text-blue-200" />
            <div>
              <p className="text-3xl font-black">124</p>
              <p className="text-xs font-bold text-blue-100 opacity-80 mt-0.5">Viajes este mes</p>
            </div>
          </div>

          <div 
            onClick={() => speakText("Excelente, has ahorrado un aproximado de 12.500 pesos en transbordos integrados con el Cable Aéreo.")}
            className="bg-amber-400 p-5 rounded-3xl text-blue-950 shadow-md flex flex-col justify-between h-32 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Coins className="w-6 h-6 text-blue-950" />
            <div>
              <p className="text-3xl font-black">$12.5k</p>
              <p className="text-xs font-bold text-blue-950 opacity-80 mt-0.5">Ahorro estimado</p>
            </div>
          </div>
        </section>

        {/* Favorites Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 ml-1">Mis favoritos</h3>
          </div>

          <div className="space-y-3">
            {favorites.map((fav) => (
              <div 
                key={fav.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/50 flex items-center justify-between hover:bg-slate-50 transition-colors min-h-[56px]"
              >
                <div 
                  onClick={() => {
                    speakText(`Planificando ruta hacia tu destino favorito: ${fav.name}.`);
                    onSelectFavorite(fav.description);
                  }}
                  className="flex items-center gap-4 cursor-pointer flex-grow"
                >
                  <div className="w-12 h-12 bg-slate-50 text-blue-900 rounded-2xl flex items-center justify-center border border-slate-100">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-md leading-tight">{fav.name}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">{fav.description}</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onToggleStar(fav.id);
                    speakText(fav.starred ? `Quitando ${fav.name} de favoritos.` : `Dando prioridad de estrella a ${fav.name}.`);
                  }}
                  className="p-2 text-amber-400 hover:text-amber-500 hover:scale-115 transition-all cursor-pointer"
                  title="Eliminar de favoritos"
                >
                  <Star className={`w-6 h-6 ${fav.starred ? "fill-amber-400 text-amber-500" : "text-slate-350"}`} />
                </button>
              </div>
            ))}

            {/* Quick Add Favorite trigger button */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full h-[56px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-600 bg-slate-50 hover:bg-blue-50/20 text-blue-900 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95 duration-100"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar favorito</span>
            </button>
          </div>
        </section>

      </main>

      {/* Add Favorite Destination Popup Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm border border-slate-150 shadow-2xl space-y-4 animate-fade-in text-[#0b1c30]">
            <h3 className="text-lg font-black text-blue-900">Agregar favorito</h3>
            
            <form onSubmit={handleAddFavoriteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Etiqueta (Ej: Casa, Oficina, Gimnasio)</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej: Gimnasio"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  value={newFavName}
                  onChange={(e) => setNewFavName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Dirección o Barrio en Manizales</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej: Barrio Chipre"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  value={newFavDesc}
                  onChange={(e) => setNewFavDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-grow h-11 bg-blue-900 text-white font-extrabold text-sm rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Agregar
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 h-11 bg-slate-150 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
