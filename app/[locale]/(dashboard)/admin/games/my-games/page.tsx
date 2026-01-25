"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { Box, VStack, HStack, Text, Spinner, Center } from "@chakra-ui/react";
import { GreenHeader } from "@/components/ui/GreenHeader";
import { FilterButton } from "@/components/ui/FilterButton";
import { EventCard, Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { getBottomNavItems } from "@/lib/navigation";
import { getCurrentUserRole } from "@/lib/utils/rbac-client";
import {
  formatGameDate,
  formatGameLocation,
  formatGamePrice,
} from "@/lib/utils/game";
import type { Game } from "@/types/game";

type EventFilter = "upcoming" | "past";

export default function MyEventsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<EventFilter>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [navItems, setNavItems] = useState(getBottomNavItems((key) => t(`Navigation.${key}`)));

  useEffect(() => {
    if (user) {
      fetchGames();
      // Update navigation items based on user role
      getCurrentUserRole(user).then((userRole) => {
        if (userRole) {
          setNavItems(
            getBottomNavItems(
              (key) => t(`Navigation.${key}`),
              userRole.role,
              userRole.isClubManager || false
            )
          );
        }
      });
    }
  }, [user, selectedFilter]);

  const fetchGames = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      // Fetch games user has registered for
      const response = await fetch(
        `/api/games/my-registrations?filter=${selectedFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch games");
      }

      const data = await response.json();
      setGames(data.games || []);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  }, [user, selectedFilter]);

  const filteredGames = games.filter((game) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        game.title.toLowerCase().includes(query) ||
        formatGameLocation(game.location).toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (!user) {
    return null;
  }

  return (
    <Box minH="100vh" bg="#F8F8F8" pb={20}>
      {/* Green Header */}
      <GreenHeader
        title="My Events"
        showSearch
        searchValue={searchQuery}
        searchPlaceholder="Search by location or title..."
        onSearchChange={setSearchQuery}
        showFilter
        onFilterClick={() => {
          // TODO: Implement additional filter functionality
          console.log("Filter clicked");
        }}
      />

      {/* Filter Buttons */}
      <Box px={4} py={4} bg="#FFFFFF">
        <HStack gap={2}>
          <FilterButton
            isActive={selectedFilter === "upcoming"}
            onClick={() => setSelectedFilter("upcoming")}
          >
            Upcoming
          </FilterButton>
          <FilterButton
            isActive={selectedFilter === "past"}
            onClick={() => setSelectedFilter("past")}
          >
            Past
          </FilterButton>
        </HStack>
      </Box>

      {/* Events List */}
      <Box px={4} py={4}>
        {error && (
          <Card mb={4}>
            <Text
              color="error.500"
              fontSize="sm"
              fontFamily="var(--font-inter), sans-serif"
            >
              {error}
            </Text>
          </Card>
        )}

        {loading ? (
          <Center py={12}>
            <Spinner size="lg" color="primary.400" />
          </Center>
        ) : filteredGames.length === 0 ? (
          <Card>
            <VStack gap={4} py={8}>
              <Text
                color="gray.400"
                fontSize="lg"
                fontFamily="var(--font-inter), sans-serif"
              >
                {selectedFilter === "upcoming"
                  ? "You haven't registered for any upcoming events"
                  : "You don't have any past events"}
              </Text>
            </VStack>
          </Card>
        ) : (
          <VStack gap={4} align="stretch">
            {filteredGames.map((game) => {
              return (
                <EventCard
                  key={game.id}
                  title={game.title}
                  date={formatGameDate(game.datetime)}
                  location={formatGameLocation(game.location)}
                  price={formatGamePrice(game.price, game.currency)}
                  participants={`${game.currentPlayersCount} / ${game.maxPlayers} joined`}
                  actionLabel="View Details"
                  onAction={() => router.push(`/games/${game.id}`)}
                />
              );
            })}
          </VStack>
        )}
      </Box>

      {/* Bottom Navigation */}
      <BottomNav items={navItems} />
    </Box>
  );
}
