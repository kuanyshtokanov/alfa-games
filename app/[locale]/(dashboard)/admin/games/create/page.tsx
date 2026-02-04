"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  Center,
  Text,
} from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { SecondaryButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { getBottomNavItems } from "@/lib/navigation";
import { getCurrentUserRole, canUserCreateGame } from "@/lib/utils/rbac-client";
import type { GameFormData } from "@/types/game";
import { GameForm } from "@/components/admin/GameForm";

const EMPTY_GAME_FORM: GameFormData = {
  title: "",
  description: "",
  location: {
    address: "",
    city: "",
    country: "",
  },
  datetime: "",
  duration: 90,
  maxPlayers: 22,
  price: 0,
  currency: "KZT",
  skillLevel: "all",
  equipment: {
    provided: [],
    needed: [],
  },
  rules: "",
  hostInfo: "",
  cancellationPolicy: "",
  cancellationRule: "anytime",
  isPublic: true,
};

export default function CreateGamePage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [navItems, setNavItems] = useState(getBottomNavItems((key) => t(`Navigation.${key}`)));

  // Check permissions on mount
  useEffect(() => {
    if (!user) {
      setCheckingPermissions(false);
      setCanCreate(false);
      return;
    }

    let cancelled = false;

    const checkPermissions = async () => {
      try {
        const userRole = await getCurrentUserRole(user);

        if (cancelled) return;

        if (!userRole) {
          setCanCreate(false);
          setCheckingPermissions(false);
          return;
        }

        const canCreateGame = canUserCreateGame(userRole);

        if (cancelled) return;

        setCanCreate(canCreateGame);
        setCheckingPermissions(false);

        // Update navigation items based on user role
        setNavItems(
          getBottomNavItems(
            (key) => t(`Navigation.${key}`),
            userRole.role,
            userRole.isClubManager || false
          )
        );
      } catch (err) {
        console.error("Error checking permissions:", err);
        if (!cancelled) {
          setCanCreate(false);
          setCheckingPermissions(false);
        }
      }
    };

    checkPermissions();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleSubmit = async (formData: GameFormData) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to create a game");
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/games", {
        method: "POST",
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
        throw new Error(data.error || "Failed to create game");
      }

      router.push(`/games/${data.game.id}`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      throw new Error(error.message || "Failed to create game");
    }
  };

  if (!user) {
    return null;
  }

  if (checkingPermissions) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title={t("Admin.Games.Create.title")} showBackButton />
        <Center py={12}>
          <Text color="gray.900" fontFamily="var(--font-inter), sans-serif">
            {t("Admin.Games.Create.checkingPermissions")}
          </Text>
        </Center>
      </Box>
    );
  }

  if (!canCreate) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title={t("Admin.Games.Create.title")} showBackButton />
        <Box p={4} maxW="800px" mx="auto">
          <Card>
            <VStack gap={4} py={8}>
              <AlertRoot status="error">
                <AlertIndicator />
                <AlertContent>
                  {t("Admin.Games.Create.noPermission")}
                </AlertContent>
              </AlertRoot>
              <SecondaryButton onClick={() => router.back()}>
                {t("Admin.Games.Create.goBack")}
              </SecondaryButton>
            </VStack>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.secondary" pb={20}>
      <Header title={t("Admin.Games.Create.title")} showBackButton />
      <Box p={4} maxW="800px" mx="auto">
        <GameForm
          initialData={EMPTY_GAME_FORM}
          onSubmit={handleSubmit}
          cancelLabel={t("Admin.Games.Create.cancel")}
          submitLabel={t("Admin.Games.Create.submit")}
          onCancel={() => router.back()}
        />
      </Box>
      {/* Bottom Navigation */}
      <BottomNav items={navItems} />
    </Box>
  );
}
