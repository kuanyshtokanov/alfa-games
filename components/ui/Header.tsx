/**
 * Header Component
 * 
 * Reusable header component matching Figma design system.
 * Header with title and optional back button
 */

'use client';

import { Box, Heading, IconButton, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonAction?: () => void;
  rightContent?: ReactNode;
}

/**
 * Header - Page header with title and optional back button
 * Matches Figma design for detail pages (Match Page, Confirm Participation, etc.)
 */
export function Header({
  title,
  showBackButton = false,
  backButtonAction,
  rightContent,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backButtonAction) {
      backButtonAction();
    } else {
      router.back();
    }
  };

  return (
    <Box as="header" py={4} px={4} bg="white" borderBottom="1px solid" borderColor="gray.200">
      <HStack justify="space-between" align="center">
        <HStack gap={3} flex={1}>
          {showBackButton && (
            <IconButton
              aria-label="Go back"
              variant="ghost"
              onClick={handleBack}
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              }
            />
          )}
          <Heading size="lg" fontWeight="bold" color="text.primary">
            {title}
          </Heading>
        </HStack>
        {rightContent && <Box>{rightContent}</Box>}
      </HStack>
    </Box>
  );
}

