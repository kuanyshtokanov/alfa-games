/**
 * Filter Button Component
 * 
 * Reusable filter/toggle button component matching Figma design system.
 * Used for filtering events (All, Football, Basketball, etc.)
 * Active state: Green background (#4ade80)
 * Inactive state: Light gray background with border
 */

'use client';

import { Button, ButtonProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface FilterButtonProps extends ButtonProps {
  children: ReactNode;
  isActive?: boolean;
}

/**
 * Filter Button - Toggle button for filtering content
 * Active: Green background (#4ade80 from Figma)
 * Inactive: Light gray background with border
 */
export function FilterButton({ children, isActive = false, ...props }: FilterButtonProps) {
  return (
    <Button
      bg={isActive ? 'primary.400' : 'white'}
      color={isActive ? 'white' : 'text.primary'}
      border="1px solid"
      borderColor={isActive ? 'primary.400' : 'gray.300'}
      borderRadius="md"
      fontWeight="medium"
      fontSize="sm"
      px={4}
      py={2}
      _hover={{
        bg: isActive ? 'primary.600' : 'gray.50',
        borderColor: isActive ? 'primary.600' : 'gray.400',
      }}
      _active={{
        bg: isActive ? 'primary.700' : 'gray.100',
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

