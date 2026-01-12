/**
 * Styled FieldLabel Component
 * 
 * FieldLabel with consistent styling matching the design system
 */

"use client";

import { FieldLabel as ChakraFieldLabel, FieldLabelProps } from "@chakra-ui/react";

export interface StyledFieldLabelProps extends FieldLabelProps {
  children: React.ReactNode;
}

/**
 * Styled FieldLabel - Consistent label styling across forms
 * Uses gray.900 for primary text color
 */
export function StyledFieldLabel({ children, ...props }: StyledFieldLabelProps) {
  return (
    <ChakraFieldLabel
      fontSize="14px"
      fontWeight="600"
      color="gray.900"
      fontFamily="var(--font-inter), sans-serif"
      mb={2}
      {...props}
    >
      {children}
    </ChakraFieldLabel>
  );
}
