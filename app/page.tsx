"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Center, Spinner, Box } from "@chakra-ui/react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to games/my-games (dashboard)
        router.push("/games/my-games");
      } else {
        // User is not authenticated, redirect to login
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth status
  return (
    <Box minH="100vh" bg="bg.secondary">
      <Center minH="100vh">
        <Spinner size="xl" color="primary.400" />
      </Center>
    </Box>
  );
}
