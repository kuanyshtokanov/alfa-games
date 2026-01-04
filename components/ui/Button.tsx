/**
 * Button Components
 * 
 * Reusable button components matching Figma design system.
 * - PrimaryButton: Green solid button (#4ade80)
 * - SecondaryButton: Outlined button with white background
 * - SocialButton: For Google/Apple login buttons
 */

'use client';

import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'colorPalette'> {
  children: ReactNode;
}

/**
 * Primary Button - Green solid button (#4ade80 from Figma)
 * Used for main CTAs like "Join Match", "Login", "Get Started"
 */
export function PrimaryButton({ children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      colorPalette="primary"
      color="white"
      bg="primary.400"
      _hover={{ bg: 'primary.600' }}
      _active={{ bg: 'primary.700' }}
      borderRadius="md"
      fontWeight="semibold"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

/**
 * Secondary Button - Outlined button with white background
 * Used for secondary actions
 */
export function SecondaryButton({ children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      variant="outline"
      borderColor="gray.300"
      color="text.primary"
      bg="white"
      _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
      _active={{ bg: 'gray.100' }}
      borderRadius="md"
      fontWeight="medium"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

/**
 * Social Login Button - For Google/Apple authentication
 * Outlined style with icon support
 */
export function SocialButton({ children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      variant="outline"
      borderColor="gray.300"
      color="text.primary"
      bg="white"
      _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
      _active={{ bg: 'gray.100' }}
      borderRadius="md"
      fontWeight="medium"
      w="full"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

