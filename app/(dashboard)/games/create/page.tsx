"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  Heading,
  FieldRoot,
  FieldLabel,
  HStack,
  SimpleGrid,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { TextInput, TextArea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { GameFormData } from "@/types/game";

export default function CreateGamePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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

  return (
    <Box minH="100vh" bg="bg.secondary">
      <Header title="Create Game" showBackButton />
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
                <FieldLabel>Game Title</FieldLabel>
                <TextInput
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekend Football Match"
                />
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>Description</FieldLabel>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your game..."
                  rows={4}
                />
              </FieldRoot>

              <VStack align="stretch" gap={4}>
                <Heading size="md">Location</Heading>
                <FieldRoot required>
                  <FieldLabel>Address</FieldLabel>
                  <TextInput
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </FieldRoot>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <FieldRoot>
                    <FieldLabel>City</FieldLabel>
                    <TextInput
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </FieldRoot>
                  <FieldRoot>
                    <FieldLabel>Country</FieldLabel>
                    <TextInput
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleInputChange}
                      placeholder="Country"
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
                    value={formData.datetime}
                    onChange={handleInputChange}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <FieldLabel>Duration (minutes)</FieldLabel>
                  <TextInput
                    name="duration"
                    type="number"
                    value={formData.duration}
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
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    min={1}
                  />
                </FieldRoot>
                <FieldRoot required>
                  <FieldLabel>Price</FieldLabel>
                  <TextInput
                    name="price"
                    type="number"
                    value={formData.price}
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
                  <FieldLabel>Skill Level</FieldLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      name="skillLevel"
                      value={formData.skillLevel}
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
                  <FieldLabel>Cancellation Rule</FieldLabel>
                  <NativeSelectRoot>
                    <NativeSelectField
                      name="cancellationRule"
                      value={formData.cancellationRule}
                      onChange={handleInputChange}
                    >
                      <option value="anytime">Anytime</option>
                      <option value="24hours">24 Hours</option>
                      <option value="48hours">48 Hours</option>
                      <option value="72hours">72 Hours</option>
                      <option value="no_refund">No Refund</option>
                      <option value="custom">Custom</option>
                    </NativeSelectField>
                  </NativeSelectRoot>
                </FieldRoot>
              </SimpleGrid>

              <FieldRoot>
                <FieldLabel>Rules</FieldLabel>
                <TextArea
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  placeholder="Game rules..."
                  rows={3}
                />
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>Host Information</FieldLabel>
                <TextArea
                  name="hostInfo"
                  value={formData.hostInfo}
                  onChange={handleInputChange}
                  placeholder="Information about the host..."
                  rows={2}
                />
              </FieldRoot>

              <FieldRoot>
                <FieldLabel>Cancellation Policy</FieldLabel>
                <TextArea
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                  placeholder="Cancellation policy details..."
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
                  <FieldLabel htmlFor="isPublic" mb={0}>
                    Make this game public
                  </FieldLabel>
                </HStack>
              </FieldRoot>

              <HStack gap={4} pt={4}>
                <SecondaryButton
                  type="button"
                  onClick={() => router.back()}
                  flex={1}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" loading={loading} flex={1}>
                  Create Game
                </PrimaryButton>
              </HStack>
            </VStack>
          </form>
        </Card>
      </Box>
    </Box>
  );
}
