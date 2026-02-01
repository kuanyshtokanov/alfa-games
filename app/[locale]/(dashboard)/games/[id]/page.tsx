"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  Center,
  IconButton,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { formatGameLocation, formatGamePrice } from "@/lib/utils/game";
import { HiLocationMarker, HiClock, HiShare } from "react-icons/hi";
import type { Game } from "@/types/game";
import { toaster } from "@/components/ui/toaster";

interface Player {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: "pending" | "confirmed";
  expiresAt?: string | null;
}

type CloudPaymentsWidget = {
  pay: (
    type: "charge" | string,
    options: {
      publicId?: string;
      description?: string;
      amount?: number;
      currency?: string;
      accountId?: string | null;
      skin?: string;
      externalId?: string;
      data?: Record<string, unknown>;
      paymentMethodSequence?: string[];
      restrictedPaymentMethods?: string[];
      tokenize?: boolean;
    },
    callbacks: {
      onSuccess: (result?: {
        transactionId?: string | number;
        paymentId?: string | number;
        id?: string | number;
      }) => void;
      onFail: (reason: string) => void;
      onComplete: (result: {
        message: string | null;
        success: boolean;
      }) => void;
    },
  ) => void;
};

declare global {
  interface Window {
    cp?: {
      CloudPayments: new () => CloudPaymentsWidget;
    };
  }
}

export default function GameDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const gameId = params.id as string;

  const fetchGameData = useCallback(
    async (options: { showLoader?: boolean } = {}) => {
      if (!user) return;
      const { showLoader = true } = options;

      try {
        if (showLoader) {
          setLoading(true);
        }
        const token = await user.getIdToken();

        // Fetch game details
        const gameResponse = await fetch(`/api/games/${gameId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!gameResponse.ok) {
          throw new Error("Failed to fetch game");
        }

        const gameData = await gameResponse.json();
        setGame(gameData.game);
        setIsRegistered(gameData.game.isRegistered || false);

        // Fetch registrations
        const regResponse = await fetch(`/api/games/${gameId}/registrations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (regResponse.ok) {
          const regData = await regResponse.json();
          setPlayers(regData.players || []);
        }
      } catch {
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [user, gameId],
  );

  useEffect(() => {
    if (user && gameId) {
      fetchGameData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, gameId]);

  useEffect(() => {
    if (!user || !gameId) return;
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchGameData({ showLoader: false });
      }
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, [user, gameId, fetchGameData]);

  useEffect(() => {
    if (!user || !gameId) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchGameData({ showLoader: false });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, gameId, fetchGameData]);

  const updatePlayerCount = useCallback((delta: number) => {
    setGame((prev) => {
      if (!prev) return prev;
      const nextCount = Math.max(0, prev.currentPlayersCount + delta);
      return { ...prev, currentPlayersCount: nextCount };
    });
  }, []);

  const handleJoin = useCallback(async () => {
    if (!user || !game) return;

    let reservationId: string | null = null;
    let transactionId: string | null = null;
    let widgetConfirmed = false;
    let releaseReservation = async () => {};

    try {
      setActionLoading(true);
      const token = await user.getIdToken();

      // TipTopPay Widget Integration
      if (game.price > 0) {
        const reserveResponse = await fetch(`/api/games/${gameId}/reserve`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const reserveData = await reserveResponse.json();

        if (!reserveResponse.ok) {
          toaster.create({
            title: "Spot unavailable",
            description: reserveData.error || "Please try again.",
            type: "error",
          });
          return;
        }

        reservationId = reserveData.reservationId;
        releaseReservation = async () => {
          if (!reservationId) return;
          try {
            await fetch(`/api/games/${gameId}/reserve/cancel`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ reservationId }),
            });
          } catch {
            // best-effort release; reservation will expire on TTL
          }
        };

        // Wrap widget payment in a promise
        await new Promise<void>((resolve, reject) => {
          let settled = false;
          if (!window.cp?.CloudPayments) {
            settled = true;
            reject(new Error("Payment widget not loaded"));
            return;
          }
          const widget = new window.cp.CloudPayments();
          widget.pay(
            "charge",
            {
              publicId: process.env.NEXT_PUBLIC_TIPTOPPAY_PUBLIC_ID,
              description: `Join game: ${game.title}`,
              amount: game.price,
              currency: game.currency || "KZT",
              accountId: user.email,
              skin: "mini",
              externalId: reservationId ?? undefined,
              data: {
                gameId: gameId,
                userId: user.uid,
              },
              paymentMethodSequence: ["Card", "GooglePay", "ApplePay"],
              tokenize: true,
            },
            {
              onSuccess: (result) => {
                if (settled) return;
                settled = true;
                widgetConfirmed = true;
                const resolvedId =
                  result?.transactionId ?? result?.paymentId ?? result?.id;
                if (resolvedId) {
                  transactionId = String(resolvedId);
                }
                resolve();
              },
              onFail: (reason: string) => {
                if (settled) return;
                settled = true;
                reject(new Error(`Payment failed: ${reason}`));
              },
              onComplete: (result) => {
                if (!result.success) {
                  void releaseReservation();
                  if (!settled) {
                    settled = true;
                    reject(new Error("Payment not completed"));
                  }
                }
              },
            },
          );
        });
      }
      if (game.price > 0 && !widgetConfirmed) {
        toaster.create({
          title: "Payment not confirmed",
          description: "Payment did not complete. Please try again.",
          type: "error",
        });
        return;
      }

      const response = await fetch(`/api/games/${gameId}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(reservationId ? { "Content-Type": "application/json" } : {}),
        },
        body: reservationId
          ? JSON.stringify({
              reservationId,
              transactionId: transactionId ?? undefined,
              provider: "tiptop-pay",
              widgetConfirmed,
            })
          : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        toaster.create({
          title: "Could not join",
          description: data.error || "Failed to join event.",
          type: "error",
        });
        return;
      }

      setIsRegistered(true);
      updatePlayerCount(1);
      setPlayers((prev) => {
        const displayName = user.displayName || user.email || "You";
        const nextPlayers = prev.filter((player) => player.id !== user.uid);
        return [
          {
            id: user.uid,
            name: displayName,
            email: user.email || "",
            avatar: user.photoURL || undefined,
            status: "confirmed",
          },
          ...nextPlayers,
        ];
      });

      toaster.create({
        title: "You're in!",
        description: "Your spot is confirmed.",
        type: "success",
      });

      // Refresh data without full-page loader
      void fetchGameData({ showLoader: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      toaster.create({
        title: "Payment or join failed",
        description: message,
        type: "error",
      });
      if (reservationId) {
        void releaseReservation();
      }
    } finally {
      setActionLoading(false);
    }
  }, [user, game, gameId, fetchGameData, updatePlayerCount]);

  const handleCancel = useCallback(async () => {
    if (!user || !game) return;

    try {
      setActionLoading(true);
      const token = await user.getIdToken();
      const response = await fetch(`/api/games/${gameId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toaster.create({
          title: "Could not cancel",
          description: data.error || "Failed to cancel event.",
          type: "error",
        });
        return;
      }

      setIsRegistered(false);
      updatePlayerCount(-1);
      setPlayers((prev) => prev.filter((player) => player.id !== user.uid));

      toaster.create({
        title: "Registration cancelled",
        description: "Your spot has been released.",
        type: "success",
      });

      // Refresh data without full-page loader
      void fetchGameData({ showLoader: false });
    } catch {
      toaster.create({
        title: "Cancel failed",
        description: "Please try again.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  }, [user, game, gameId, fetchGameData, updatePlayerCount]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game?.title,
        text: `Check out this match: ${game?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toaster.create({
        title: "Link copied",
        description: "Share it with your friends.",
        type: "success",
      });
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="#F8F8F8">
        <Center py={12}>
          <Spinner size="lg" color="#3CB371" />
        </Center>
      </Box>
    );
  }

  if (!game) {
    return (
      <Box minH="100vh" bg="#F8F8F8" p={4}>
        <Text color="gray.900" fontFamily="var(--font-inter), sans-serif">
          Game not found
        </Text>
      </Box>
    );
  }

  const confirmedPlayers = players.filter(
    (player) => player.status !== "pending",
  );
  const confirmedCount = confirmedPlayers.length;
  const pendingCount = players.filter(
    (player) => player.status === "pending",
  ).length;
  const reservedCount = confirmedPlayers.length + pendingCount;
  const spotsLeft = Math.max(game.maxPlayers - reservedCount, 0);
  const hostInfo = game.hostId as { name?: string; avatar?: string } | string;
  const hostName =
    typeof hostInfo === "object"
      ? hostInfo?.name || "Unknown Host"
      : "Unknown Host";
  const hostAvatar =
    typeof hostInfo === "object" ? hostInfo?.avatar : undefined;

  // Format date for display
  const gameDate = new Date(game.datetime);
  const today = new Date();
  const isToday =
    gameDate.getDate() === today.getDate() &&
    gameDate.getMonth() === today.getMonth() &&
    gameDate.getFullYear() === today.getFullYear();

  const dateDisplay = isToday
    ? `Today, ${gameDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} | ${gameDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : `${gameDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} | ${gameDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

  return (
    <Box
      h="100vh"
      bg="#F8F8F8"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Content Area - Takes up available space and scrolls */}
      <Box flex={1} overflowY="auto" minH={0} maxH="100%">
        {/* Banner Image with Back Button and Title */}
        <Box h="200px" bg="#3CB371" borderRadius="0 0 24px 24px">
          {/* Back Button */}
          <IconButton
            aria-label="Back"
            position="absolute"
            top={4}
            left={4}
            zIndex={2}
            bg="rgba(255, 255, 255, 0.2)"
            color="white"
            borderRadius="full"
            onClick={() => router.back()}
            _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </IconButton>

          {/* Title Overlay */}
          <Box position="relative" top={50} p={6}>
            <Heading
              color="white"
              fontSize="28px"
              fontWeight="700"
              fontFamily="var(--font-inter), sans-serif"
            >
              {game.title}
            </Heading>
          </Box>
        </Box>

        {/* Location and Date/Time Cards */}
        <Box px={4} mt={-6} mb={6}>
          <SimpleGrid columns={2} gap={3}>
            {/* Location Card */}
            <Card>
              <VStack align="flex-start" gap={1}>
                <HStack gap={1}>
                  <HiLocationMarker size={16} color="#9CA3AF" />
                  <Text
                    fontSize="12px"
                    fontWeight="500"
                    color="#9CA3AF"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    Location
                  </Text>
                </HStack>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="#111827"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {formatGameLocation(game.location)}
                </Text>
              </VStack>
            </Card>

            {/* Date & Time Card */}
            <Card>
              <VStack align="flex-start" gap={1}>
                <HStack gap={1}>
                  <HiClock size={16} color="#9CA3AF" />
                  <Text
                    fontSize="12px"
                    fontWeight="500"
                    color="#9CA3AF"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    Date & Time
                  </Text>
                </HStack>
                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="#111827"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {dateDisplay}
                </Text>
              </VStack>
            </Card>
          </SimpleGrid>
        </Box>

        <Box px={4}>
          {/* Hosted By Section */}
          <VStack align="stretch" gap={4} mb={6}>
            <Heading
              fontSize="18px"
              fontWeight="700"
              color="#111827"
              fontFamily="var(--font-inter), sans-serif"
            >
              Hosted by
            </Heading>
            <Card>
              <HStack gap={3}>
                <Avatar name={hostName} src={hostAvatar} size="lg" />
                <VStack align="flex-start" gap={0} flex={1}>
                  <Text
                    fontSize="16px"
                    fontWeight="600"
                    color="#111827"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    {hostName}
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color="#9CA3AF"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    13 matches hosted
                  </Text>
                </VStack>
              </HStack>
            </Card>
          </VStack>

          {/* Players Section */}
          <VStack align="stretch" gap={4} mb={6}>
            <HStack justify="space-between" align="flex-start">
              <Heading
                fontSize="18px"
                fontWeight="700"
                color="#111827"
                fontFamily="var(--font-inter), sans-serif"
              >
                Players
              </Heading>
              <Text
                fontSize="14px"
                fontWeight="500"
                color="#9CA3AF"
                fontFamily="var(--font-inter), sans-serif"
              >
                {confirmedCount}/{game.maxPlayers}
              </Text>
            </HStack>

            {/* Players Grid */}
            <SimpleGrid columns={4} gap={4}>
              {confirmedPlayers.map((player) => (
                <VStack key={player.id} gap={1}>
                  <Avatar name={player.name} src={player.avatar} size="md" />
                  <Text
                    fontSize="12px"
                    fontWeight="500"
                    color="#111827"
                    fontFamily="var(--font-inter), sans-serif"
                    textAlign="center"
                  >
                    {player.name.split(" ")[0]}
                  </Text>
                </VStack>
              ))}
              {/* Open spots */}
              {Array.from({ length: spotsLeft }).map((_, index) => (
                <VStack key={`open-${index}`} gap={1}>
                  <Box
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    border="2px dashed"
                    borderColor="#E5E7EB"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="white"
                  >
                    <Text
                      fontSize="20px"
                      color="#9CA3AF"
                      fontFamily="var(--font-inter), sans-serif"
                    >
                      ?
                    </Text>
                  </Box>
                  <Text
                    fontSize="12px"
                    fontWeight="500"
                    color="#9CA3AF"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    Open
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>

            {spotsLeft > 0 && (
              <Button
                bg="#3CB371"
                color="white"
                borderRadius="lg"
                py={2}
                fontSize="14px"
                fontWeight="600"
                fontFamily="var(--font-inter), sans-serif"
                _hover={{ opacity: 0.9 }}
              >
                {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left!
              </Button>
            )}
          </VStack>

          {/* About this Match Section */}
          {game.description && (
            <VStack align="stretch" gap={4} mb={6}>
              <Heading
                fontSize="18px"
                fontWeight="700"
                color="#111827"
                fontFamily="var(--font-inter), sans-serif"
              >
                About this Match
              </Heading>
              <Text
                fontSize="14px"
                fontWeight="500"
                color="#6B7280"
                fontFamily="var(--font-inter), sans-serif"
                lineHeight="1.6"
              >
                {game.description}
              </Text>
            </VStack>
          )}

          {/* Location Map Section */}
          <VStack align="stretch" gap={4} mb={6}>
            <Heading
              fontSize="18px"
              fontWeight="700"
              color="#111827"
              fontFamily="var(--font-inter), sans-serif"
            >
              Location
            </Heading>
            {/* Map Placeholder */}
            <Box
              h="200px"
              bg="#E5E7EB"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <HiLocationMarker size={32} color="#9CA3AF" />
            </Box>
            <Text
              fontSize="14px"
              fontWeight="500"
              color="#111827"
              fontFamily="var(--font-inter), sans-serif"
            >
              {game.location.address || formatGameLocation(game.location)}
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Bottom Action Bar - Always at bottom */}
      <Box
        flexShrink={0}
        bg="white"
        borderTop="1px solid"
        borderColor="#E5E7EB"
        p={4}
        boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
      >
        <HStack justify="space-between" align="center">
          {/* Price */}
          <VStack align="flex-start" gap={0}>
            <Text
              fontSize="18px"
              fontWeight="700"
              color="#111827"
              fontFamily="var(--font-inter), sans-serif"
            >
              {formatGamePrice(game.price, game.currency)}
            </Text>
            <Text
              fontSize="12px"
              fontWeight="500"
              color="#9CA3AF"
              fontFamily="var(--font-inter), sans-serif"
            >
              per person
            </Text>
          </VStack>

          {/* Action Buttons */}
          <HStack gap={2}>
            <SecondaryButton onClick={handleShare}>
              <HStack gap={2}>
                <HiShare size={20} />
                <Text>Share Event</Text>
              </HStack>
            </SecondaryButton>
            {isRegistered ? (
              <PrimaryButton
                onClick={handleCancel}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Cancel
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handleJoin}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Join
              </PrimaryButton>
            )}
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}
