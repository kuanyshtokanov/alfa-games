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
  FieldRoot,
  FieldLabel,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { PrimaryButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { getBottomNavItems } from "@/lib/navigation";
import { getCurrentUserRole } from "@/lib/utils/rbac-client";
import { StyledFieldLabel } from "@/components/ui/FieldLabel";

/**
 * Admin page for setting user roles
 * This is a development/testing page - you may want to restrict access in production
 */
export default function SetRolePage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [role, setRole] = useState<"player" | "host" | "admin">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [navItems, setNavItems] = useState(getBottomNavItems((key) => t(`Navigation.${key}`)));

  // Update navigation items based on user role
  useEffect(() => {
    if (user) {
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
  }, [user]);

  const handleUpdateRole = async () => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/users/me/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setSuccess(`Role updated to ${role}! Refresh the page to see changes.`);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title="Set Role" showBackButton />
        <Box p={4}>
          <Text>You must be logged in to use this page.</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.secondary" pb={20}>
      <Header title="Set Your Role" showBackButton />
      <Box p={4} maxW="600px" mx="auto">
        <Card>
          <VStack gap={6} align="stretch">
            <Text fontSize="sm" color="gray.400" fontFamily="var(--font-inter), sans-serif">
              This page allows you to update your user role. Useful for
              development and testing.
            </Text>

            {error && (
              <AlertRoot status="error">
                <AlertIndicator />
                <AlertContent>{error}</AlertContent>
              </AlertRoot>
            )}

            {success && (
              <AlertRoot status="success">
                <AlertIndicator />
                <AlertContent>{success}</AlertContent>
              </AlertRoot>
            )}

            <FieldRoot>
              <StyledFieldLabel>Select Role</StyledFieldLabel>
              <NativeSelectRoot>
                <NativeSelectField
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "player" | "host" | "admin")
                  }
                >
                  <option value="player">Player (default - can only view/join games)</option>
                  <option value="host">Host (can create and manage own games)</option>
                  <option value="admin">Admin (can manage all games and users)</option>
                </NativeSelectField>
              </NativeSelectRoot>
            </FieldRoot>

            <HStack gap={4}>
              <PrimaryButton
                onClick={handleUpdateRole}
                loading={loading}
                flex={1}
              >
                Update Role
              </PrimaryButton>
            </HStack>

            <Box mt={4} p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="600" mb={2}>
                Quick Access Links:
              </Text>
              <VStack align="stretch" gap={2}>
                <Text fontSize="sm">
                  • <a href="/my-events" style={{ color: "#3CB371" }}>My Events</a> - View games you've registered for
                </Text>
                <Text fontSize="sm">
                  • <a href="/admin/games/create" style={{ color: "#3CB371" }}>Create Game</a> - Create a new game (requires host/admin)
                </Text>
                <Text fontSize="sm">
                  • <a href="/admin/games/manage" style={{ color: "#3CB371" }}>Manage Games</a> - Manage all games (requires admin/host)
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Card>
      </Box>
      {/* Bottom Navigation */}
      <BottomNav items={navItems} />
    </Box>
  );
}
