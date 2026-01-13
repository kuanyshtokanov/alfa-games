"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  FieldRoot,
  FieldLabel,
  Input,
  Heading,
  Text,
  VStack,
  HStack,
  AlertRoot,
  AlertContent,
  AlertIndicator,
  Link,
} from "@chakra-ui/react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  PrimaryButton,
  SecondaryButton,
  DisabledButton,
} from "@/components/ui/Button";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/games";

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim()) {
      return "";
    }
    if (!emailRegex.test(emailValue)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailTouched) {
      setEmailError(validateEmail(value));
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const isFormValid =
    email.trim() !== "" && password.trim() !== "" && !emailError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push(redirect);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirect);
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
      router.push(redirect);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to sign in with Facebook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#F8F8F8" py={12}>
      <Container maxW="md">
        <VStack gap={8}>
          <Box textAlign="center">
            <Heading
              fontSize="28px"
              fontWeight="600"
              lineHeight="34px"
              letterSpacing="-0.02em"
              color="#111827"
              fontFamily="var(--font-inter), sans-serif"
              mb={2}
            >
              Welcome back!
            </Heading>
            <Text
              fontSize="14px"
              fontWeight="500"
              color="#9CA3AF"
              fontFamily="var(--font-inter), sans-serif"
            >
              Sign in to find matches and meet new players.
            </Text>
          </Box>

          <Box w="full">
            {error && (
              <AlertRoot status="error" mb={4} borderRadius="md">
                <AlertIndicator />
                <AlertContent>{error}</AlertContent>
              </AlertRoot>
            )}

            <VStack gap={4} as="form" onSubmit={handleSubmit} w="full">
              <FieldRoot required>
                <FieldLabel
                  fontSize="14px"
                  fontWeight="600"
                  color="#111827"
                  fontFamily="var(--font-inter), sans-serif"
                  mb={2}
                >
                  Email
                </FieldLabel>
                <Box position="relative" w="full">
                  <svg
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px",
                      height: "20px",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                      fill="#9CA3AF"
                    />
                  </svg>
                  <Input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder="youremail@mail.com"
                    pl={12}
                    pr={4}
                    py={3}
                    h="48px"
                    w="full"
                    bg="#FFFFFF"
                    borderColor={emailError ? "#EF4444" : "#E5E7EB"}
                    borderWidth="1px"
                    borderRadius="lg"
                    fontSize="14px"
                    fontWeight="500"
                    color="#111827"
                    fontFamily="var(--font-inter), sans-serif"
                    _placeholder={{ color: "#9CA3AF" }}
                    _focus={{
                      borderColor: emailError ? "#EF4444" : "#3CB371",
                      boxShadow: emailError
                        ? "0 0 0 1px #EF4444"
                        : "0 0 0 1px #3CB371",
                    }}
                    _hover={{
                      borderColor: emailError ? "#EF4444" : "#D1D5DB",
                    }}
                  />
                  {emailError && (
                    <Text
                      fontSize="12px"
                      color="#EF4444"
                      mt={1}
                      fontFamily="var(--font-inter), sans-serif"
                    >
                      {emailError}
                    </Text>
                  )}
                </Box>
              </FieldRoot>

              <FieldRoot required>
                <FieldLabel
                  fontSize="14px"
                  fontWeight="600"
                  color="#111827"
                  fontFamily="var(--font-inter), sans-serif"
                  mb={2}
                >
                  Password
                </FieldLabel>
                <Box position="relative" w="full">
                  <svg
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px",
                      height: "20px",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                      fill="#9CA3AF"
                    />
                  </svg>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Input your password"
                    pl={12}
                    pr={12}
                    py={3}
                    h="48px"
                    w="full"
                    bg="#FFFFFF"
                    borderColor="#E5E7EB"
                    borderWidth="1px"
                    borderRadius="lg"
                    fontSize="14px"
                    fontWeight="500"
                    color="#111827"
                    fontFamily="var(--font-inter), sans-serif"
                    _placeholder={{ color: "#9CA3AF" }}
                    _focus={{
                      borderColor: "#3CB371",
                      boxShadow: "0 0 0 1px #3CB371",
                    }}
                  />
                  <Box
                    as="button"
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    bg="transparent"
                    border="none"
                    cursor="pointer"
                    p={1}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      {showPassword ? (
                        <path
                          d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          fill="#9CA3AF"
                        />
                      ) : (
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                          fill="#9CA3AF"
                        />
                      )}
                    </svg>
                  </Box>
                </Box>
              </FieldRoot>

              <Box w="full" mt={2}>
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color="#9CA3AF"
                  fontFamily="var(--font-inter), sans-serif"
                  textAlign="center"
                >
                  Forgot your password?{" "}
                  <Link
                    href="/forgot-password"
                    color="#3CB371"
                    fontWeight="600"
                    textDecoration="none"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Reset here
                  </Link>
                </Text>
              </Box>

              {isFormValid ? (
                <PrimaryButton
                  type="submit"
                  w="full"
                  loading={loading}
                  loadingText="Signing in..."
                >
                  Login
                </PrimaryButton>
              ) : (
                <DisabledButton w="full">Login</DisabledButton>
              )}
            </VStack>

            <VStack gap={3} w="full" mt={4}>
              <SecondaryButton
                onClick={handleGoogleSignIn}
                w="full"
                loading={loading}
              >
                <HStack gap={2}>
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
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
                  </svg>
                  <Text fontFamily="var(--font-inter), sans-serif">
                    Login with Google
                  </Text>
                </HStack>
              </SecondaryButton>

              <SecondaryButton
                onClick={handleFacebookSignIn}
                w="full"
                loading={loading}
              >
                <HStack gap={2}>
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fill="currentColor"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                  <Text fontFamily="var(--font-inter), sans-serif">
                    Login with Apple
                  </Text>
                </HStack>
              </SecondaryButton>
            </VStack>

            <Text
              mt={6}
              textAlign="center"
              fontSize="14px"
              fontWeight="500"
              color="#9CA3AF"
              fontFamily="var(--font-inter), sans-serif"
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                color="#3CB371"
                fontWeight="600"
                textDecoration="none"
                _hover={{ textDecoration: "underline" }}
              >
                Register here
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Container maxW="md" py={12}>
          <Box textAlign="center">
            <Text>Loading...</Text>
          </Box>
        </Container>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
