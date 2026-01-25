"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  Heading,
  FieldRoot,
  HStack,
  SimpleGrid,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  NativeSelectRoot,
  NativeSelectField,
  Center,
  Text,
} from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { TextInput, TextArea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { getBottomNavItems } from "@/lib/navigation";
import { StyledFieldLabel } from "@/components/ui/FieldLabel";
import { getCurrentUserRole, canUserCreateGame } from "@/lib/utils/rbac-client";
import type { GameFormData } from "@/types/game";

export default function CreateGamePage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [navItems, setNavItems] = useState(getBottomNavItems((key) => t(`Navigation.${key}`)));
  const [formData, setFormData] = useState<GameFormData>({
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
  });

  // Track numeric field values as strings for proper input handling
  const [numericFields, setNumericFields] = useState<{
    duration: string;
    maxPlayers: string;
    price: string;
  }>({
    duration: "90",
    maxPlayers: "22",
    price: "0",
  });

  // Helper function to update nested location fields
  const updateLocationField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Helper function to update numeric fields
  const updateNumericField = (name: string, value: string) => {
    // Update the string representation for display
    setNumericFields((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update the actual form data with parsed number (or 0 if empty)
    const numValue = value === "" ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (value === "") {
      // Allow empty string - set to 0 for validation
      setFormData((prev) => ({
        ...prev,
        [name]: 0,
      }));
    }
  };

  // Helper function to update checkbox fields
  const updateCheckboxField = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Helper function to update simple string fields
  const updateStringField = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const { name, value } = target;

    // Handle nested location fields
    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      updateLocationField(field, value);
      return;
    }

    // Handle numeric fields
    const numericFields = ["duration", "maxPlayers", "price"];
    if (numericFields.includes(name)) {
      updateNumericField(name, value);
      return;
    }

    // Handle checkbox fields
    if (name === "isPublic") {
      updateCheckboxField(name, (target as HTMLInputElement).checked);
      return;
    }

    // Handle all other string fields
    updateStringField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to create a game");
      }

      // Validate required numeric fields
      if (!formData.duration || formData.duration <= 0) {
        throw new Error("Duration must be greater than 0");
      }
      if (!formData.maxPlayers || formData.maxPlayers <= 0) {
        throw new Error("Max players must be greater than 0");
      }
      if (formData.price === undefined || formData.price < 0) {
        throw new Error("Price must be 0 or greater");
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
      setError(error.message || "Failed to create game");
    } finally {
      setLoading(false);
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
        <Card>
          <form onSubmit={handleSubmit}>
            <VStack gap={6} align="stretch">
              {error && (
                <AlertRoot status="error">
                  <AlertIndicator />
                  <AlertContent>{error}</AlertContent>
                </AlertRoot>
              )}

              <FieldRoot required>
                <StyledFieldLabel>{t("Admin.Games.Create.labels.title")}</StyledFieldLabel>
                <TextInput
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t("Admin.Games.Create.placeholders.title")}
                />
              </FieldRoot>

              <FieldRoot>
                <StyledFieldLabel>{t("Admin.Games.Create.labels.description")}</StyledFieldLabel>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t("Admin.Games.Create.placeholders.description")}
                  rows={4}
                />
              </FieldRoot>

              <VStack align="stretch" gap={4}>
                <Heading
                  size="md"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {t("Admin.Games.Create.labels.location")}
                </Heading>
                <FieldRoot required>
                  <StyledFieldLabel>{t("Admin.Games.Create.labels.address")}</StyledFieldLabel>
                  <TextInput
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder={t("Admin.Games.Create.placeholders.address")}
                  />
                </FieldRoot>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <FieldRoot>
                    <StyledFieldLabel>{t("Admin.Games.Create.labels.city")}</StyledFieldLabel>
                    <TextInput
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      placeholder={t("Admin.Games.Create.placeholders.city")}
                    />
                  </FieldRoot>
                  <FieldRoot>
                    <StyledFieldLabel>{t("Admin.Games.Create.labels.country")}</StyledFieldLabel>
                    <TextInput
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleInputChange}
                      placeholder={t("Admin.Games.Create.placeholders.country")}
                    />
                  </FieldRoot>
                </SimpleGrid>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FieldRoot required>
                  <StyledFieldLabel>{t("Admin.Games.Create.labels.dateTime")}</StyledFieldLabel>
                  <TextInput
                    name="datetime"
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={handleInputChange}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <StyledFieldLabel>{t("Admin.Games.Create.labels.duration")}</StyledFieldLabel>
                  <TextInput
                    name="duration"
                    type="number"
                    value={numericFields.duration}
                    onChange={handleInputChange}
                    min={1}
                  />
                </FieldRoot>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <FieldRoot required>
                  <StyledFieldLabel>{t("Admin.Games.Create.labels.maxPlayers")}</StyledFieldLabel>
                  <TextInput
                    name="maxPlayers"
                    type="number"
                    value={numericFields.maxPlayers}
                    onChange={handleInputChange}
                    min={1}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <StyledFieldLabel>{t("Admin.Games.Create.labels.price")}</StyledFieldLabel>
                  <TextInput
                    name="price"
                    type="number"
                    value={numericFields.price}
                    onChange={handleInputChange}
                    min={0}
                    step="0.01"
                  />
                </FieldRoot>
                <FieldRoot required>
                  <StyledFieldLabel>{t("Admin.Games.Create.labels.currency")}</StyledFieldLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                    >
                      <option value="KZT">KZT</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="RUB">RUB</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FieldRoot>
                  <StyledFieldLabel>{t("Admin.Games.Create.labels.skillLevel")}</StyledFieldLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      name="skillLevel"
                      value={formData.skillLevel}
                      onChange={handleInputChange}
                    >
                      <option value="all">{t("Admin.Games.Create.options.allLevels")}</option>
                      <option value="beginner">{t("Admin.Games.Create.options.beginner")}</option>
                      <option value="intermediate">{t("Admin.Games.Create.options.intermediate")}</option>
                      <option value="advanced">{t("Admin.Games.Create.options.advanced")}</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
                <FieldRoot>
                  <StyledFieldLabel>{t("Admin.Games.Create.labels.cancellationRule")}</StyledFieldLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      name="cancellationRule"
                      value={formData.cancellationRule}
                      onChange={handleInputChange}
                    >
                      <option value="anytime">{t("Admin.Games.Create.options.anytime")}</option>
                      <option value="24hours">{t("Admin.Games.Create.options.24hours")}</option>
                      <option value="48hours">{t("Admin.Games.Create.options.48hours")}</option>
                      <option value="72hours">{t("Admin.Games.Create.options.72hours")}</option>
                      <option value="no_refund">{t("Admin.Games.Create.options.noRefund")}</option>
                      <option value="custom">{t("Admin.Games.Create.options.custom")}</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
              </SimpleGrid>

              <FieldRoot>
                <StyledFieldLabel>{t("Admin.Games.Create.labels.rules")}</StyledFieldLabel>
                <TextArea
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  placeholder={t("Admin.Games.Create.placeholders.rules")}
                  rows={3}
                />
              </FieldRoot>

              <FieldRoot>
                <StyledFieldLabel>{t("Admin.Games.Create.labels.hostInfo")}</StyledFieldLabel>
                <TextArea
                  name="hostInfo"
                  value={formData.hostInfo}
                  onChange={handleInputChange}
                  placeholder={t("Admin.Games.Create.placeholders.hostInfo")}
                  rows={2}
                />
              </FieldRoot>

              <FieldRoot>
                <StyledFieldLabel>{t("Admin.Games.Create.labels.cancellationPolicy")}</StyledFieldLabel>
                <TextArea
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                  placeholder={t("Admin.Games.Create.placeholders.cancellationPolicy")}
                  rows={2}
                />
              </FieldRoot>

              <FieldRoot>
                <HStack>
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    id="isPublic"
                  />
                  <StyledFieldLabel htmlFor="isPublic" mb={0}>
                    {t("Admin.Games.Create.labels.isPublic")}
                  </StyledFieldLabel>
                </HStack>
              </FieldRoot>

              <HStack gap={4} pt={4}>
                <SecondaryButton
                  type="button"
                  onClick={() => router.back()}
                  flex={1}
                >
                  {t("Admin.Games.Create.cancel")}
                </SecondaryButton>
                <PrimaryButton type="submit" loading={loading} flex={1}>
                  {t("Admin.Games.Create.submit")}
                </PrimaryButton>
              </HStack>
            </VStack>
          </form>
        </Card>
      </Box>
      {/* Bottom Navigation */}
      <BottomNav items={navItems} />
    </Box>
  );
}
