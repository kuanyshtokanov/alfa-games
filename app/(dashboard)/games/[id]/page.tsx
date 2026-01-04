"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  FieldRoot,
  FieldLabel,
  SimpleGrid,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  Spinner,
  Center,
  Separator,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { TextInput, TextArea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { StatusTag } from "@/components/ui/StatusTag";
import type { Game } from "@/types/game";

export default function GameDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Game>>({});

  const gameId = params.id as string;

  useEffect(() => {
    if (user && gameId) {
      fetchGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, gameId]);

  const fetchGame = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch(`/api/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch game");
      }

      const data = await response.json();

      setGame(data.game);
      setFormData(data.game);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update nested location fields
  const updateLocationField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...(prev.location || { address: "", city: "", country: "" }),
        [field]: value,
      },
    }));
  };

  // Helper function to update numeric fields
  const updateNumericField = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
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

  const handleSave = async () => {
    if (!user || !game) return;

    try {
      setSaving(true);
      setError(null);
      const token = await user.getIdToken();
      const response = await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          datetime: formData.datetime
            ? new Date(formData.datetime as string).toISOString()
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update game");
      }

      const data = await response.json();

      setGame(data.game);
      setFormData(data.game);
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to update game");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !game) return;
    if (!confirm("Are you sure you want to delete this game?")) return;

    try {
      setSaving(true);
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

      router.push("/games/my-games");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to delete game");
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (location: Game["location"]) => {
    const parts = [location.address, location.city, location.country].filter(
      Boolean
    );
    return parts.join(", ");
  };

  // Check if current user is the host
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const checkHost = async () => {
      if (!user || !game) {
        setIsHost(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const userResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const mongoUserId = String(userData.user.id);
          // Handle both populated object and string ID
          let hostId = "";
          if (typeof game.hostId === "string") {
            hostId = String(game.hostId);
          } else if (game.hostId && typeof game.hostId === "object") {
            hostId = String(game.hostId._id || game.hostId.id || "");
          }
          setIsHost(hostId === mongoUserId);
        }
      } catch {
        setIsHost(false);
      }
    };

    checkHost();
  }, [user, game]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title="Game Details" showBackButton />
        <Center py={12}>
          <Spinner size="lg" color="primary.400" />
        </Center>
      </Box>
    );
  }

  if (!game) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <Header title="Game Details" showBackButton />
        <Box p={4}>
          <AlertRoot status="error">
            <AlertIndicator />
            <AlertContent>Game not found</AlertContent>
          </AlertRoot>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.secondary">
      <Header
        title={isEditing ? "Edit Game" : "Game Details"}
        showBackButton
        rightContent={
          isHost &&
          !isEditing && (
            <HStack gap={2}>
              <SecondaryButton size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </SecondaryButton>
              <PrimaryButton
                size="sm"
                bg="error.500"
                _hover={{ bg: "error.600" }}
                _active={{ bg: "error.700" }}
                onClick={handleDelete}
                loading={saving}
              >
                Delete
              </PrimaryButton>
            </HStack>
          )
        }
      />
      <Box p={4} maxW="800px" mx="auto">
        {error && (
          <AlertRoot status="error" mb={4}>
            <AlertIndicator />
            <AlertContent>{error}</AlertContent>
          </AlertRoot>
        )}

        <Card>
          {isEditing ? (
            <VStack gap={6} align="stretch">
              <FieldRoot required>
                <FieldLabel>Game Title</FieldLabel>
                <TextInput
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                />
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>Description</FieldLabel>
                <TextArea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                />
              </FieldRoot>

              <VStack align="stretch" gap={4}>
                <Heading size="md">Location</Heading>
                <FieldRoot required>
                  <FieldLabel>Address</FieldLabel>
                  <TextInput
                    name="location.address"
                    value={formData.location?.address || ""}
                    onChange={handleInputChange}
                  />
                </FieldRoot>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <FieldRoot>
                    <FieldLabel>City</FieldLabel>
                    <TextInput
                      name="location.city"
                      value={formData.location?.city || ""}
                      onChange={handleInputChange}
                    />
                  </FieldRoot>
                  <FieldRoot>
                    <FieldLabel>Country</FieldLabel>
                    <TextInput
                      name="location.country"
                      value={formData.location?.country || ""}
                      onChange={handleInputChange}
                    />
                  </FieldRoot>
                </SimpleGrid>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FieldRoot required>
                  <FieldLabel>Date & Time</FieldLabel>
                  <TextInput
                    name="datetime"
                    type="datetime-local"
                    value={
                      formData.datetime
                        ? new Date(formData.datetime as string)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={handleInputChange}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <FieldLabel>Duration (minutes)</FieldLabel>
                  <TextInput
                    name="duration"
                    type="number"
                    value={formData.duration || 0}
                    onChange={handleInputChange}
                    min={1}
                  />
                </FieldRoot>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <FieldRoot required>
                  <FieldLabel>Max Players</FieldLabel>
                  <TextInput
                    name="maxPlayers"
                    type="number"
                    value={formData.maxPlayers || 0}
                    onChange={handleInputChange}
                    min={1}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <FieldLabel>Price</FieldLabel>
                  <TextInput
                    name="price"
                    type="number"
                    value={formData.price || 0}
                    onChange={handleInputChange}
                    min={0}
                    step="0.01"
                  />
                </FieldRoot>
                <FieldRoot required>
                  <FieldLabel>Currency</FieldLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      name="currency"
                      value={formData.currency || "KZT"}
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
                  <FieldLabel>Skill Level</FieldLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      name="skillLevel"
                      value={formData.skillLevel || "all"}
                      onChange={handleInputChange}
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
                <FieldRoot>
                  <FieldLabel>Status</FieldLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      name="status"
                      value={formData.status || "upcoming"}
                      onChange={handleInputChange}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
              </SimpleGrid>

              <HStack gap={4} pt={4}>
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(game);
                  }}
                  flex={1}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  onClick={handleSave}
                  loading={saving}
                  flex={1}
                >
                  Save Changes
                </PrimaryButton>
              </HStack>
            </VStack>
          ) : (
            <VStack gap={6} align="stretch">
              <HStack justify="space-between" align="start">
                <VStack align="start" gap={2}>
                  <Heading size="lg">{game.title}</Heading>
                  {getStatusTag(game.status)}
                </VStack>
              </HStack>

              {game.description && (
                <>
                  <Separator />
                  <VStack align="start" gap={2}>
                    <Heading size="sm" color="text.secondary">
                      Description
                    </Heading>
                    <Text>{game.description}</Text>
                  </VStack>
                </>
              )}

              <Separator />

              <VStack align="start" gap={2}>
                <Heading size="sm" color="text.secondary">
                  Date & Time
                </Heading>
                <Text>{formatDate(game.datetime)}</Text>
              </VStack>

              <Separator />

              <VStack align="start" gap={2}>
                <Heading size="sm" color="text.secondary">
                  Location
                </Heading>
                <Text>{formatLocation(game.location)}</Text>
              </VStack>

              <Separator />

              <SimpleGrid columns={2} gap={4}>
                <VStack align="start" gap={2}>
                  <Heading size="sm" color="text.secondary">
                    Duration
                  </Heading>
                  <Text>{game.duration} minutes</Text>
                </VStack>
                <VStack align="start" gap={2}>
                  <Heading size="sm" color="text.secondary">
                    Players
                  </Heading>
                  <Text>
                    {game.currentPlayersCount} / {game.maxPlayers}
                  </Text>
                </VStack>
                <VStack align="start" gap={2}>
                  <Heading size="sm" color="text.secondary">
                    Price
                  </Heading>
                  <Text>
                    {game.price} {game.currency}
                  </Text>
                </VStack>
                <VStack align="start" gap={2}>
                  <Heading size="sm" color="text.secondary">
                    Skill Level
                  </Heading>
                  <Text>{game.skillLevel}</Text>
                </VStack>
              </SimpleGrid>

              {game.rules && (
                <>
                  <Separator />
                  <VStack align="start" gap={2}>
                    <Heading size="sm" color="text.secondary">
                      Rules
                    </Heading>
                    <Text>{game.rules}</Text>
                  </VStack>
                </>
              )}

              {game.hostInfo && (
                <>
                  <Separator />
                  <VStack align="start" gap={2}>
                    <Heading size="sm" color="text.secondary">
                      Host Information
                    </Heading>
                    <Text>{game.hostInfo}</Text>
                  </VStack>
                </>
              )}

              {game.cancellationPolicy && (
                <>
                  <Separator />
                  <VStack align="start" gap={2}>
                    <Heading size="sm" color="text.secondary">
                      Cancellation Policy
                    </Heading>
                    <Text>{game.cancellationPolicy}</Text>
                  </VStack>
                </>
              )}
            </VStack>
          )}
        </Card>
      </Box>
    </Box>
  );
}

function getStatusTag(status: Game["status"]) {
  switch (status) {
    case "upcoming":
      return (
        <StatusTag variant="custom" bgColor="primary.400">
          Upcoming
        </StatusTag>
      );
    case "cancelled":
      return (
        <StatusTag variant="custom" bgColor="error.500">
          Cancelled
        </StatusTag>
      );
    case "completed":
      return (
        <StatusTag variant="custom" bgColor="gray.500">
          Completed
        </StatusTag>
      );
    default:
      return null;
  }
}
