/**
 * Game-related TypeScript types
 * 
 * These types represent the API response format (DTOs),
 * which differ from the MongoDB model types (IGame) because:
 * - IDs are strings (not ObjectId)
 * - Dates are ISO strings (not Date objects)
 * - Populated fields are objects (not just IDs)
 */

export interface GameLocation {
  address: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface GameEquipment {
  provided: string[];
  needed: string[];
}

export interface GameHost {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface GameClub {
  id?: string;
  _id?: string;
  name?: string;
}

/**
 * Game type for API responses and frontend usage
 * This is the format returned by the API routes
 */
export interface Game {
  id: string;
  hostId: GameHost | string;
  title: string;
  description?: string;
  location: GameLocation;
  datetime: string; // ISO string
  duration: number;
  maxPlayers: number;
  currentPlayersCount: number;
  price: number;
  currency: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "all";
  equipment: GameEquipment;
  rules?: string;
  hostInfo?: string;
  cancellationPolicy?: string;
  cancellationRule:
    | "anytime"
    | "24hours"
    | "48hours"
    | "72hours"
    | "no_refund"
    | "custom";
  isPublic: boolean;
  clubId?: GameClub | string;
  status: "upcoming" | "cancelled" | "completed";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Game form data type for create/edit forms
 * Similar to Game but with form-specific structure
 */
export interface GameFormData {
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  datetime: string;
  duration: number;
  maxPlayers: number;
  price: number;
  currency: string;
  skillLevel: string;
  equipment: {
    provided: string[];
    needed: string[];
  };
  rules: string;
  hostInfo: string;
  cancellationPolicy: string;
  cancellationRule: string;
  isPublic: boolean;
}

