"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FilterButton } from "@/components/ui/FilterButton";
import { EventCard } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { GreenHeader } from "@/components/ui/GreenHeader";
import { getBottomNavItems } from "@/lib/navigation";
import { getCurrentUserRole } from "@/lib/utils/rbac-client";
import {
  formatGameDate,
  formatGameLocation,
  formatGamePrice,
  detectGameSportType,
  type SportFilter,
} from "@/lib/utils/game";
import type { Game } from "@/types/game";

export default function FindMatchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<SportFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [navItems, setNavItems] = useState(getBottomNavItems());

  const fetchGames = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      // Fetch all public games
      const response = await fetch(`/api/games?isPublic=true&status=upcoming`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchGames();
      // Update navigation items based on user role
      getCurrentUserRole(user).then((userRole) => {
        if (userRole) {
          setNavItems(
            getBottomNavItems(
              userRole.role,
              userRole.isClubManager || false
            )
          );
        }
      });
    }
  }, [user, fetchGames]);

  const filteredGames = games.filter((game) => {
    if (selectedSport !== "all") {
      const gameSport = detectGameSportType(game);
      if (gameSport !== selectedSport) {
        return false;
      }
    }
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
        title="Find a Match"
        showSearch
        searchValue={searchQuery}
        searchPlaceholder="Search by location or title..."
        onSearchChange={setSearchQuery}
        showFilter
        onFilterClick={() => {
          // TODO: Implement filter functionality
          console.log("Filter clicked");
        }}
      />

      {/* Sport Filters */}
      <Box px={4} py={4} bg="#FFFFFF">
        <HStack gap={2} overflowX="auto" pb={2}>
          <FilterButton
            isActive={selectedSport === "all"}
            onClick={() => setSelectedSport("all")}
          >
            All Sports
          </FilterButton>
          <FilterButton
            isActive={selectedSport === "football"}
            onClick={() => setSelectedSport("football")}
          >
            Football
          </FilterButton>
          <FilterButton
            isActive={selectedSport === "basketball"}
            onClick={() => setSelectedSport("basketball")}
          >
            Basketball
          </FilterButton>
          <FilterButton
            isActive={selectedSport === "tennis"}
            onClick={() => setSelectedSport("tennis")}
          >
            Tennis
          </FilterButton>
        </HStack>
      </Box>

      {/* Available Events Section */}
      <Box px={4} py={4}>
        <HStack justify="space-between" mb={4}>
          <Text
            fontSize="18px"
            fontWeight="600"
            color="#111827"
            fontFamily="var(--font-inter), sans-serif"
          >
            Available Events
          </Text>
          <Text
            fontSize="14px"
            fontWeight="500"
            color="#9CA3AF"
            fontFamily="var(--font-inter), sans-serif"
          >
            {filteredGames.length}{" "}
            {filteredGames.length === 1 ? "event" : "events"}
          </Text>
        </HStack>

        {loading ? (
          <Center py={12}>
            <Spinner size="lg" color="#3CB371" />
          </Center>
        ) : filteredGames.length === 0 ? (
          <Box bg="#FFFFFF" borderRadius="lg" p={8} textAlign="center">
            <Text
              fontSize="16px"
              fontWeight="500"
              color="#9CA3AF"
              fontFamily="var(--font-inter), sans-serif"
            >
              No events found
            </Text>
          </Box>
        ) : (
          <VStack gap={4} align="stretch">
            {filteredGames.map((game) => {
              const sportType = detectGameSportType(game);
              return (
                <EventCard
                  key={game.id}
                  title={game.title}
                  date={formatGameDate(game.datetime)}
                  location={formatGameLocation(game.location)}
                  price={formatGamePrice(game.price, game.currency)}
                  participants={`${game.currentPlayersCount}/${game.maxPlayers}`}
                  sportType={sportType}
                  onAction={() => router.push(`/games/${game.id}`)}
                  actionLabel="Join Event"
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
