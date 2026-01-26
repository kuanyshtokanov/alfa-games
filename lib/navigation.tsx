/**
 * Navigation Items Configuration
 * 
 * Centralized configuration for bottom navigation items
 * Used across the application for consistent navigation
 * Supports role-based navigation items
 */

import { BottomNavItem } from "@/components/ui/BottomNav";


/**
 * Get navigation items based on user role
 * @param role - User role: 'player', 'host', or 'admin'
 * @param isClubManager - Whether the user is a club manager
 * @returns Array of navigation items for the user
 */
/**
 * Get navigation items based on user role
 * @param t - Translation function
 * @param role - User role: 'player', 'host', or 'admin'
 * @param isClubManager - Whether the user is a club manager
 * @returns Array of navigation items for the user
 */
export function getBottomNavItems(
  t: (key: string) => string,
  role?: "player" | "host" | "admin" | null,
  isClubManager: boolean = false
): BottomNavItem[] {
  // Base navigation items available to all users
  const baseNavItems: BottomNavItem[] = [
    {
      label: t("home"),
      href: "/games",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: t("myEvents"),
      href: "/my-events",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  // Navigation items for admins
  const adminNavItems: BottomNavItem[] = [
    {
      label: t("admin"),
      href: "/admin",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
  ];

  // Common navigation items (always shown)
  const commonNavItems: BottomNavItem[] = [
    {
      label: t("profile"),
      href: "/profile",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const items: BottomNavItem[] = [...baseNavItems];

  // Add role-specific items
  if (role === "admin") {
    // Admins get admin nav item
    items.push(...adminNavItems);
  }
  // Note: "My Events" is now in baseNavItems, so all users see it

  // Always add common items (Profile) at the end
  items.push(...commonNavItems);

  return items;
}

/**
 * Default navigation items (for backwards compatibility)
 * Shows base items + Profile
 */

