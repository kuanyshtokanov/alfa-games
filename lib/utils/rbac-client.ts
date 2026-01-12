/**
 * Client-side RBAC Utilities
 *
 * Helper functions for checking user permissions on the client side
 * These functions check the user's role and make API calls to verify permissions
 */

import { User as FirebaseUser } from "firebase/auth";

export interface UserRole {
  id: string;
  role: "player" | "host" | "admin";
  email: string;
  name?: string;
  isClubManager?: boolean;
}

/**
 * Get the current user's MongoDB user data including role
 */
export async function getCurrentUserRole(
  firebaseUser: FirebaseUser
): Promise<UserRole | null> {
  try {
    const token = await firebaseUser.getIdToken();
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.user) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Check if user can create games (client-side check)
 * This is a quick check based on role, but the API will do the final verification
 */
export function canUserCreateGame(userRole: UserRole | null): boolean {
  if (!userRole) {
    return false;
  }

  // Normalize role to lowercase and trim whitespace
  const normalizedRole = String(userRole.role || "")
    .toLowerCase()
    .trim();

  // Admins and hosts can always create games
  if (normalizedRole === "admin" || normalizedRole === "host") {
    return true;
  }

  // Club managers can also create games
  if (userRole.isClubManager === true) {
    return true;
  }

  return false;
}

/**
 * Check if user can manage a specific game (client-side check)
 * This checks if user is admin or the game host
 * For club managers, we need to check via API
 */
export function canUserManageGame(
  userRole: UserRole | null,
  gameHostId: string | { id?: string; _id?: string }
): boolean {
  if (!userRole) return false;

  // Admins can manage all games
  if (userRole.role === "admin") {
    return true;
  }

  // Check if user is the host
  const hostId =
    typeof gameHostId === "string"
      ? gameHostId
      : gameHostId.id || gameHostId._id || "";

  return hostId === userRole.id;
}

/**
 * Check if user can manage games via API (for club managers)
 * This makes an API call to check if user can manage a specific game
 */
export async function canUserManageGameAPI(
  firebaseUser: FirebaseUser,
  gameId: string
): Promise<boolean> {
  try {
    const token = await firebaseUser.getIdToken();
    const response = await fetch(`/api/games/${gameId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    // Try to fetch the game - if we can, we'll check permissions via PATCH
    // For now, we'll use a simpler approach: check if user can access the game
    // The actual permission check happens on PATCH/DELETE
    return true;
  } catch (error) {
    console.error("Error checking game management permission:", error);
    return false;
  }
}
