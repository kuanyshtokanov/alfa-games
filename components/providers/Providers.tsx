'use client';

import { ChakraProvider } from './ChakraProvider';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

