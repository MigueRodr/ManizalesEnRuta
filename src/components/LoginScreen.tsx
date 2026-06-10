import React, { useState } from "react";
import { UserProfile } from "../types";
import { User, Badge, Landmark, ArrowRight, HelpCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (profile: UserProfile) => void;
  speakText: (text: string) => void;
}

export default function LoginScreen({ onLoginSuccess, speakText }: LoginProps) {
  const [nombre, setNombre] = useState("Juan Pérez");
  const [cedula, setCedula] = useState("10.123.456");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    speakText(`Bienvenido de nuevo, ${nombre}. Iniciando sesión en ManaRuta.`);
    onLoginSuccess({
      nombre: nombre.trim(),
      cedula: cedula.trim() || "10.123.456",
      isLoggedIn: true,
      isGuest: false,
    });
  };

  const handleGuest = () => {
    speakText("Iniciando sesión como invitado. Bienvenidos a ManaRuta.");
    onLoginSuccess({
      nombre: "Invitado de Manizales",
      cedula: "No registrada",
      isLoggedIn: true,
      isGuest: true,
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-12 pb-8 px-5 animate-fade-in relative">
      {/* Logo Section */}
      <div className="flex flex-col items-center text-center w-full space-y-4 mb-8">
        <div className="w-44 h-44 flex items-center justify-center p-4 bg-white rounded-2xl shadow-md border border-slate-100">
          <img
            alt="Logo ManaRuta"
            className="w-full h-full object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO1txVRzbaXNiDQBqeaGEpHMewLbAj5omWzrdV_JlFal_z5PVJOBrwH7cSEQlZiD_f8kSpiP7Ss2EQh6qtcSqBklg1bQHdi9wgo-FmFi0Dpj5C1I348f73UKKP-z8EyRnwEKT7TNZsHSlCY8lt8zSv2tL09ykjLeGzX52j3N_ymKLdF4y5uvkXBrM4ovnM0c5KF7c0vrx-z-2C6PpOWB8lu3BxFCcXmC1m8KffKULKrJKfhZf-2jGmCZJjSNxjjkQBdIX3d7ZikQQ"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight mt-2">
          Manizales en Ruta
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Inicia sesión fácilmente
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        {/* Input: Nombre Completo */}
        <div className="flex flex-col space-y-2">
          <label
            className="text-sm font-bold text-slate-700 ml-1"
            htmlFor="name"
          >
            Nombre completo
          </label>
          <div className="relative flex items-center bg-white rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-600 transition-all duration-200">
            <span className="text-blue-600 ml-4">
              <User className="w-5 h-5" />
            </span>
            <input
              className="w-full h-[56px] bg-transparent border-none outline-none focus:ring-0 px-4 font-semibold text-slate-900 placeholder:text-slate-400"
              id="name"
              placeholder="Ej: Juan Pérez"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Input: Cédula */}
        <div className="flex flex-col space-y-2">
          <label
            className="text-sm font-bold text-slate-700 ml-1"
            htmlFor="id_card"
          >
            Cédula (esta será tu contraseña)
          </label>
          <div className="relative flex items-center bg-white rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-600 transition-all duration-200">
            <span className="text-blue-600 ml-4">
              <Badge className="w-5 h-5" />
            </span>
            <input
              className="w-full h-[56px] bg-transparent border-none outline-none focus:ring-0 px-4 font-semibold text-slate-900 placeholder:text-slate-400"
              id="id_card"
              placeholder="Número de documento"
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button: Ingresar */}
        <div className="pt-2">
          <button
            className="w-full h-[56px] bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-lg rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-100 flex items-center justify-center cursor-pointer"
            type="submit"
          >
            Ingresar
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="w-full max-w-sm flex items-center space-x-3 py-6">
        <div className="h-[1px] flex-grow bg-slate-200"></div>
        <span className="text-sm font-semibold text-slate-400">o</span>
        <div className="h-[1px] flex-grow bg-slate-200"></div>
      </div>

      {/* Secondary Action: Invitado */}
      <button
        className="w-full max-w-sm h-[56px] bg-white hover:bg-slate-50 border-2 border-blue-900 text-blue-900 font-extrabold text-lg rounded-xl active:bg-blue-50 transition-all duration-100 flex items-center justify-center space-x-3 cursor-pointer"
        type="button"
        onClick={handleGuest}
      >
        <HelpCircle className="w-5 h-5" />
        <span>Continuar como invitado</span>
      </button>

      {/* App Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-amber-400 to-blue-900"></div>
    </div>
  );
}
