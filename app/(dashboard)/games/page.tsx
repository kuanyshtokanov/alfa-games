"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FilterButton } from "@/components/ui/FilterButton";
import { EventCard } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { bottomNavItems } from "@/lib/navigation";
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
      <Box bg="#3CB371" px={4} pt={12} pb={4}>
        <Text
          fontSize="28px"
          fontWeight="600"
          color="#FFFFFF"
          fontFamily="var(--font-inter), sans-serif"
          mb={4}
        >
          Find a Match
        </Text>

        {/* Search Bar */}
        <Box position="relative">
          <svg
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "20px",
              height: "20px",
              zIndex: 1,
              pointerEvents: "none",
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Input
            placeholder="Search by location or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            pl={12}
            pr={12}
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
              borderColor: "#3CB371",
              boxShadow: "0 0 0 1px #3CB371",
            }}
          />
          <Box
            position="absolute"
            right={4}
            top="50%"
            transform="translateY(-50%)"
            cursor="pointer"
          >
            <svg
              width="20px"
              height="20px"
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
        </Box>
      </Box>

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
      <BottomNav items={bottomNavItems} />
    </Box>
  );
}
