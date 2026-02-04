/**
 * Input Components
 *
 * Reusable input field components matching Figma design system.
 * - TextInput: Standard text input with light gray border
 * - TextArea: Standard textarea with light gray border
 * - SearchInput: Search bar with icon
 */

"use client";

import {
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  Textarea as ChakraTextarea,
  TextareaProps as ChakraTextareaProps,
  Box,
} from "@chakra-ui/react";

export type TextInputProps = ChakraInputProps;
export type TextAreaProps = ChakraTextareaProps;

/**
 * Text Input - Standard input field matching Figma design
 * Light gray border (#A0AEC0), rounded corners
 */
export function TextInput({ ...props }: TextInputProps) {
  return (
    <ChakraInput
      borderColor="gray.300"
      _hover={{ borderColor: "gray.400" }}
      _focus={{
        borderColor: "primary.400",
        boxShadow: "0 0 0 1px var(--chakra-colors-primary-400)",
      }}
      borderRadius="md"
      bg="white"
      color="gray.900"
      _placeholder={{ color: "gray.400" }}
      {...props}
    />
  );
}

/**
 * Text Area - Standard textarea field matching Figma design
 * Light gray border (#A0AEC0), rounded corners
 * Same styling as TextInput for consistency
 */
export function TextArea({ ...props }: TextAreaProps) {
  return (
    <ChakraTextarea
      borderColor="gray.300"
      _hover={{ borderColor: "gray.400" }}
      _focus={{
        borderColor: "primary.400",
        boxShadow: "0 0 0 1px var(--chakra-colors-primary-400)",
      }}
      borderRadius="md"
      bg="white"
      color="gray.900"
      _placeholder={{ color: "gray.400" }}
      {...props}
    />
  );
}

/**
 * Search Input - Search bar with search icon
 */
export function SearchInput({ ...props }: TextInputProps) {
  return (
    <Box position="relative" width="100%">
      <Box
        position="absolute"
        left={3}
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        zIndex={1}
      >
        <Box
          as="svg"
          viewBox="0 0 24 24"
          boxSize={5}
          color="gray.400"
        >
          <path
            fill="currentColor"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </Box>
      </Box>
      <TextInput pl={10} placeholder="Search events..." {...props} />
    </Box>
  );
}
