# Design System Tokens

This document outlines the design tokens extracted from the Figma designs for the Alfa Games (PlayMatch) application.

## Source
- **Figma Design**: PlayMatch Design System
- **Figma Link**: https://www.figma.com/design/MRxcTEyHPkfetSuXCHS2Ly/PlayMatch--Copy-?node-id=0-1&t=KJD4qcz1l9U2VMGe-1

## Colors

### Primary Color
- **Primary Green**: `#4ade80`
  - Used for: Primary buttons, active states, status tags, active filter buttons
  - Semantic meaning: Main brand color, action color, success states

### Text Colors
- **Primary Text**: `#2D3748`
  - Used for: Headings, main body text, icons
- **Secondary Text**: `#A0AEC0`
  - Used for: Secondary text, placeholder text, inactive borders, subtle backgrounds

### Background Colors
- **Primary Background**: `#FFFFFF` (White)
  - Used for: Main page backgrounds, card backgrounds
- **Secondary Background**: `#F9FAFB` (Light gray)
  - Used for: Alternative backgrounds, subtle sections

## Typography

### Font Family
- **Primary**: System font stack (system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)
- **Body**: Same as primary
- **Mono**: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace

### Font Sizes
- **xs**: 12px (0.75rem) - Small text, labels
- **sm**: 14px (0.875rem) - Secondary text, small labels
- **md**: 16px (1rem) - Body text (default)
- **lg**: 18px (1.125rem) - Large body text
- **xl**: 20px (1.25rem) - Subheadings
- **2xl**: 24px (1.5rem) - Section headings
- **3xl**: 30px (1.875rem) - Page headings
- **4xl**: 36px (2.25rem) - Large page headings
- **5xl**: 48px (3rem) - Hero headings
- **6xl**: 60px (3.75rem) - Extra large headings

### Font Weights
- **Normal**: 400 - Body text
- **Medium**: 500 - Emphasized text, labels
- **Semibold**: 600 - Subheadings, button text
- **Bold**: 700 - Headings, important text

### Line Heights
- **None**: 1
- **Tight**: 1.25 - Headings
- **Snug**: 1.375
- **Normal**: 1.5 - Body text (default)
- **Relaxed**: 1.625
- **Loose**: 2 - Spacious text

## Spacing

Based on 4px base unit:
- **0**: 0px
- **1**: 4px (0.25rem)
- **2**: 8px (0.5rem)
- **3**: 12px (0.75rem)
- **4**: 16px (1rem)
- **5**: 20px (1.25rem)
- **6**: 24px (1.5rem)
- **8**: 32px (2rem)
- **10**: 40px (2.5rem)
- **12**: 48px (3rem)
- **16**: 64px (4rem)
- **20**: 80px (5rem)
- **24**: 96px (6rem)

## Border Radius

- **none**: 0
- **sm**: 2px (0.125rem)
- **md**: 6px (0.375rem) - Buttons, input fields
- **lg**: 8px (0.5rem) - Cards
- **xl**: 12px (0.75rem)
- **2xl**: 16px (1rem)
- **3xl**: 24px (1.5rem)
- **full**: 9999px (50%) - Circular avatars, pills

## Shadows

- **xs**: Minimal shadow (0 1px 2px 0 rgb(0 0 0 / 0.05))
- **sm**: Small shadow (0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1))
- **md**: Medium shadow (0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1))
- **lg**: Large shadow (0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))
- **xl**: Extra large shadow (0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1))
- **2xl**: 2X large shadow (0 25px 50px -12px rgb(0 0 0 / 0.25))
- **inner**: Inset shadow (inset 0 2px 4px 0 rgb(0 0 0 / 0.05))

## Breakpoints (Mobile-First)

- **sm**: 640px - Small tablets
- **md**: 768px - Tablets
- **lg**: 1024px - Small desktops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Large desktops

## Component Patterns

### Buttons
- **Primary Button**: Green solid (`#4ade80`), white text, rounded corners (md)
- **Secondary Button**: White background, gray border, rounded corners (md)
- **Social Button**: Outlined style, full width, with icon support

### Input Fields
- **Text Input**: Light gray border (`#A0AEC0`), rounded corners (md), white background
- **Search Input**: Same as text input with search icon on the left

### Cards
- **Event Card**: White background, rounded corners (lg), subtle shadow (sm), border
- **Detail Card**: Similar to event card, used for displaying detailed information

### Navigation
- **Bottom Navigation**: Fixed at bottom, white background, border top, icons + labels
- **Active Item**: Green color (`#4ade80`)
- **Inactive Item**: Gray color (`#A0AEC0`)

### Status Tags
- **Joined/Completed Tags**: Green background (`#4ade80`), white text, rounded corners (md)

### Filter Buttons
- **Active**: Green background (`#4ade80`), white text
- **Inactive**: White background, gray border

### Avatars
- **Shape**: Circular (full border radius)
- **Sizes**: sm (32px), md (48px), lg (64px), xl (96px)
- **Fallback**: Gray background with initials

## Usage

All design tokens are configured in `lib/theme/theme.ts` and can be used throughout the application via Chakra UI's theme system.

Example usage:
```tsx
// Using theme tokens
<Box color="text.primary" bg="white" p={4}>
  <Heading color="primary.400">Title</Heading>
</Box>

// Using reusable components
import { PrimaryButton, EventCard, FilterButton } from '@/components/ui';
```

## Notes

- The design system follows a mobile-first approach
- All measurements use a 4px base unit for consistency
- Colors are designed for accessibility and readability
- Components are designed to be reusable and consistent across the application

