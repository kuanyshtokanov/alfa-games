/**
 * Button Components
 *
 * Reusable button components matching Figma design system.
 * - PrimaryButton: Green solid button (#3CB371)
 * - SecondaryButton: White button with border
 * - OrangeButton: Orange button with shadow (#F98127)
 * - DisabledButton: Disabled state button
 * - SocialButton: For Google/Apple login buttons
 */

"use client";

import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import { ReactNode } from "react";

export interface ButtonProps extends Omit<ChakraButtonProps, "colorPalette"> {
  children: ReactNode;
}

/**
 * Primary Button - Green solid button (#3CB371 from Figma)
 * Used for main CTAs like "Join Match", "Login", "Get Started"
 *
 * Figma specs:
 * - Background: #3CB371
 * - Text: #FFFFFF
 * - Padding: 12px 16px
 * - Height: 48px
 * - Border-radius: 999px (full)
 * - Font: Inter, 600, 14px, 16px line-height, -0.01em letter-spacing
 */
export function PrimaryButton({ children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      bg="#3CB371"
      color="#FFFFFF"
      _hover={{ bg: "#2FA060" }}
      _active={{ bg: "#258F4F" }}
      borderRadius="full"
      fontWeight="600"
      fontSize="14px"
      lineHeight="16px"
      letterSpacing="-0.01em"
      fontFamily="var(--font-inter), sans-serif"
      px={4}
      py={3}
      h="48px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="6px"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

/**
 * Secondary Button - White button with border
 * Used for secondary actions
 *
 * Figma specs:
 * - Background: #FFFFFF
 * - Border: 1px solid #E5E7EB
 * - Text: #111827
 * - Padding: 12px 16px
 * - Height: 48px
 * - Border-radius: 999px (full)
 * - Font: Inter, 600, 14px, 16px line-height, -0.01em letter-spacing
 */
export function SecondaryButton({ children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      variant="outline"
      bg="#FFFFFF"
      borderColor="#E5E7EB"
      borderWidth="1px"
      color="#111827"
      _hover={{ bg: "#F9FAFB", borderColor: "#D1D5DB" }}
      _active={{ bg: "#F3F4F6" }}
      borderRadius="full"
      fontWeight="600"
      fontSize="14px"
      lineHeight="16px"
      letterSpacing="-0.01em"
      fontFamily="var(--font-inter), sans-serif"
      px={4}
      py={3}
      h="48px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="6px"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

/**
 * Orange Button - Orange button with shadow (#F98127)
 * Used for special actions
 *
 * Figma specs:
 * - Background: #F98127
 * - Text: #FFFFFF
 * - Box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15)
 * - Padding: 12px 16px
 * - Height: 44px
 * - Border-radius: 999px (full)
 * - Font: Inter, 600, 14px, 16px line-height, -0.01em letter-spacing
 */
export function OrangeButton({ children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      bg="#F98127"
      color="#FFFFFF"
      _hover={{ bg: "#E6721A" }}
      _active={{ bg: "#D4630D" }}
      boxShadow="0px 2px 4px rgba(0, 0, 0, 0.15)"
      borderRadius="full"
      fontWeight="600"
      fontSize="14px"
      lineHeight="16px"
      letterSpacing="-0.01em"
      fontFamily="var(--font-inter), sans-serif"
      px={4}
      py={3}
      h="44px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="6px"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

/**
 * Dark Button - Dark button with dark background (#111827)
 * Used for signup and other dark-themed actions
 *
 * Figma specs:
 * - Background: #111827
 * - Text: #FFFFFF
 * - Padding: 12px 16px
 * - Height: 48px
 * - Border-radius: 999px (full)
 * - Font: Inter, 600, 14px, 16px line-height, -0.01em letter-spacing
 */
export function DarkButton({ children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      bg="#111827"
      color="#FFFFFF"
      _hover={{ bg: "#1F2937" }}
      _active={{ bg: "#374151" }}
      borderRadius="full"
      fontWeight="600"
      fontSize="14px"
      lineHeight="16px"
      letterSpacing="-0.01em"
      fontFamily="var(--font-inter), sans-serif"
      px={4}
      py={3}
      h="48px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="6px"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

/**
 * Disabled Button - Disabled state button
 * Used for disabled actions
 *
 * Figma specs:
 * - Background: #F3F4F6
 * - Text: #9CA3AF
 * - Padding: 12px 16px
 * - Height: 48px
 * - Border-radius: 999px (full)
 * - Font: Inter, 600, 14px, 16px line-height, -0.01em letter-spacing
 */
export function DisabledButton({ children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      bg="#F3F4F6"
      color="#9CA3AF"
      cursor="not-allowed"
      _hover={{}}
      _active={{}}
      borderRadius="full"
      fontWeight="600"
      fontSize="14px"
      lineHeight="16px"
      letterSpacing="-0.01em"
      fontFamily="var(--font-inter), sans-serif"
      px={4}
      py={3}
      h="48px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="6px"
      disabled
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
      borderColor="#E5E7EB"
      color="#111827"
      bg="#FFFFFF"
      _hover={{ bg: "#F9FAFB", borderColor: "#D1D5DB" }}
      _active={{ bg: "#F3F4F6" }}
      borderRadius="full"
      fontWeight="600"
      fontSize="14px"
      lineHeight="16px"
      letterSpacing="-0.01em"
      fontFamily="var(--font-inter), sans-serif"
      px={4}
      py={3}
      h="48px"
      w="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="6px"
      {...props}
    >
      {children}
    </ChakraButton>
  );
}
