/**
 * Game Utility Functions
 * 
 * Helper functions for formatting and processing game data
 */

import type { Game } from "@/types/game";

export type SportFilter = "all" | "football" | "basketball" | "tennis";

/**
 * Format date for display
 * Shows "Today | HH:MM" for today's events, otherwise "Mon DD | HH:MM"
 */
export function formatGameDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return `Today | ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} | ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/**
 * Format location for display
 * Returns address if available, otherwise city and country
 */
export function formatGameLocation(location: Game["location"]): string {
  return (
    location.address ||
    `${location.city || ""} ${location.country || ""}`.trim()
  );
}

/**
 * Format price for display
 * Returns formatted price with currency
 */
export function formatGamePrice(price: number, currency: string): string {
  return `${price} ${currency}`;
}

/**
 * Detect sport type from game title and description
 * Searches for keywords to determine the sport
 */
export function detectGameSportType(game: Game): SportFilter {
  const titleLower = game.title.toLowerCase();
  const descLower = (game.description || "").toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  if (combined.includes("football") || combined.includes("soccer")) {
    return "football";
  }
  if (combined.includes("basketball")) {
    return "basketball";
  }
  if (combined.includes("tennis")) {
    return "tennis";
  }
  return "all";
}
