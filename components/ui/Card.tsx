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
  Button,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { GiSoccerBall } from "react-icons/gi";
import { HiLocationMarker } from "react-icons/hi";
import { HiClock } from "react-icons/hi";
import { HiUsers } from "react-icons/hi";

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
  title: string;
  date: string;
  location: string;
  price?: string;
  participants?: string;
  onAction?: () => void;
  actionLabel?: string;
  actionLoading?: boolean;
  actionDisabled?: boolean;
  onCardClick?: () => void;
}

/**
 * Event Card - For displaying games/events in lists
 * Matches Figma design with sport icon, title, date, location, participants, price, and action button
 */
export function EventCard({
  title,
  date,
  location,
  price,
  participants,
  onAction,
  actionLabel = "Join Event",
  actionLoading = false,
  actionDisabled = false,
  onCardClick,
  ...props
}: EventCardProps) {
  // Use green color scheme consistently
  const cardColor = "#3CB371"; // Primary green

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onCardClick?.();
  };

  const isActionDisabled = actionDisabled || actionLoading;

  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={4}
      boxShadow="sm"
      border="1px solid"
      borderColor="#E5E7EB"
      borderLeftWidth="4px"
      borderLeftColor={cardColor}
      position="relative"
      cursor={onCardClick ? "pointer" : "default"}
      onClick={handleCardClick}
      _hover={onCardClick ? { boxShadow: "md" } : {}}
      transition="box-shadow 0.2s"
      {...props}
    >
      <VStack align="stretch" gap={4}>
        <HStack align="flex-start" gap={4}>
          {/* Sport Icon */}
          <Box flexShrink={0} mt={1}>
            <GiSoccerBall size={24} color="#111827" />
          </Box>

          {/* Content */}
          <VStack align="stretch" gap={2} flex={1} minW={0}>
            <Heading
              size="md"
              fontWeight="600"
              fontSize="16px"
              color="#111827"
              fontFamily="var(--font-inter), sans-serif"
              width="100%"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {title}
            </Heading>

            <VStack align="stretch" gap={1.5}>
              {/* Location */}
              <HStack gap={1.5}>
                <HiLocationMarker size={16} color="#9CA3AF" />
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
                <HiClock size={16} color="#9CA3AF" />
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
                  <HiUsers size={16} color="#9CA3AF" />
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
          </VStack>

          {/* Price Tag */}
          {price && (
            <Box
              bg={cardColor}
              color="#FFFFFF"
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="14px"
              fontWeight="600"
              fontFamily="var(--font-inter), sans-serif"
              flexShrink={0}
              alignSelf="flex-start"
            >
              {price}
            </Box>
          )}
        </HStack>

        {/* Action Button - Full width at bottom, outside HStack */}
        {onAction && actionLabel && (
          <Button
            onClick={onAction}
            bg={isActionDisabled ? "#E5E7EB" : cardColor}
            color={isActionDisabled ? "#9CA3AF" : "#FFFFFF"}
            w="full"
            py={2.5}
            borderRadius="lg"
            fontWeight="600"
            fontSize="14px"
            fontFamily="var(--font-inter), sans-serif"
            _hover={isActionDisabled ? {} : { opacity: 0.9 }}
            _active={isActionDisabled ? {} : { opacity: 0.8 }}
            loading={actionLoading}
            disabled={isActionDisabled}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
}
