/**
 * Bottom Navigation Component
 * 
 * Reusable bottom navigation component matching Figma design system.
 * Mobile-first navigation bar with icons and labels
 */

'use client';

import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface BottomNavProps {
  items: BottomNavItem[];
}

/**
 * Bottom Navigation - Mobile navigation bar
 * Matches Figma design with icons and labels
 * Active item: Green color (#4ade80)
 * Inactive item: Gray color
 */
export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      py={2}
      px={4}
      zIndex={1000}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
    >
      <HStack justify="space-around" align="center" width="100%">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} style={{ flex: 1 }}>
              <VStack
                gap={1}
                py={2}
                color={isActive ? '#3CB371' : '#9CA3AF'}
                _hover={{ color: '#3CB371' }}
              >
                <Box
                  fontSize="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={isActive ? '#3CB371' : '#9CA3AF'}
                >
                  {item.icon}
                </Box>
                <Text
                  fontSize="12px"
                  fontWeight={isActive ? '600' : '500'}
                  fontFamily="var(--font-inter), sans-serif"
                  color={isActive ? '#3CB371' : '#9CA3AF'}
                >
                  {item.label}
                </Text>
              </VStack>
            </Link>
          );
        })}
      </HStack>
    </Box>
  );
}

