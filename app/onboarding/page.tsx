"use client";

import { useRouter } from "next/navigation";
import { Box, Container, VStack, Heading, Text, Image } from "@chakra-ui/react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <Box minH="100vh" bg="white" position="relative">
      {/* Onboarding label - top left */}
      <Box
        position="absolute"
        top={4}
        left={4}
        color="gray.400"
        fontSize="sm"
        fontWeight="medium"
        zIndex={1}
      >
        Onboarding
      </Box>

      <Container maxW="sm" px={4} py={12}>
        <VStack gap={8} align="stretch">
          {/* Image Section */}
          <Box
            position="relative"
            w="full"
            borderRadius="xl"
            overflow="hidden"
            bg="gray.100"
            aspectRatio="4/3"
          >
            <Image
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop"
              alt="Female soccer player in action"
              objectFit="cover"
              w="full"
              h="full"
            />
          </Box>

          {/* Text Content Section */}
          <VStack gap={4} align="stretch" textAlign="center">
            <Heading
              as="h1"
              fontSize="28px"
              fontWeight="600"
              lineHeight="34px"
              letterSpacing="-0.02em"
              color="#111827"
              fontFamily="var(--font-inter), sans-serif"
            >
              Find sports events near you!
            </Heading>
            <Text
              fontSize="14px"
              fontWeight="500"
              lineHeight="20px"
              letterSpacing="-0.01em"
              color="#9CA3AF"
              fontFamily="var(--font-inter), sans-serif"
            >
              Discover and join sports games easily and conveniently — anytime,
              anywhere.
            </Text>
          </VStack>

          {/* Call-to-Action Buttons */}
          <VStack gap={3} align="stretch" mt={2}>
            <PrimaryButton onClick={handleGetStarted} w="full">
              Get started
            </PrimaryButton>
            <SecondaryButton onClick={handleSignUp} w="full">
              I&apos;m new, sign me up
            </SecondaryButton>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
