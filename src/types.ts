export interface UserProfile {
  nombre: string;
  cedula: string;
  isLoggedIn: boolean;
  isGuest: boolean;
}

export interface AccessibilitySettings {
  letraGrande: boolean;
  altoContraste: boolean;
  lecturaVoz: boolean;
  botonesGrandes: boolean;
}

export interface AlertItem {
  id: string;
  type: 'traffic' | 'service';
  title: string;
  description: string;
  time: string;
  level?: string;
}

export interface FavoriteDestination {
  id: string;
  name: string;
  description: string;
  icon: string;
  starred: boolean;
}

export interface BusRoute {
  id: string;
  name: string;
  destination: string;
  arrivalTime: number; // in minutes
  status: string; // "Pronto" or "En camino"
  distance: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  loading?: boolean;
}
