"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
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
} from "@chakra-ui/react";
import { Card } from "@/components/ui/Card";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { TextInput, TextArea } from "@/components/ui/Input";
import { StyledFieldLabel } from "@/components/ui/FieldLabel";
import type { GameFormData } from "@/types/game";

type GameFormProps = {
  initialData: GameFormData;
  onSubmit: (data: GameFormData) => Promise<void>;
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
};

export function GameForm({
  initialData,
  onSubmit,
  submitLabel,
  cancelLabel,
  onCancel,
}: GameFormProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState<GameFormData>(initialData);
  const [numericFields, setNumericFields] = useState<{
    duration: string;
    maxPlayers: string;
    price: string;
  }>({
    duration: String(initialData.duration ?? ""),
    maxPlayers: String(initialData.maxPlayers ?? ""),
    price: String(initialData.price ?? ""),
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    setNumericFields({
      duration: String(initialData.duration ?? ""),
      maxPlayers: String(initialData.maxPlayers ?? ""),
      price: String(initialData.price ?? ""),
    });
  }, [initialData]);

  const updateLocationField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const updateNumericField = (name: string, value: string) => {
    setNumericFields((prev) => ({
      ...prev,
      [name]: value,
    }));

    const numValue = value === "" ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (value === "") {
      setFormData((prev) => ({
        ...prev,
        [name]: 0,
      }));
    }
  };

  const updateCheckboxField = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

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

    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      updateLocationField(field, value);
      return;
    }

    const numericFieldNames = ["duration", "maxPlayers", "price"];
    if (numericFieldNames.includes(name)) {
      updateNumericField(name, value);
      return;
    }

    if (name === "isPublic") {
      updateCheckboxField(name, (target as HTMLInputElement).checked);
      return;
    }

    updateStringField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!formData.duration || formData.duration <= 0) {
        throw new Error("Duration must be greater than 0");
      }
      if (!formData.maxPlayers || formData.maxPlayers <= 0) {
        throw new Error("Max players must be greater than 0");
      }
      if (formData.price === undefined || formData.price < 0) {
        throw new Error("Price must be 0 or greater");
      }

      await onSubmit(formData);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to save game");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            <StyledFieldLabel>
              {t("Admin.Games.Create.labels.cancellationPolicy")}
            </StyledFieldLabel>
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
            <SecondaryButton type="button" onClick={onCancel} flex={1}>
              {cancelLabel}
            </SecondaryButton>
            <PrimaryButton type="submit" loading={submitting} flex={1}>
              {submitLabel}
            </PrimaryButton>
          </HStack>
        </VStack>
      </form>
    </Card>
  );
}
