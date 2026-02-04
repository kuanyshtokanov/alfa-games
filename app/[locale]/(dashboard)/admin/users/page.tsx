"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  HStack,
  Text,
  FieldRoot,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { getBottomNavItems } from "@/lib/navigation";
import { getCurrentUserRole } from "@/lib/utils/rbac-client";
import type { UserRole } from "@/lib/utils/rbac-client";
import { SearchInput, TextInput } from "@/components/ui/Input";
import { StyledFieldLabel } from "@/components/ui/FieldLabel";
import { PrimaryButton } from "@/components/ui/Button";
import { StatusTag } from "@/components/ui/StatusTag";

type AdminUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  balance?: number;
  currency?: string;
};

type TopUpFormState = {
  amount: string;
  description: string;
  loading: boolean;
  error: string | null;
  success: string | null;
};

const defaultTopUpState: TopUpFormState = {
  amount: "",
  description: "",
  loading: false,
  error: null,
  success: null,
};

const roleBadgeColor = (role?: string) => {
  switch (role) {
    case "admin":
      return "purple.500";
    case "host":
      return "blue.500";
    default:
      return "gray.500";
  }
};

export default function AdminUsersPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [navItems, setNavItems] = useState(getBottomNavItems((key) => t(`Navigation.${key}`)));
  const [topUpForms, setTopUpForms] = useState<Record<string, TopUpFormState>>({});

  useEffect(() => {
    if (user) {
      checkPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkPermissions = async () => {
    if (!user) return;

    try {
      const role = await getCurrentUserRole(user);
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

      if (role && role.role !== "admin") {
        router.push("/my-events");
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
      router.push("/my-events");
    }
  };

  const fetchUsers = useCallback(async () => {
    if (!user || !userRole) return;

    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [user, userRole]);

  useEffect(() => {
    if (user && userRole) {
      fetchUsers();
    }
  }, [user, userRole, fetchUsers]);

  const getFormState = (userId: string) => {
    return topUpForms[userId] || { ...defaultTopUpState };
  };

  const updateFormState = (userId: string, updates: Partial<TopUpFormState>) => {
    setTopUpForms((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || defaultTopUpState),
        ...updates,
      },
    }));
  };

  const handleTopUp = async (userId: string) => {
    if (!user) return;

    const formState = getFormState(userId);
    const amount = Number(formState.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      updateFormState(userId, {
        error: "Enter a valid amount greater than 0.",
        success: null,
      });
      return;
    }

    try {
      updateFormState(userId, {
        loading: true,
        error: null,
        success: null,
      });

      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/users/${userId}/credits/top-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          currency: "KZT",
          description: formState.description?.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Top up failed");
      }

      updateFormState(userId, {
        amount: "",
        description: "",
        loading: false,
        success: `Top-up successful. New balance: ${data.balance} ${data.currency}`,
      });
      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === userId
            ? { ...entry, balance: data.balance, currency: data.currency }
            : entry
        )
      );
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      updateFormState(userId, {
        loading: false,
        error: apiError.message || "Top up failed",
      });
    }
  };

  if (!user) {
    return null;
  }

  if (loading && !userRole) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title="Admin Users" showBackButton />
        <Center py={12}>
          <Spinner size="lg" color="primary.400" />
        </Center>
      </Box>
    );
  }

  if (userRole && userRole.role !== "admin") {
    return null;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredUsers = normalizedQuery
    ? users.filter((entry) => {
        const fields = [entry.name, entry.email, entry.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fields.includes(normalizedQuery);
      })
    : users;

  return (
    <Box minH="100vh" bg="bg.secondary" pb={20}>
      <Header title="Admin Users" showBackButton />
      <Box p={4} maxW="1100px" mx="auto">
        <VStack align="stretch" gap={4}>
          <Card>
            <VStack align="stretch" gap={4}>
              <Text
                fontSize="sm"
                color="gray.400"
                fontFamily="var(--font-inter), sans-serif"
              >
                Search for a user and apply a credit top-up. All adjustments are recorded.
              </Text>
              <SearchInput
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </VStack>
          </Card>

          {error && (
            <AlertRoot status="error">
              <AlertIndicator />
              <AlertContent>{error}</AlertContent>
            </AlertRoot>
          )}

          {loading ? (
            <Center py={12}>
              <Spinner size="lg" color="primary.400" />
            </Center>
          ) : filteredUsers.length === 0 ? (
            <Box bg="white" borderRadius="lg" p={8} textAlign="center">
              <Text
                color="gray.400"
                fontSize="lg"
                fontFamily="var(--font-inter), sans-serif"
              >
                No users found.
              </Text>
            </Box>
          ) : (
            <VStack align="stretch" gap={4}>
              <Text
                fontSize="14px"
                fontWeight="500"
                color="gray.400"
                fontFamily="var(--font-inter), sans-serif"
              >
                {filteredUsers.length} users
              </Text>
              {filteredUsers.map((entry) => {
                const formState = getFormState(entry.id);
                return (
                  <Card key={entry.id}>
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between" align="flex-start">
                        <VStack align="flex-start" gap={1}>
                          <Text
                            fontSize="md"
                            fontWeight="600"
                            color="gray.900"
                            fontFamily="var(--font-inter), sans-serif"
                          >
                            {entry.name || "Unnamed User"}
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.400"
                            fontFamily="var(--font-inter), sans-serif"
                          >
                            {entry.email || "No email"}
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            fontFamily="var(--font-inter), sans-serif"
                          >
                            Credits: {entry.balance ?? 0} {entry.currency || "KZT"}
                          </Text>
                        </VStack>
                        <StatusTag bgColor={roleBadgeColor(entry.role)}>
                          {(entry.role || "player").toUpperCase()}
                        </StatusTag>
                      </HStack>

                      <HStack gap={4} align="flex-end" flexWrap="wrap">
                        <FieldRoot flex="1" minW="140px">
                          <StyledFieldLabel>Top-up amount (KZT)</StyledFieldLabel>
                          <TextInput
                            type="number"
                            min="0"
                            step="1"
                            value={formState.amount}
                            onChange={(event) =>
                              updateFormState(entry.id, { amount: event.target.value })
                            }
                            placeholder="Enter amount"
                          />
                        </FieldRoot>
                        <FieldRoot flex="2" minW="180px">
                          <StyledFieldLabel>Note (optional)</StyledFieldLabel>
                          <TextInput
                            value={formState.description}
                            onChange={(event) =>
                              updateFormState(entry.id, { description: event.target.value })
                            }
                            placeholder="e.g. Promo credit"
                          />
                        </FieldRoot>
                        <PrimaryButton
                          onClick={() => handleTopUp(entry.id)}
                          loading={formState.loading}
                        >
                          Top up
                        </PrimaryButton>
                      </HStack>

                      {formState.error && (
                        <AlertRoot status="error">
                          <AlertIndicator />
                          <AlertContent>{formState.error}</AlertContent>
                        </AlertRoot>
                      )}
                      {formState.success && (
                        <AlertRoot status="success">
                          <AlertIndicator />
                          <AlertContent>{formState.success}</AlertContent>
                        </AlertRoot>
                      )}
                    </VStack>
                  </Card>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Box>
      <BottomNav items={navItems} />
    </Box>
  );
}
