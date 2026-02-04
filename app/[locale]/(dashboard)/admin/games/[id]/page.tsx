"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Box,
  Center,
  Text,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  Spinner,
} from "@chakra-ui/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";
import { GameForm } from "@/components/admin/GameForm";
import { getBottomNavItems } from "@/lib/navigation";
import {
  canUserManageGame,
  getCurrentUserRole,
  type UserRole,
} from "@/lib/utils/rbac-client";
import type { Game, GameFormData } from "@/types/game";

const mapGameToForm = (game: Game): GameFormData => ({
  title: game.title || "",
  description: game.description || "",
  location: {
    address: game.location?.address || "",
    city: game.location?.city || "",
    country: game.location?.country || "",
  },
  datetime: formatDatetimeLocal(game.datetime),
  duration: game.duration || 0,
  maxPlayers: game.maxPlayers || 0,
  price: game.price || 0,
  currency: (game.currency || "KZT").toUpperCase(),
  skillLevel: game.skillLevel || "all",
  equipment: {
    provided: game.equipment?.provided || [],
    needed: game.equipment?.needed || [],
  },
  rules: game.rules || "",
  hostInfo: game.hostInfo || "",
  cancellationPolicy: game.cancellationPolicy || "",
  cancellationRule: game.cancellationRule || "anytime",
  isPublic: game.isPublic ?? true,
});

function formatDatetimeLocal(isoDate: string) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function AdminGameEditPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [navItems, setNavItems] = useState(
    getBottomNavItems((key) => t(`Navigation.${key}`))
  );

  const gameId = useMemo(() => params.id as string, [params.id]);

  useEffect(() => {
    if (!user || !gameId) return;
    let cancelled = false;

    const loadGame = async () => {
      try {
        setLoading(true);
        setError(null);

        const role = await getCurrentUserRole(user);
        if (cancelled) return;
        setUserRole(role);

        if (role) {
          setNavItems(
            getBottomNavItems(
              (key) => t(`Navigation.${key}`),
              role.role,
              role.isClubManager || false
            )
          );
        }

        if (!role || (role.role !== "admin" && role.role !== "host")) {
          router.push("/my-events");
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch(`/api/games/${gameId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load game");
        }

        const data = await response.json();
        const fetchedGame = data.game as Game;

        if (!canUserManageGame(role, fetchedGame.hostId)) {
          router.push("/admin/games/manage");
          return;
        }

        if (!cancelled) {
          setGame(fetchedGame);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        if (!cancelled) {
          setError(error.message || "Failed to load game");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGame();

    return () => {
      cancelled = true;
    };
  }, [user, gameId, router, t]);

  const handleSubmit = async (formData: GameFormData) => {
    if (!user) {
      throw new Error("You must be logged in to update a game");
    }

    const token = await user.getIdToken();
    const response = await fetch(`/api/games/${gameId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        duration: Number(formData.duration),
        maxPlayers: Number(formData.maxPlayers),
        price: Number(formData.price),
        datetime: new Date(formData.datetime).toISOString(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update game");
    }

    router.push(`/games/${gameId}`);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title={t("Admin.Games.Manage.edit")} showBackButton />
        <Center py={12}>
          <Spinner size="lg" color="primary.400" />
        </Center>
      </Box>
    );
  }

  if (error || !game || !userRole) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title={t("Admin.Games.Manage.edit")} showBackButton />
        <Box p={4} maxW="800px" mx="auto">
          <AlertRoot status="error">
            <AlertIndicator />
            <AlertContent>{error || "Unable to load game"}</AlertContent>
          </AlertRoot>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.secondary" pb={20}>
      <Header title={t("Admin.Games.Manage.edit")} showBackButton />
      <Box p={4} maxW="800px" mx="auto">
        <GameForm
          initialData={mapGameToForm(game)}
          onSubmit={handleSubmit}
          cancelLabel={t("Admin.Games.Create.cancel")}
          submitLabel={t("Admin.Games.Manage.edit")}
          onCancel={() => router.back()}
        />
      </Box>
      <BottomNav items={navItems} />
    </Box>
  );
}
