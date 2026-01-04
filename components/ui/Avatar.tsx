/**
 * Avatar Component
 * 
 * Reusable avatar component matching Figma design system.
 * Circular avatars with initials or images
 */

'use client';

import {
  Avatar as ChakraAvatar,
  AvatarProps as ChakraAvatarProps,
  AvatarBadge,
  Box,
} from '@chakra-ui/react';

export interface AvatarProps extends ChakraAvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  size = 'md',
  showBadge = false,
  badgeColor = 'primary.400',
  ...props
}: AvatarProps) {
  const sizeMap = {
    sm: '32px',
    md: '48px',
    lg: '64px',
    xl: '96px',
  };

  return (
    <ChakraAvatar
      name={name}
      src={src}
      size={size}
      borderRadius="full"
      bg={src ? 'transparent' : 'gray.200'}
      color={src ? 'transparent' : 'text.primary'}
      {...props}
    >
      {showBadge && <AvatarBadge boxSize="1.25em" bg={badgeColor} borderColor="white" />}
    </ChakraAvatar>
  );
}

/**
 * Avatar Grid - Grid of avatars (for player lists)
 * Used in match detail pages to show registered players
 */
export interface AvatarGridProps {
  avatars: Array<{ name?: string; src?: string }>;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGrid({ avatars, maxVisible = 12, size = 'md' }: AvatarGridProps) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remaining = avatars.length > maxVisible ? avatars.length - maxVisible : 0;

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
          width={size === 'sm' ? '32px' : size === 'md' ? '48px' : '64px'}
          height={size === 'sm' ? '32px' : size === 'md' ? '48px' : '64px'}
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

