/**
 * Avatar Component
 *
 * Reusable avatar component matching Figma design system.
 * Circular avatars with initials or images
 */

"use client";

import { AvatarRoot, AvatarImage, AvatarFallback, Box } from "@chakra-ui/react";

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  badgeColor?: string;
}

/**
 * Avatar - Circular avatar component
 * Matches Figma design with circular shape and optional badge
 */
export function Avatar({
  name,
  src,
  size = "md",
  showBadge = false,
  badgeColor = "primary.400",
  ...props
}: AvatarProps) {
  // Get initials from name
  const getInitials = (name?: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <Box position="relative" display="inline-block" {...props}>
      <AvatarRoot size={size} borderRadius="full">
        {src && <AvatarImage src={src} alt={name} />}
        <AvatarFallback
          bg="gray.200"
          color="gray.900"
          fontSize={
            size === "sm"
              ? "12px"
              : size === "md"
              ? "16px"
              : size === "lg"
              ? "20px"
              : "24px"
          }
          fontWeight="600"
          fontFamily="var(--font-inter), sans-serif"
        >
          {getInitials(name)}
        </AvatarFallback>
      </AvatarRoot>
      {showBadge && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          w="1.25em"
          h="1.25em"
          borderRadius="full"
          bg={badgeColor}
          border="2px solid"
          borderColor="white"
        />
      )}
    </Box>
  );
}

/**
 * Avatar Grid - Grid of avatars (for player lists)
 * Used in match detail pages to show registered players
 */
export interface AvatarGridProps {
  avatars: Array<{ name?: string; src?: string }>;
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
}

export function AvatarGrid({
  avatars,
  maxVisible = 12,
  size = "md",
}: AvatarGridProps) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remaining =
    avatars.length > maxVisible ? avatars.length - maxVisible : 0;

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar key={index} name={avatar.name} src={avatar.src} size={size} />
      ))}
      {remaining > 0 && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width={size === "sm" ? "32px" : size === "md" ? "48px" : "64px"}
          height={size === "sm" ? "32px" : size === "md" ? "48px" : "64px"}
          borderRadius="full"
          bg="gray.200"
          color="text.secondary"
          fontSize="sm"
          fontWeight="medium"
        >
          +{remaining}
        </Box>
      )}
    </Box>
  );
}
