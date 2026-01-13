/**
 * Green Header Component
 *
 * Universal green header component used across dashboard pages.
 * Features:
 * - Green background with rounded bottom corners
 * - White title text
 * - Optional search bar
 * - Optional filter icon
 * - Custom content support
 *
 * Used on:
 * - Profile page
 * - Find a Match page
 * - Other dashboard pages (except admin pages and game details)
 */

"use client";

import { Box, Heading, Input, HStack, BoxProps } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface GreenHeaderProps extends BoxProps {
  title: string;
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
  children?: ReactNode;
}

/**
 * Green Header - Universal header component for dashboard pages
 * Matches Figma design with green background and rounded bottom corners
 */
export function GreenHeader({
  title,
  showSearch = false,
  searchValue = "",
  searchPlaceholder = "Search by location or title...",
  onSearchChange,
  showFilter = false,
  onFilterClick,
  children,
  ...props
}: GreenHeaderProps) {
  return (
    <Box
      bg="primary.400"
      borderBottomRadius="24px"
      pt={12}
      pb={showSearch ? 4 : 8}
      px={4}
      {...props}
    >
      {/* Title */}
      <Heading
        size="lg"
        color="white"
        textAlign={showSearch ? "left" : "center"}
        fontFamily="var(--font-inter), sans-serif"
        fontWeight="700"
        fontSize={showSearch ? "28px" : "24px"}
        mb={showSearch ? 4 : 0}
      >
        {title}
      </Heading>

      {/* Search Bar */}
      {showSearch && (
        <Box position="relative">
          {/* Search Icon */}
          <Box
            position="absolute"
            left={4}
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
            pointerEvents="none"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </Box>

          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            pl={showFilter ? 12 : 12}
            pr={showFilter ? 12 : 4}
            py={3}
            h="48px"
            w="full"
            bg="#FFFFFF"
            borderColor="#E5E7EB"
            borderWidth="1px"
            borderRadius="3xl"
            fontSize="14px"
            fontWeight="500"
            color="#111827"
            fontFamily="var(--font-inter), sans-serif"
            _placeholder={{ color: "#9CA3AF" }}
            _focus={{
              borderColor: "primary.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-primary-400)",
            }}
          />

          {/* Filter Icon */}
          {showFilter && (
            <Box
              position="absolute"
              right={4}
              top="50%"
              transform="translateY(-50%)"
              cursor="pointer"
              onClick={onFilterClick}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <line x1="6" y1="4" x2="6" y2="20" />
                <line x1="18" y1="4" x2="18" y2="20" />
              </svg>
            </Box>
          )}
        </Box>
      )}

      {/* Custom Content */}
      {children}
    </Box>
  );
}
