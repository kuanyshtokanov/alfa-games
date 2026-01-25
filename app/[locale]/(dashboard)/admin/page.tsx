"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { getBottomNavItems } from "@/lib/navigation";
import { getCurrentUserRole } from "@/lib/utils/rbac-client";
import type { UserRole } from "@/lib/utils/rbac-client";

/**
 * Admin Dashboard
 * Central hub for admin pages and actions
 */
export default function AdminDashboard() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [navItems, setNavItems] = useState(getBottomNavItems((key) => t(`Navigation.${key}`)));

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const role = await getCurrentUserRole(user);
        setUserRole(role);

        // Update navigation items based on user role
        if (role) {
          setNavItems(
            getBottomNavItems(
              (key) => t(`Navigation.${key}`),
              role.role,
              role.isClubManager || false
            )
          );
        }

        // Redirect if not admin
        if (role && role.role !== "admin") {
          router.push("/my-events");
        }
      } catch (err) {
        console.error("Error checking role:", err);
        router.push("/my-events");
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title={t("AdminPage.title")} showBackButton />
        <Center py={12}>
          <Spinner size="lg" color="primary.400" />
        </Center>
      </Box>
    );
  }

  if (userRole && userRole.role !== "admin") {
    return null; // Will redirect
  }

  const adminPages = [
    {
      title: t("AdminPage.pages.manageGames.title"),
      description: t("AdminPage.pages.manageGames.description"),
      href: "/admin/games/manage",
      icon: "🎮",
    },
    {
      title: t("AdminPage.pages.setUserRole.title"),
      description: t("AdminPage.pages.setUserRole.description"),
      href: "/admin/set-role",
      icon: "👤",
    },
    {
      title: t("AdminPage.pages.createGame.title"),
      description: t("AdminPage.pages.createGame.description"),
      href: "/admin/games/create",
      icon: "➕",
    },
    {
      title: t("AdminPage.pages.myEvents.title"),
      description: t("AdminPage.pages.myEvents.description"),
      href: "/my-events",
      icon: "📅",
    },
  ];

  return (
    <Box minH="100vh" bg="bg.secondary" pb={20}>
      <Header title={t("AdminPage.title")} showBackButton />
      <Box p={4} maxW="800px" mx="auto">
        <VStack gap={4} align="stretch">
          <Card>
            <VStack gap={4} align="stretch" p={6}>
              <Text
                fontSize="lg"
                fontWeight="600"
                color="gray.900"
                fontFamily="var(--font-inter), sans-serif"
              >
                {t("AdminPage.welcome")}
              </Text>
              <Text
                fontSize="sm"
                color="gray.400"
                fontFamily="var(--font-inter), sans-serif"
              >
                {t("AdminPage.description")}
              </Text>
            </VStack>
          </Card>

          <VStack gap={4} align="stretch">
            {adminPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                style={{ textDecoration: "none" }}
              >
                <Card
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <HStack gap={4} p={4}>
                    <Text fontSize="2xl">{page.icon}</Text>
                    <VStack align="flex-start" gap={1} flex={1}>
                      <Text
                        fontSize="md"
                        fontWeight="600"
                        color="gray.900"
                        fontFamily="var(--font-inter), sans-serif"
                      >
                        {page.title}
                      </Text>
                      <Text
                        fontSize="sm"
                        color="gray.400"
                        fontFamily="var(--font-inter), sans-serif"
                      >
                        {page.description}
                      </Text>
                    </VStack>
                    <Text
                      fontSize="sm"
                      color="gray.400"
                      fontFamily="var(--font-inter), sans-serif"
                    >
                      →
                    </Text>
                  </HStack>
                </Card>
              </Link>
            ))}
          </VStack>

          <Card>
            <VStack gap={3} align="stretch" p={4}>
              <Text
                fontSize="sm"
                fontWeight="600"
                color="gray.900"
                fontFamily="var(--font-inter), sans-serif"
              >
                {t("AdminPage.quickLinks.title")}
              </Text>
              <VStack align="stretch" gap={2}>
                <ChakraLink
                  as={Link}
                  href="/games"
                  color="primary.400"
                  fontSize="sm"
                  fontFamily="var(--font-inter), sans-serif"
                  _hover={{ color: "primary.600" }}
                >
                  • {t("AdminPage.quickLinks.findMatch")}
                </ChakraLink>
                <ChakraLink
                  as={Link}
                  href="/my-events"
                  color="primary.400"
                  fontSize="sm"
                  fontFamily="var(--font-inter), sans-serif"
                  _hover={{ color: "primary.600" }}
                >
                  • {t("AdminPage.quickLinks.myGames")}
                </ChakraLink>
                <ChakraLink
                  as={Link}
                  href="/profile"
                  color="primary.400"
                  fontSize="sm"
                  fontFamily="var(--font-inter), sans-serif"
                  _hover={{ color: "primary.600" }}
                >
                  • {t("AdminPage.quickLinks.profile")}
                </ChakraLink>
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </Box>
      {/* Bottom Navigation */}
      <BottomNav items={navItems} />
    </Box>
  );
}
