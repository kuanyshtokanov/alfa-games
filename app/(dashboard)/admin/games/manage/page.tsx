"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  HStack,
  Text,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  Spinner,
  Center,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { EventCard } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { getBottomNavItems } from "@/lib/navigation";
import { getCurrentUserRole } from "@/lib/utils/rbac-client";
import {
  formatGameDate,
  formatGameLocation,
  formatGamePrice,
  detectGameSportType,
} from "@/lib/utils/game";
import type { Game } from "@/types/game";
import type { UserRole } from "@/lib/utils/rbac-client";

export default function ManageGamesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [navItems, setNavItems] = useState(getBottomNavItems());

  useEffect(() => {
    if (user) {
      checkPermissions();
      fetchGames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkPermissions = async () => {
    if (!user) return;

    try {
      const role = await getCurrentUserRole(user);
      setUserRole(role);

      // Update navigation items based on user role
      if (role) {
        setNavItems(
          getBottomNavItems(
            role.role,
            role.isClubManager || false
          )
        );
      }

      // Only admins and hosts can access this page
      if (role && role.role !== "admin" && role.role !== "host") {
        router.push("/my-events");
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
      router.push("/my-events");
    }
  };

  const fetchGames = useCallback(async () => {
    if (!user || !userRole) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      // For admins, fetch all games. For hosts, fetch their own games
      let url = `/api/games?status=${statusFilter === "all" ? "" : statusFilter}`;
      
      if (userRole.role === "host") {
        // Get MongoDB user ID first
        const userResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const mongoUserId = userData.user.id;
          url += `&hostId=${encodeURIComponent(mongoUserId)}`;
        }
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  }, [user, userRole, statusFilter]);

  useEffect(() => {
    if (user && userRole) {
      fetchGames();
    }
  }, [user, userRole, statusFilter, fetchGames]);

  const handleDelete = async (gameId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this game?")) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete game");
      }

      // Refresh games list
      fetchGames();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || "Failed to delete game");
    }
  };

  if (!user) {
    return null;
  }

  if (loading && !userRole) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title="Manage Games" showBackButton />
        <Center py={12}>
          <Spinner size="lg" color="primary.400" />
        </Center>
      </Box>
    );
  }

  if (userRole && userRole.role !== "admin" && userRole.role !== "host") {
    return null; // Will redirect
  }

  return (
    <Box minH="100vh" bg="bg.secondary" pb={20}>
      <Header
        title="Manage Games"
        showBackButton
        rightContent={
          <HStack gap={2}>
            <NativeSelectRoot width="150px">
              <NativeSelectField
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </NativeSelectField>
            </NativeSelectRoot>
          </HStack>
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
          <Box bg="white" borderRadius="lg" p={8} textAlign="center">
            <Text color="gray.400" fontSize="lg" fontFamily="var(--font-inter), sans-serif">
              No games found
            </Text>
          </Box>
        ) : (
          <VStack gap={4} align="stretch">
            <Text
              fontSize="14px"
              fontWeight="500"
              color="gray.400"
              fontFamily="var(--font-inter), sans-serif"
            >
              {games.length} {games.length === 1 ? "game" : "games"} found
            </Text>
            {games.map((game) => {
              const sportType = detectGameSportType(game);
              const hostId =
                typeof game.hostId === "string"
                  ? game.hostId
                  : game.hostId?._id || game.hostId?.id || "";
              const isOwnGame = userRole?.id === hostId;

              return (
                <Box key={game.id}>
                  <EventCard
                    title={game.title}
                    date={formatGameDate(game.datetime)}
                    location={formatGameLocation(game.location)}
                    price={formatGamePrice(game.price, game.currency)}
                    participants={`${game.currentPlayersCount}/${game.maxPlayers}`}
                    sportType={sportType}
                    statusTag={game.status}
                    statusTagColor={
                      game.status === "upcoming"
                        ? "primary.400"
                        : game.status === "cancelled"
                        ? "error.500"
                        : "gray.500"
                    }
                    actionLabel="View Details"
                    onAction={() => router.push(`/games/${game.id}`)}
                  />
                  <HStack gap={2} mt={2} justify="flex-end">
                    <SecondaryButton
                      size="sm"
                      onClick={() => router.push(`/games/${game.id}`)}
                    >
                      Edit
                    </SecondaryButton>
                    <PrimaryButton
                      size="sm"
                      bg="error.500"
                      _hover={{ bg: "error.600" }}
                      _active={{ bg: "error.700" }}
                      onClick={() => handleDelete(game.id)}
                    >
                      Delete
                    </PrimaryButton>
                  </HStack>
                </Box>
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
