import { BusRoute, FavoriteDestination, AlertItem } from "./types";

export const INITIAL_ROUTES: BusRoute[] = [
  {
    id: "1",
    name: "Ruta 23 - Centro",
    destination: "Llegando a su parada",
    arrivalTime: 4,
    status: "Pronto",
    distance: "Llegando",
    borderClass: "border-l-[8px] border-amber-400",
    bgClass: "bg-amber-400",
    textClass: "text-amber-800"
  },
  {
    id: "2",
    name: "Ruta 12 - Chipre",
    destination: "A 2 paradas de distancia",
    arrivalTime: 12,
    status: "En camino",
    distance: "2 paradas",
    borderClass: "border-l-[8px] border-blue-600",
    bgClass: "bg-blue-600",
    textClass: "text-blue-100"
  },
  {
    id: "3",
    name: "Ruta 18 - La Enea",
    destination: "Siguiente salida programada",
    arrivalTime: 18,
    status: "En camino",
    distance: "1.2 km",
    borderClass: "border-l-[8px] border-emerald-500",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-100"
  },
  {
    id: "4",
    name: "Ruta 08 - Palermo",
    destination: "Saliendo de la estación",
    arrivalTime: 25,
    status: "En camino",
    distance: "3.4 km",
    borderClass: "border-l-[8px] border-slate-500",
    bgClass: "bg-slate-500",
    textClass: "text-slate-100"
  }
];

export const INITIAL_FAVORITES: FavoriteDestination[] = [
  {
    id: "f1",
    name: "Casa",
    description: "Barrio La Enea",
    icon: "home",
    starred: true
  },
  {
    id: "f2",
    name: "Trabajo",
    description: "Centro de Manizales",
    icon: "briefcase",
    starred: true
  },
  {
    id: "f3",
    name: "Universidad",
    description: "Universidad de Manizales",
    icon: "graduation-cap",
    starred: true
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "a1",
    type: "traffic",
    title: "Congestión vehicular",
    description: "Avenida Santander en sentido Centro. Retrasos estimados de 15 minutos en rutas de bus debido a obras de alcantarillado.",
    time: "08:30 a. m.",
    level: "Media"
  },
  {
    id: "a2",
    type: "service",
    title: "Cable Aéreo",
    description: "El servicio operará hoy con normalidad hasta las 10:00 p. m. debido a trabajos periódicos de mantenimiento técnico.",
    time: "Hace 10m"
  },
  {
    id: "a3",
    type: "traffic",
    title: "Vía Palermo restringida",
    description: "Paso a un solo carril en la calle 68 con carrera 25. Conduce con paciencia o toma desvíos alternos.",
    time: "Hace 1 hora",
    level: "Baja"
  }
];

export const SUGGESTED_CHIPS = [
  "¿Qué buses pasan cerca?",
  "Estado del Cable Aéreo",
  "Alertas de clima hoy",
  "¿Cómo viajo a Chipre?"
];
