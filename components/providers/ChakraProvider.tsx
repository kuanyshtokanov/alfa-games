"use client";

import { ChakraProvider as BaseChakraProvider } from "@chakra-ui/react";
import { ReactNode } from "react";
import { system } from "@/lib/theme/theme";

interface ChakraProviderProps {
  children: ReactNode;
}

export function ChakraProvider({ children }: ChakraProviderProps) {
  return <BaseChakraProvider value={system}>{children}</BaseChakraProvider>;
}
