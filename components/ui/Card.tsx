/**
 * Card Components
 * 
 * Reusable card components matching Figma design system.
 * - Card: Base card component
 * - EventCard: Card for displaying events/games
 * - DetailCard: Card for displaying details
 */

'use client';

import { Box, BoxProps, VStack, HStack, Heading, Text, Image, ImageProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

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
  onAction?: () => void;
  actionLabel?: string;
  statusTag?: string;
  statusTagColor?: string;
}

/**
 * Event Card - For displaying games/events in lists
 * Matches Figma design with image, title, date, location, and action button
 */
export function EventCard({
  image,
  imageAlt = 'Event image',
  title,
  date,
  location,
  price,
  onAction,
  actionLabel = 'Join Match',
  statusTag,
  statusTagColor = 'primary.400',
  ...props
}: EventCardProps) {
  return (
    <Card {...props}>
      <VStack align="stretch" gap={3}>
        {image && (
          <Box
            position="relative"
            width="100%"
            height="150px"
            borderRadius="md"
            overflow="hidden"
            bg="gray.100"
          >
            <Image src={image} alt={imageAlt} objectFit="cover" width="100%" height="100%" />
            {statusTag && (
              <Box
                position="absolute"
                top={2}
                right={2}
                bg={statusTagColor}
                color="white"
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                fontWeight="semibold"
              >
                {statusTag}
              </Box>
            )}
          </Box>
        )}
        
        <VStack align="stretch" gap={2}>
          <Heading size="md" fontWeight="bold" color="text.primary">
            {title}
          </Heading>
          
          <VStack align="stretch" gap={1}>
            <Text fontSize="sm" color="text.secondary">
              {date}
            </Text>
            <Text fontSize="sm" color="text.secondary">
              {location}
            </Text>
            {price && (
              <Text fontSize="sm" fontWeight="semibold" color="text.primary">
                {price}
              </Text>
            )}
          </VStack>
          
          {onAction && (
            <Box pt={2}>
              <Box
                as="button"
                onClick={onAction}
                bg="primary.400"
                color="white"
                w="full"
                py={2}
                px={4}
                borderRadius="md"
                fontWeight="semibold"
                fontSize="sm"
                _hover={{ bg: 'primary.600' }}
                _active={{ bg: 'primary.700' }}
              >
                {actionLabel}
              </Box>
            </Box>
          )}
        </VStack>
      </VStack>
    </Card>
  );
}

