/**
 * Design System Theme Configuration
 *
 * This theme is configured for the Alfa Games football management app.
 * Design tokens extracted from Figma designs.
 *
 * Figma Design Reference: PlayMatch Design System
 * - Primary Green: #4ade80 (vibrant medium green for buttons, active states, tags)
 * - Text Primary: #2D3748 (dark gray for headings and body text)
 * - Text Secondary: #A0AEC0 (light gray for secondary text, placeholders, inactive borders)
 * - Background: #FFFFFF (white)
 */

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    // Color Palette - Extracted from Figma designs
    tokens: {
      colors: {
        // Primary Brand Colors - Green palette (#3CB371 from design)
        primary: {
          50: { value: "#f0fdf4" },
          100: { value: "#dcfce7" },
          200: { value: "#bbf7d0" },
          300: { value: "#86efac" },
          400: { value: "#3CB371" }, // Main primary color from design
          500: { value: "#3CB371" }, // Main primary color (same as 400 for consistency)
          600: { value: "#2FA060" }, // Hover state
          700: { value: "#258F4F" }, // Active state
          800: { value: "#15803d" },
          900: { value: "#14532d" },
          950: { value: "#052e16" },
        },
        // Secondary Brand Colors - Blue palette
        secondary: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          200: { value: "#bfdbfe" },
          300: { value: "#93c5fd" },
          400: { value: "#60a5fa" },
          500: { value: "#3b82f6" }, // Main secondary color
          600: { value: "#2563eb" },
          700: { value: "#1d4ed8" },
          800: { value: "#1e40af" },
          900: { value: "#1e3a8a" },
          950: { value: "#172554" },
        },
        // Neutral Colors - Matching design tokens
        gray: {
          50: { value: "#f9fafb" },
          100: { value: "#f3f4f6" },
          200: { value: "#e5e7eb" },
          300: { value: "#d1d5db" },
          400: { value: "#9CA3AF" }, // Light gray from design (secondary text, placeholders)
          500: { value: "#718096" }, // Medium gray
          600: { value: "#4a5568" },
          700: { value: "#2D3748" }, // Dark gray
          800: { value: "#1a202c" },
          900: { value: "#111827" }, // Darkest gray from design (primary text)
          950: { value: "#0a0e1a" },
        },
        // Semantic Colors
        success: {
          50: { value: "#f0fdf4" },
          100: { value: "#dcfce7" },
          500: { value: "#22c55e" },
          600: { value: "#16a34a" },
          700: { value: "#15803d" },
        },
        error: {
          50: { value: "#fef2f2" },
          100: { value: "#fee2e2" },
          500: { value: "#ef4444" },
          600: { value: "#dc2626" },
          700: { value: "#b91c1c" },
        },
        warning: {
          50: { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          500: { value: "#f59e0b" },
          600: { value: "#d97706" },
          700: { value: "#b45309" },
        },
        info: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          500: { value: "#3b82f6" },
          600: { value: "#2563eb" },
          700: { value: "#1d4ed8" },
        },
        // Background colors
        background: {
          DEFAULT: { value: "#ffffff" },
          secondary: { value: "#f9fafb" },
          muted: { value: "#f3f4f6" },
        },
        // Text colors - Matching design tokens
        text: {
          primary: { value: "#111827" }, // Darkest gray from design
          secondary: { value: "#9CA3AF" }, // Light gray from design
          muted: { value: "#9CA3AF" }, // Same as secondary for consistency
          inverse: { value: "#ffffff" },
        },
      },
      // Typography
      fonts: {
        heading: {
          value:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        body: {
          value:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        mono: {
          value:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
        },
      },
      fontSizes: {
        xs: { value: "0.75rem" }, // 12px
        sm: { value: "0.875rem" }, // 14px
        md: { value: "1rem" }, // 16px
        lg: { value: "1.125rem" }, // 18px
        xl: { value: "1.25rem" }, // 20px
        "2xl": { value: "1.5rem" }, // 24px
        "3xl": { value: "1.875rem" }, // 30px
        "4xl": { value: "2.25rem" }, // 36px
        "5xl": { value: "3rem" }, // 48px
        "6xl": { value: "3.75rem" }, // 60px
      },
      fontWeights: {
        normal: { value: "400" },
        medium: { value: "500" },
        semibold: { value: "600" },
        bold: { value: "700" },
      },
      lineHeights: {
        none: { value: "1" },
        tight: { value: "1.25" },
        snug: { value: "1.375" },
        normal: { value: "1.5" },
        relaxed: { value: "1.625" },
        loose: { value: "2" },
      },
      // Spacing Scale (based on 4px base unit)
      spacing: {
        0: { value: "0" },
        1: { value: "0.25rem" }, // 4px
        2: { value: "0.5rem" }, // 8px
        3: { value: "0.75rem" }, // 12px
        4: { value: "1rem" }, // 16px
        5: { value: "1.25rem" }, // 20px
        6: { value: "1.5rem" }, // 24px
        8: { value: "2rem" }, // 32px
        10: { value: "2.5rem" }, // 40px
        12: { value: "3rem" }, // 48px
        16: { value: "4rem" }, // 64px
        20: { value: "5rem" }, // 80px
        24: { value: "6rem" }, // 96px
      },
      // Border Radius
      radii: {
        none: { value: "0" },
        sm: { value: "0.125rem" }, // 2px
        md: { value: "0.375rem" }, // 6px
        lg: { value: "0.5rem" }, // 8px
        xl: { value: "0.75rem" }, // 12px
        "2xl": { value: "1rem" }, // 16px
        "3xl": { value: "1.5rem" }, // 24px
        full: { value: "9999px" },
      },
      // Shadows
      shadows: {
        xs: { value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
        sm: {
          value:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
        md: {
          value:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
        lg: {
          value:
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        },
        xl: {
          value:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        },
        "2xl": { value: "0 25px 50px -12px rgb(0 0 0 / 0.25)" },
        inner: { value: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)" },
      },
      // Breakpoints (mobile-first)
      breakpoints: {
        sm: { value: "640px" },
        md: { value: "768px" },
        lg: { value: "1024px" },
        xl: { value: "1280px" },
        "2xl": { value: "1536px" },
      },
    },
    // Semantic Tokens - Context-aware design decisions
    semanticTokens: {
      colors: {
        // Primary semantic colors
        "bg.primary": { value: "{colors.background.DEFAULT}" },
        "bg.secondary": { value: "{colors.background.secondary}" },
        "bg.muted": { value: "{colors.background.muted}" },

        // Text semantic colors
        "text.primary": { value: "{colors.text.primary}" },
        "text.secondary": { value: "{colors.text.secondary}" },
        "text.muted": { value: "{colors.text.muted}" },
        "text.inverse": { value: "{colors.text.inverse}" },

        // Interactive elements - Using Figma primary green
        "interactive.primary": { value: "{colors.primary.400}" }, // #4ade80 from Figma
        "interactive.primary.hover": { value: "{colors.primary.600}" },
        "interactive.primary.active": { value: "{colors.primary.700}" },
        "interactive.secondary": { value: "{colors.secondary.500}" },
        "interactive.secondary.hover": { value: "{colors.secondary.600}" },

        // Status colors
        "status.success": { value: "{colors.success.500}" },
        "status.error": { value: "{colors.error.500}" },
        "status.warning": { value: "{colors.warning.500}" },
        "status.info": { value: "{colors.info.500}" },
      },
    },
  },
  // Global Styles
  globalCss: {
    body: {
      bg: "bg.primary",
      color: "text.primary",
      fontFamily: "body",
    },
  },
});

export const system = createSystem(defaultConfig, config);

/**
 * Design Tokens Reference
 *
 * This theme includes the following design tokens:
 *
 * Colors:
 * - Primary: Green palette (primary.50 to primary.950)
 * - Secondary: Blue palette (secondary.50 to secondary.950)
 * - Neutral: Gray palette (gray.50 to gray.950)
 * - Semantic: success, error, warning, info
 * - Background: background.DEFAULT, background.secondary, background.muted
 * - Text: text.primary, text.secondary, text.muted, text.inverse
 *
 * Typography:
 * - Fonts: heading, body, mono
 * - Font Sizes: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
 * - Font Weights: normal (400), medium (500), semibold (600), bold (700)
 * - Line Heights: none, tight, snug, normal, relaxed, loose
 *
 * Spacing:
 * - Base unit: 4px (0.25rem)
 * - Scale: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px),
 *   8 (32px), 10 (40px), 12 (48px), 16 (64px), 20 (80px), 24 (96px)
 *
 * Border Radius:
 * - none, sm (2px), md (6px), lg (8px), xl (12px), 2xl (16px), 3xl (24px), full
 *
 * Shadows:
 * - xs, sm, md, lg, xl, 2xl, inner
 *
 * Breakpoints (mobile-first):
 * - sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
 */
