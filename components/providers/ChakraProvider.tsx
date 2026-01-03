'use client';

import { ChakraProvider as BaseChakraProvider } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface ChakraProviderProps {
  children: ReactNode;
}

export function ChakraProvider({ children }: ChakraProviderProps) {
  return <BaseChakraProvider>{children}</BaseChakraProvider>;
}

