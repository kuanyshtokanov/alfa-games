"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  FieldRoot,
  FieldLabel,
  Input,
  Heading,
  Text,
  VStack,
  HStack,
  Separator,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  Link,
  Icon,
} from "@chakra-ui/react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);
      router.push("/games");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/games");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithFacebook();
      router.push("/games");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to sign in with Facebook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack gap={8}>
        <Box textAlign="center">
          <Heading size="xl" mb={2}>
            Create Account
          </Heading>
          <Text color="gray.600">Sign up to get started</Text>
        </Box>

        <Box w="full">
          {error && (
            <AlertRoot status="error" mb={4} borderRadius="md">
              <AlertIndicator />
              <AlertContent>{error}</AlertContent>
            </AlertRoot>
          )}

          <VStack gap={4} as="form" onSubmit={handleSubmit}>
            <FieldRoot>
              <FieldLabel>Full Name</FieldLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                size="lg"
              />
            </FieldRoot>

            <FieldRoot required>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                size="lg"
              />
            </FieldRoot>

            <FieldRoot required>
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                size="lg"
              />
            </FieldRoot>

            <FieldRoot required>
              <FieldLabel>Confirm Password</FieldLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                size="lg"
              />
            </FieldRoot>

            <Button
              type="submit"
              colorPalette="blue"
              size="lg"
              w="full"
              loading={loading}
              loadingText="Creating account..."
            >
              Sign Up
            </Button>
          </VStack>

          <HStack my={6} gap={2}>
            <Separator />
            <Text fontSize="sm" color="gray.500">
              OR
            </Text>
            <Separator />
          </HStack>

          <VStack gap={3}>
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              size="lg"
              w="full"
              loading={loading}
            >
              <HStack gap={2}>
                <Icon viewBox="0 0 24 24" boxSize={5}>
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </Icon>
                <Text>Continue with Google</Text>
              </HStack>
            </Button>

            <Button
              onClick={handleFacebookSignIn}
              variant="outline"
              size="lg"
              w="full"
              loading={loading}
            >
              <HStack gap={2}>
                <Icon viewBox="0 0 24 24" boxSize={5}>
                  <path
                    fill="currentColor"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </Icon>
                <Text>Continue with Facebook</Text>
              </HStack>
            </Button>
          </VStack>

          <Text mt={6} textAlign="center" fontSize="sm">
            Already have an account?{" "}
            <Link href="/login" color="blue.500" fontWeight="semibold">
              Sign in
            </Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
