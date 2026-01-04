/**
 * Status Tag Component
 * 
 * Reusable status tag component matching Figma design system.
 * Used for "Joined", "Completed" tags on event cards.
 * Green background (#4ade80) with white text
 */

'use client';

import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface StatusTagProps extends BoxProps {
  children: ReactNode;
  variant?: 'joined' | 'completed' | 'custom';
  bgColor?: string;
}

/**
 * Status Tag - Badge/tag for status indicators
 * Default: Green background with white text (matching Figma design)
 */
export function StatusTag({
  children,
  variant = 'custom',
  bgColor,
  ...props
}: StatusTagProps) {
  const getBgColor = () => {
    if (bgColor) return bgColor;
    if (variant === 'joined' || variant === 'completed') {
      return 'primary.400'; // Green from Figma
    }
    return 'primary.400';
  };

  return (
    <Box
      bg={getBgColor()}
      color="white"
      px={2}
      py={1}
      borderRadius="md"
      fontSize="xs"
      fontWeight="semibold"
      display="inline-block"
      {...props}
    >
      {children}
    </Box>
  );
}

