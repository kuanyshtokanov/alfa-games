"use client";

import {
  ChakraProvider as BaseChakraProvider,
  Toaster,
  Toast,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { system } from "@/lib/theme/theme";
import { toaster } from "@/components/ui/toaster";

interface ChakraProviderProps {
  children: ReactNode;
}

export function ChakraProvider({ children }: ChakraProviderProps) {
  return (
    <BaseChakraProvider value={system}>
      {children}
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast.title}</Toast.Title>
            {toast.description && (
              <Toast.Description>{toast.description}</Toast.Description>
            )}
            <Toast.CloseTrigger />
          </Toast.Root>
        )}
      </Toaster>
    </BaseChakraProvider>
  );
}
