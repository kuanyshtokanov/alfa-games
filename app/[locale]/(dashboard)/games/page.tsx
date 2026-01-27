"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { Box, VStack, HStack, Text, Spinner, Center } from "@chakra-ui/react";
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
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingGameId, setActionLoadingGameId] = useState<string | null>(
    null
  );
  const [selectedSport, setSelectedSport] = useState<SportFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [navItems, setNavItems] = useState(getBottomNavItems((key) => t(`Navigation.${key}`)));

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
              (key) => t(`Navigation.${key}`),
              userRole.role,
              userRole.isClubManager || false
            )
          );
        }
      });
    }
  }, [user, fetchGames]);

  const visibleGames = useMemo(() => {
    return games.filter((game) => {
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
  }, [games, searchQuery, selectedSport]);

  const handleJoinEvent = useCallback(
    async (gameId: string) => {
      if (!user) return;

      try {
        setActionLoadingGameId(gameId);
        const token = await user.getIdToken();
        const response = await fetch(`/api/games/${gameId}/register`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || t("GamesPage.alerts.joinError"));
          return;
        }

        // Update only this game after successful response
        setGames((prev) =>
          prev.map((g) => {
            if (g.id !== gameId) return g;
            return {
              ...g,
              isRegistered: true,
              currentPlayersCount: Math.min(
                g.currentPlayersCount + 1,
                g.maxPlayers
              ),
            };
          })
        );
      } catch (error) {
        console.error("Error joining event:", error);
        alert(t("GamesPage.alerts.joinError"));
      } finally {
        setActionLoadingGameId(null);
      }
    },
    [user]
  );

  const handleCancelEvent = useCallback(
    async (gameId: string) => {
      if (!user) return;

      try {
        setActionLoadingGameId(gameId);
        const token = await user.getIdToken();
        const response = await fetch(`/api/games/${gameId}/cancel`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || t("GamesPage.alerts.cancelError"));
          return;
        }

        // Update only this game after successful response
        setGames((prev) =>
          prev.map((g) => {
            if (g.id !== gameId) return g;
            return {
              ...g,
              isRegistered: false,
              currentPlayersCount: Math.max(g.currentPlayersCount - 1, 0),
            };
          })
        );
      } catch (error) {
        console.error("Error cancelling event:", error);
        alert(t("GamesPage.alerts.cancelError"));
      } finally {
        setActionLoadingGameId(null);
      }
    },
    [user]
  );

  if (!user) {
    return null;
  }

  return (
    <Box minH="100vh" bg="#F8F8F8" pb={20}>
      {/* Green Header */}
      <GreenHeader
        title={t("GamesPage.title")}
        showSearch
        searchValue={searchQuery}
        searchPlaceholder={t("GamesPage.searchPlaceholder")}
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
            {t("GamesPage.filters.all")}
          </FilterButton>
          <FilterButton
            isActive={selectedSport === "football"}
            onClick={() => setSelectedSport("football")}
          >
            {t("GamesPage.filters.football")}
          </FilterButton>
          <FilterButton
            isActive={selectedSport === "basketball"}
            onClick={() => setSelectedSport("basketball")}
          >
            {t("GamesPage.filters.basketball")}
          </FilterButton>
          <FilterButton
            isActive={selectedSport === "tennis"}
            onClick={() => setSelectedSport("tennis")}
          >
            {t("GamesPage.filters.tennis")}
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
            {t("GamesPage.availableEvents")}
          </Text>
          <Text
            fontSize="14px"
            fontWeight="500"
            color="#9CA3AF"
            fontFamily="var(--font-inter), sans-serif"
          >
            {t("GamesPage.eventsCount", { count: visibleGames.length })}
          </Text>
        </HStack>

        {loading ? (
          <Center py={12}>
            <Spinner size="lg" color="#3CB371" />
          </Center>
        ) : visibleGames.length === 0 ? (
          <Box bg="#FFFFFF" borderRadius="lg" p={8} textAlign="center">
            <Text
              fontSize="16px"
              fontWeight="500"
              color="#9CA3AF"
              fontFamily="var(--font-inter), sans-serif"
            >
              {t("GamesPage.noEvents")}
            </Text>
          </Box>
        ) : (
          <VStack gap={4} align="stretch">
            {visibleGames.map((game) => {
              const isRegistered = game.isRegistered || false;
              const actionLoading = actionLoadingGameId === game.id;
              const reservedPlayersCount =
                game.reservedPlayersCount ?? game.currentPlayersCount;
              const spotsLeft =
                Math.max(game.maxPlayers - reservedPlayersCount, 0);
              const isFull = !isRegistered && spotsLeft <= 0;
              return (
                <EventCard
                  key={game.id}
                  title={game.title}
                  date={formatGameDate(game.datetime)}
                  location={formatGameLocation(game.location)}
                  price={formatGamePrice(game.price, game.currency)}
                  participants={`${reservedPlayersCount}/${game.maxPlayers}`}
                  onAction={() => {
                    if (isRegistered) {
                      handleCancelEvent(game.id);
                      return;
                    }
                    if (!isFull) {
                      router.push(`/games/${game.id}`);
                    }
                  }}
                  actionLabel={
                    isRegistered
                      ? t("GamesPage.cancelEvent")
                      : isFull
                        ? t("GamesPage.full")
                        : t("GamesPage.joinEvent")
                  }
                  actionLoading={actionLoading}
                  actionDisabled={isFull}
                  onCardClick={() => router.push(`/games/${game.id}`)}
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
