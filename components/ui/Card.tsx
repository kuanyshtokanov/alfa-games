/**
 * Card Components
 *
 * Reusable card components matching Figma design system.
 * - Card: Base card component
 * - EventCard: Card for displaying events/games
 * - DetailCard: Card for displaying details
 */

"use client";

import {
  Box,
  BoxProps,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  ImageProps,
} from "@chakra-ui/react";
import { ReactNode } from "react";

export interface CardProps extends BoxProps {
  children: ReactNode;
}

/**
 * Base Card Component
 * White background, rounded corners, subtle shadow
 */
export function Card({ children, ...props }: CardProps) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={4}
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
      {...props}
    >
      {children}
    </Box>
  );
}

export interface EventCardProps extends BoxProps {
  image?: string;
  imageAlt?: string;
  title: string;
  date: string;
  location: string;
  price?: string;
  participants?: string;
  sportType?: "football" | "basketball" | "tennis" | "all";
  onAction?: () => void;
  actionLabel?: string;
  statusTag?: string;
  statusTagColor?: string;
}

/**
 * Event Card - For displaying games/events in lists
 * Matches Figma design with sport icon, title, date, location, participants, price, and action button
 */
export function EventCard({
  image,
  imageAlt = "Event image",
  title,
  date,
  location,
  price,
  participants,
  sportType = "all",
  onAction,
  actionLabel = "Join Event",
  statusTag,
  statusTagColor = "primary.400",
  ...props
}: EventCardProps) {
  const getSportIcon = () => {
    switch (sportType) {
      case "football":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2 L12 22 M2 12 L22 12" />
            <path d="M6 6 L18 18 M18 6 L6 18" strokeWidth="1.5" />
          </svg>
        );
      case "basketball":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2 Q16 6 12 12 Q8 18 12 22" />
            <path d="M12 2 Q8 6 12 12 Q16 18 12 22" />
            <path d="M2 12 Q6 8 12 12 Q18 16 22 12" />
            <path d="M2 12 Q6 16 12 12 Q18 8 22 12" />
          </svg>
        );
      case "tennis":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#84CC16" />
            <path
              d="M8 8 L16 16 M16 8 L8 16"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </svg>
        );
      default:
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  const getSportColor = () => {
    switch (sportType) {
      case "football":
        return "#3CB371"; // Green
      case "basketball":
        return "#F98127"; // Orange
      case "tennis":
        return "#84CC16"; // Yellow-green
      default:
        return "#3CB371"; // Default green
    }
  };

  const sportColor = getSportColor();

  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={4}
      boxShadow="sm"
      border="1px solid"
      borderColor="#E5E7EB"
      borderLeftWidth="4px"
      borderLeftColor={sportColor}
      position="relative"
      {...props}
    >
      <HStack align="flex-start" gap={4}>
        {/* Sport Icon */}
        <Box flexShrink={0} mt={1}>
          {getSportIcon()}
        </Box>

        {/* Content */}
        <VStack align="stretch" gap={2} flex={1}>
          <Heading
            size="md"
            fontWeight="600"
            fontSize="16px"
            color="#111827"
            fontFamily="var(--font-inter), sans-serif"
          >
            {title}
          </Heading>

          <VStack align="stretch" gap={1.5}>
            {/* Location */}
            <HStack gap={1.5}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <Text
                fontSize="14px"
                fontWeight="500"
                color="#9CA3AF"
                fontFamily="var(--font-inter), sans-serif"
              >
                {location}
              </Text>
            </HStack>

            {/* Time */}
            <HStack gap={1.5}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <Text
                fontSize="14px"
                fontWeight="500"
                color="#9CA3AF"
                fontFamily="var(--font-inter), sans-serif"
              >
                {date}
              </Text>
            </HStack>

            {/* Participants */}
            {participants && (
              <HStack gap={1.5}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color="#9CA3AF"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {participants}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Action Button */}
          {onAction && (
            <Box pt={1}>
              <Box
                as="button"
                onClick={onAction}
                bg={sportColor}
                color="#FFFFFF"
                w="full"
                py={2.5}
                px={4}
                borderRadius="lg"
                fontWeight="600"
                fontSize="14px"
                fontFamily="var(--font-inter), sans-serif"
                _hover={{ opacity: 0.9 }}
                _active={{ opacity: 0.8 }}
              >
                {actionLabel}
              </Box>
            </Box>
          )}
        </VStack>

        {/* Price Tag */}
        {price && (
          <Box
            bg={sportColor}
            color="#FFFFFF"
            px={3}
            py={1.5}
            borderRadius="full"
            fontSize="14px"
            fontWeight="600"
            fontFamily="var(--font-inter), sans-serif"
            flexShrink={0}
            alignSelf="flex-start"
            position="absolute"
            top={4}
            right={4}
          >
            {price}
          </Box>
        )}
      </HStack>
    </Box>
  );
}
