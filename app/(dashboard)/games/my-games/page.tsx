'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Box,
  VStack,
  Text,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/Button';
import { EventCard, Card } from '@/components/ui/Card';
import type { Game } from '@/types/game';

export default function MyGamesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchGames = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      // First get the MongoDB user ID
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }
      
      const userData = await userResponse.json();
      const mongoUserId = userData.user.id;

      // Then fetch games for this user
      const response = await fetch(
        `/api/games?hostId=${encodeURIComponent(mongoUserId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch games');
      }

      const data = await response.json();

      setGames(data.games);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLocation = (location: Game['location']) => {
    const parts = [location.address, location.city, location.country].filter(
      Boolean
    );
    return parts.join(', ');
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price} ${currency}`;
  };


  if (!user) {
    return null;
  }

  return (
    <Box minH="100vh" bg="bg.secondary">
      <Header
        title="My Games"
        rightContent={
          <PrimaryButton
            size="sm"
            onClick={() => router.push('/games/create')}
          >
            Create Game
          </PrimaryButton>
        }
      />
      <Box p={4} maxW="1200px" mx="auto">
        {error && (
          <AlertRoot status="error" mb={4}>
            <AlertIndicator />
            <AlertContent>{error}</AlertContent>
          </AlertRoot>
        )}

        {loading ? (
          <Center py={12}>
            <Spinner size="lg" color="primary.400" />
          </Center>
        ) : games.length === 0 ? (
          <Card>
            <VStack gap={4} py={8}>
              <Text color="text.secondary" fontSize="lg">
                You haven&apos;t created any games yet
              </Text>
              <PrimaryButton onClick={() => router.push('/games/create')}>
                Create Your First Game
              </PrimaryButton>
            </VStack>
          </Card>
        ) : (
          <VStack gap={4} align="stretch">
            {games.map((game) => (
              <EventCard
                key={game.id}
                title={game.title}
                date={formatDate(game.datetime)}
                location={formatLocation(game.location)}
                price={formatPrice(game.price, game.currency)}
                statusTag={game.status}
                statusTagColor={
                  game.status === 'upcoming'
                    ? 'primary.400'
                    : game.status === 'cancelled'
                    ? 'error.500'
                    : 'gray.500'
                }
                actionLabel="View Details"
                onAction={() => router.push(`/games/${game.id}`)}
              />
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}

