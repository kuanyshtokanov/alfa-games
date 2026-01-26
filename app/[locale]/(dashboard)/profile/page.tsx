"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/Avatar";
import { SecondaryButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { GreenHeader } from "@/components/ui/GreenHeader";
import { getBottomNavItems } from "@/lib/navigation";
import { getCurrentUserRole } from "@/lib/utils/rbac-client";

interface UserStats {
  matchesPlayed: number;
  football: number;
  volleyball: number;
  tennis: number;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'kk', label: 'Қазақша' },
];

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    matchesPlayed: 0,
    football: 0,
    volleyball: 0,
    tennis: 0,
  });
  const [navItems, setNavItems] = useState(getBottomNavItems((key) => t(`Navigation.${key}`)));

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Get user role and data
        const userRole = await getCurrentUserRole(user);
        if (userRole) {
          setUserData(userRole);
          setNavItems(
            getBottomNavItems(
              (key) => t(`Navigation.${key}`),
              userRole.role,
              userRole.isClubManager || false
            )
          );
        }

        // Get user stats
        const token = await user.getIdToken();
        const statsResponse = await fetch("/api/profile/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
    setIsLanguageOpen(false);
  };

  if (loading || !user) {
    return (
      <Box minH="100vh" bg="bg.secondary">
        <GreenHeader title={t('Navigation.profile')} />
      </Box>
    );
  }

  const displayName = userData?.name || user.displayName || "User";
  const avatarUrl = userData?.avatar || user.photoURL || undefined;

  return (
    <Box minH="100vh" bg="bg.secondary" pb={20}>
      {/* Green Header */}
      <GreenHeader title={t('Navigation.profile')} />

      <Box px={4} pt={6}>
        {/* User Profile Card */}
        <Card mb={6}>
          <HStack gap={4} align="center">
            <Avatar
              name={displayName}
              src={avatarUrl}
              size="lg"
            />
            <VStack align="flex-start" flex={1} gap={0}>
              <Text
                fontSize="18px"
                fontWeight="700"
                color="gray.900"
                fontFamily="var(--font-inter), sans-serif"
              >
                {displayName}
              </Text>
            </VStack>
            <SecondaryButton
              size="sm"
              onClick={() => {
                // TODO: Implement edit profile
                console.log("Edit profile");
              }}
            >
              <HStack gap={1}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <Text fontSize="14px">{t("ProfilePage.edit")}</Text>
              </HStack>
            </SecondaryButton>
          </HStack>
        </Card>

        {/* Your Stats Section */}
        <VStack align="stretch" gap={4} mb={6}>
          <Heading
            size="md"
            color="gray.900"
            fontFamily="var(--font-inter), sans-serif"
            fontWeight="700"
            fontSize="18px"
          >
            {t("ProfilePage.yourStats")}
          </Heading>
          <SimpleGrid columns={3} gap={3}>
            {/* Matches Played */}
            <Card>
              <VStack gap={2} py={3}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="md"
                  bg="primary.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    color="primary.400"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </Box>
                <Text
                  fontSize="20px"
                  fontWeight="700"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {stats.matchesPlayed}
                </Text>
                <Text
                  fontSize="12px"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                  textAlign="center"
                >
                  {t("ProfilePage.stats.matchesPlayed")}
                </Text>
              </VStack>
            </Card>

            {/* Football */}
            <Card>
              <VStack gap={2} py={3}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="md"
                  bg="primary.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    color="primary.400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </Box>
                <Text
                  fontSize="20px"
                  fontWeight="700"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {stats.football}
                </Text>
                <Text
                  fontSize="12px"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                  textAlign="center"
                >
                  {t("ProfilePage.stats.football")}
                </Text>
              </VStack>
            </Card>

            {/* Volleyball */}
            <Card>
              <VStack gap={2} py={3}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="md"
                  bg="primary.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    color="primary.400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                </Box>
                <Text
                  fontSize="20px"
                  fontWeight="700"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {stats.volleyball}
                </Text>
                <Text
                  fontSize="12px"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                  textAlign="center"
                >
                  {t("ProfilePage.stats.volleyball")}
                </Text>
              </VStack>
            </Card>

            {/* Tennis */}
            <Card>
              <VStack gap={2} py={3}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="md"
                  bg="primary.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    color="primary.400"
                  >
                    <path d="M12 2v20M2 12h20" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Box>
                <Text
                  fontSize="20px"
                  fontWeight="700"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                >
                  {stats.tennis}
                </Text>
                <Text
                  fontSize="12px"
                  color="gray.900"
                  fontFamily="var(--font-inter), sans-serif"
                  textAlign="center"
                >
                  {t("ProfilePage.stats.tennis")}
                </Text>
              </VStack>
            </Card>
          </SimpleGrid>
        </VStack>

        {/* Account Section */}
        <VStack align="stretch" gap={4}>
          <Heading
            size="md"
            color="gray.900"
            fontFamily="var(--font-inter), sans-serif"
            fontWeight="700"
            fontSize="18px"
          >
            {t("ProfilePage.account")}
          </Heading>

          <VStack align="stretch" gap={0}>
            {/* Reset Password */}
            <Card
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              onClick={() => {
                // TODO: Implement reset password
                console.log("Reset password");
              }}
            >
              <HStack justify="space-between" py={3}>
                <HStack gap={3}>
                  <Box
                    w="24px"
                    h="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      color="gray.600"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </Box>
                  <Text
                    fontSize="16px"
                    color="gray.900"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    {t("ProfilePage.resetPassword")}
                  </Text>
                </HStack>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  color="gray.400"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </HStack>
            </Card>

            {/* FAQs & Help */}
            <Card
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              onClick={() => {
                // TODO: Implement FAQs & Help
                console.log("FAQs & Help");
              }}
            >
              <HStack justify="space-between" py={3}>
                <HStack gap={3}>
                  <Box
                    w="24px"
                    h="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      color="gray.600"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                  </Box>
                  <Text
                    fontSize="16px"
                    color="gray.900"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    {t("ProfilePage.faqsHelp")}
                  </Text>
                </HStack>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  color="gray.400"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </HStack>
            </Card>

            {/* Language */}
            <Card
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            >
              <VStack align="stretch" gap={0}>
                <HStack justify="space-between" py={3}>
                  <HStack gap={3}>
                    <Box
                      w="24px"
                      h="24px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        color="gray.600"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text
                        fontSize="16px"
                        color="gray.900"
                        fontFamily="var(--font-inter), sans-serif"
                      >
                        {t("ProfilePage.language")}
                      </Text>
                      <Text
                        fontSize="12px"
                        color="gray.500"
                      >
                        {LANGUAGES.find(l => l.code === currentLocale)?.label}
                      </Text>
                    </VStack>
                  </HStack>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    color="gray.400"
                    style={{
                      transform: isLanguageOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s"
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </HStack>

                {isLanguageOpen && (
                  <VStack
                    align="stretch"
                    gap={0}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    pt={2}
                  >
                    {LANGUAGES.map((lang) => (
                      <HStack
                        key={lang.code}
                        py={3}
                        px={2}
                        justify="space-between"
                        cursor="pointer"
                        _hover={{ bg: "gray.50" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLanguageChange(lang.code);
                        }}
                      >
                        <Text
                          fontSize="14px"
                          color={currentLocale === lang.code ? "green.600" : "gray.700"}
                          fontWeight={currentLocale === lang.code ? "600" : "400"}
                        >
                          {lang.label}
                        </Text>
                        {currentLocale === lang.code && (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            color="#16a34a" // green.600
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Card>
          </VStack>

          {/* Logout Button */}
          <SecondaryButton
            onClick={handleLogout}
            mt={4}
            w="full"
          >
            <HStack gap={2}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <Text fontSize="16px" fontWeight="600">
                {t("ProfilePage.logout")}
              </Text>
            </HStack>
          </SecondaryButton>
        </VStack>
      </Box>

      {/* Bottom Navigation */}
      <BottomNav items={navItems} />
    </Box>
  );
}
