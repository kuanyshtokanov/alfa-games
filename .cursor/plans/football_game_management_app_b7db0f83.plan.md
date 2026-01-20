---
name: Football Game Management App
overview: Build a Next.js fullstack TypeScript PWA for football game management with Firebase auth, MongoDB database, credits-based system for MVP, and Chakra UI for mobile-first design. The app will support game creation/management for hosts, player registration with credits, club/team management, and game discovery. Payment gateway integration (Stripe or similar) will be added post-MVP.
todos:
  - id: setup-project
    content: Initialize Next.js project with TypeScript, install dependencies (mongoose, firebase, @chakra-ui/react, @next/pwa), and configure basic project structure
    status: completed
  - id: setup-firebase
    content: Configure Firebase Auth with email/password and social login, create auth context provider, and implement login/signup pages
    status: completed
    dependencies:
      - setup-project
  - id: setup-mongodb
    content: Set up MongoDB connection and create Mongoose models for User, Game, Club, Registration, and Payment
    status: completed
    dependencies:
      - setup-project
  - id: review-figma-designs
    content: Review ALL Figma designs, extract design tokens (colors, typography, spacing), configure Chakra UI theme to match designs, and create reusable UI components
    status: completed
    dependencies:
      - setup-project
  - id: implement-game-crud
    content: "Create game management features: create game page, my games list, game detail/edit page, and API routes for CRUD operations"
    status: completed
    dependencies:
      - setup-firebase
      - setup-mongodb
      - review-figma-designs
  - id: implement-game-discovery
    content: Build game discovery page with filters, search, and game detail view for players to browse available games
    status: pending
    dependencies:
      - implement-game-crud
  - id: implement-credits-system
    content: ""
    status: pending
    dependencies:
      - setup-mongodb
      - implement-game-crud
  - id: implement-registration-credits
    content: Create game registration flow with credits system (check balance, deduct credits on registration), and registration management (my registrations page)
    status: pending
    dependencies:
      - implement-game-discovery
      - implement-credits-system
  - id: implement-credits-ui
    content: Implement credits UI components (balance display, transaction history) using the design system from Phase 1.5
    status: pending
    dependencies:
      - review-figma-designs
      - implement-credits-system
  - id: implement-profile
    content: Create user profile page with edit functionality, game history, and settings
    status: pending
    dependencies:
      - setup-firebase
      - setup-mongodb
      - review-figma-designs
  - id: configure-pwa
    content: Set up PWA manifest, service worker, install prompt, and optimize for mobile performance
    status: pending
    dependencies:
      - setup-project
  - id: implement-clubs
    content: "Build club management: create clubs (admin-only), invite members, view club games, and club detail pages"
    status: pending
    dependencies:
      - setup-mongodb
      - setup-firebase
      - review-figma-designs
  - id: payment-gateway-integration
    content: Integrate payment gateway (Stripe or similar) for purchasing credits, replace credits-only system with real payments
    status: pending
    dependencies:
      - implement-credits-system
---

# Football Game Management App - Implementation Plan

## Architecture Overview

The app will be a Next.js 14+ fullstack application with:

- **Frontend**: Next.js App Router, TypeScript, Chakra UI (mobile-first PWA)
- **Backend**: Next.js API routes, MongoDB with Mongoose
- **Authentication**: Firebase Auth (email/password, social login)
- **Payments**: Credits-based system for MVP (payment gateway integration post-MVP)
- **Database**: MongoDB (users, games, clubs, registrations, credit transactions)

## Project Structure

```javascript
alfa-games/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected routes
│   │   ├── games/         # Game management
│   │   ├── clubs/         # Club management
│   │   └── profile/       # User profile
│   ├── api/               # API routes
│   │   ├── games/         # Game CRUD operations
│   │   ├── clubs/         # Club operations
│   │   ├── credits/       # Credits management endpoints
│   │   └── registrations/ # Game registration endpoints
│   └── layout.tsx         # Root layout with PWA config
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── games/            # Game-related components
│   ├── clubs/            # Club-related components
│   └── payments/         # Payment components
├── lib/                   # Utilities & configurations
│   ├── firebase/         # Firebase config & auth helpers
│   ├── mongodb/          # MongoDB connection & models
│   ├── credits/          # Credits utilities
│   └── utils/            # Helper functions
├── types/                 # TypeScript type definitions
├── public/               # Static assets & PWA files
│   ├── manifest.json     # PWA manifest
│   └── icons/            # App icons
└── middleware.ts         # Auth middleware

```

## Database Schema (MongoDB Models)

### User Model (`lib/mongodb/models/User.ts`)

- `_id`, `firebaseUID`, `email`, `name`, `phone`, `avatar`, `role` (player/host/admin), `creditsBalance` (number, default 0), `createdAt`, `updatedAt`

### Game Model (`lib/mongodb/models/Game.ts`)

- `_id`, `hostId` (ref User), `title`, `description`, `location` (address, coordinates), `datetime`, `duration` (minutes), `maxPlayers`, `currentPlayers`, `price`, `skillLevel`, `equipment` (provided/needed), `rules`, `hostInfo`, `cancellationPolicy`, `isPublic`, `clubId` (optional ref Club), `status` (upcoming/cancelled/completed), `createdAt`, `updatedAt`

### Club Model (`lib/mongodb/models/Club.ts`)

- `_id`, `name`, `description`, `adminIds` (ref User[]), `memberIds` (ref User[]), `isPublic`, `createdAt`, `updatedAt`

### Registration Model (`lib/mongodb/models/Registration.ts`)

- `_id`, `gameId` (ref Game), `playerId` (ref User), `creditsUsed` (number), `status` (confirmed/cancelled), `registeredAt`, `cancelledAt`

### CreditTransaction Model (`lib/mongodb/models/CreditTransaction.ts`)

- `_id`, `userId` (ref User), `type` (deduction/addition/refund), `amount`, `reason` (game_registration, game_cancellation, admin_adjustment, etc.), `relatedRegistrationId` (optional ref Registration), `createdAt`

## Implementation Steps

### Phase 1: Project Setup & Configuration (MVP Foundation)

1. Initialize Next.js 14+ project with TypeScript
2. Install dependencies: `mongoose`, `firebase`, `@chakra-ui/react`, `@emotion/react`, `@emotion/styled`, `framer-motion`, `@next/pwa`, `zod` (validation)
3. Set up MongoDB connection (`lib/mongodb/connect.ts`)
4. Configure Firebase Auth (create Firebase project, add config)
5. Set up environment variables template (`.env.example`)
6. Basic PWA manifest (minimal setup for now)

### Phase 1.5: Figma Design Review & Theme Setup (Early Design Foundation)

1. **Review ALL Figma designs** - Access Figma link and review complete design system
2. **Extract Design Tokens**:

- Colors (primary, secondary, background, text, etc.)
- Typography (font families, sizes, weights)
- Spacing scale
- Border radius, shadows, etc.
- Component patterns (buttons, cards, forms, navigation)

3. **Configure Chakra UI Theme** (`components/providers/ChakraProvider.tsx`):

- Create custom theme matching Figma design tokens
- Set up color palette from designs
- Configure typography from designs
- Set up spacing scale
- Create custom component variants (buttons, cards, etc.)

4. **Create Reusable UI Components** (based on Figma):

- Button variants
- Card components
- Form inputs
- Navigation components (bottom nav for mobile)
- Layout components

5. **Document Design System** - Create reference file for design tokens and component usage

*This phase ensures we build with the correct design system from the start, making all subsequent phases faster and more consistent.*

### Phase 2: Authentication System & UI Implementation

1. Create Firebase configuration (`lib/firebase/config.ts`)
2. Implement auth context/provider (`components/providers/AuthProvider.tsx`)
3. **Implement Auth Pages** (using design system from Phase 1.5):

- Login page (`app/(auth)/login/page.tsx`) - match Figma designs
- Signup page (`app/(auth)/signup/page.tsx`) - match Figma designs
- Use pre-configured Chakra UI theme and components

4. Implement auth middleware (`middleware.ts`) to protect routes
5. Create user sync: on Firebase auth, create/update MongoDB user document
6. Add logout functionality

### Phase 3: Database Models & API Foundation

1. Create Mongoose models for User (with creditsBalance), Game, Club, Registration, CreditTransaction (MVP: focus on User, Game, Registration, and CreditTransaction first)
2. Set up MongoDB connection utility with error handling
3. Create API route structure with authentication middleware
4. Implement error handling utilities

### Phase 4: Game Management (Host Features) - MVP with Design Implementation

1. **Review Figma designs for game management pages**
2. **Create Game Page** (`app/(dashboard)/games/create/page.tsx`)

- Implement UI with Chakra UI components matching Figma designs
- Form with: title, description, location, datetime, duration, maxPlayers, price, skillLevel, equipment, rules, hostInfo, cancellationPolicy, visibility (public/club)
- Validation using Zod
- API endpoint: `POST /api/games`

2. **My Games Page** (`app/(dashboard)/games/my-games/page.tsx`)

- Reference Figma designs for games list
- Implement UI using design system components
- List of games created by user (upcoming/past)
- Actions: edit, cancel, view registrations
- API endpoint: `GET /api/games?hostId=...`

3. **Game Detail/Edit** (`app/(dashboard)/games/[id]/page.tsx`)

- Reference Figma designs for game detail view
- Implement UI using design system components
- View game details
- Edit form (host only)
- View registered players list
- API endpoints: `GET /api/games/[id]`, `PATCH /api/games/[id]`, `DELETE /api/games/[id]`

### Phase 5: Game Discovery & Registration (Player Features) - MVP with Design Implementation

1. **Discover Games Page** (`app/(dashboard)/games/discover/page.tsx`)

- Reference Figma designs for discovery page
- Implement UI using design system components
- Filterable list: public games, date range, location, skill level (MVP: basic filters)
- Search functionality
- API endpoint: `GET /api/games?isPublic=true&status=upcoming`

2. **Game Registration Flow**

- Game detail page with registration button (reference Figma designs)
- Implement UI using design system components
- Check availability (maxPlayers not reached)
- Check user credits balance (must have enough credits)
- Deduct credits and create Registration record
- Create CreditTransaction record for audit trail
- API endpoints: `POST /api/registrations` (handles credit deduction)

3. **My Registrations Page** (`app/(dashboard)/games/my-registrations/page.tsx`)

- Reference Figma designs for registrations page
- Implement UI using design system components
- Upcoming games (with cancel option - refunds credits)
- Past games
- Credits used display

### Phase 6: Credits System Implementation - MVP

1. **Credits Management UI** (reference Figma designs for profile/credits sections)

- Add credits balance display to user profile (using design system components)
- Create credits API endpoints: `GET /api/credits/balance`, `GET /api/credits/transactions`
- Admin endpoint to add credits (for testing/initial setup): `POST /api/credits/add` (admin only)
- Credits transaction history component (using design system)

2. **Registration with Credits**

- Update registration API to check credits balance
- Deduct credits on successful registration
- Create CreditTransaction record
- Handle insufficient credits error

3. **Cancellation & Refunds**

- Refund credits when player cancels registration
- Refund credits when host cancels game
- Create refund CreditTransaction records

4. **Credits UI Components** (using design system from Phase 1.5)

- Credits balance display component
- Transaction history component
- Insufficient credits warning/error messages
- All components styled to match Figma designs

### Phase 6b: Payment Gateway Integration (Post-MVP) - TODO

1. **Choose Payment Gateway** (Stripe, PayPal, etc.)
2. **Install Payment SDK** and create configuration
3. **Create Payment API** for purchasing credits

- Payment Intent/Checkout creation
- Webhook handler for payment confirmation
- Credit addition on successful payment

4. **Payment UI Components**

- Credit purchase flow
- Payment form integration
- Payment history

5. **Migration Strategy**

- Keep credits system, add payment gateway as credit purchase method
- Users can still use admin-added credits or purchase credits via payment gateway

### Phase 7: Club/Team Management (Post-MVP)

1. **Create Club** (admin-only)

- Form: name, description, visibility
- API endpoint: `POST /api/clubs`
- Assign creator as admin

2. **Club Management**

- Club list page (`app/(dashboard)/clubs/page.tsx`)
- Club detail page with members list
- Invite members (admin-only): search users, send invites
- Remove members (admin-only)
- API endpoints: `GET /api/clubs`, `GET /api/clubs/[id]`, `POST /api/clubs/[id]/invite`, `DELETE /api/clubs/[id]/members/[userId]`

3. **Club Games**

- Games filtered by club membership
- Create games within club context

*Note: Club features can be implemented after MVP core features are complete*

### Phase 8: User Profile & Settings - MVP

1. **Profile page** (`app/(dashboard)/profile/page.tsx`)

- Reference Figma designs for profile page
- Implement UI using design system components
- View/edit: name, phone, avatar
- Game history stats (MVP: basic list)
- Credits balance display and transaction history
- Credit purchase (payment gateway integration - post-MVP)

3. Settings page for notifications, preferences (post-MVP)

### Phase 9: PWA Configuration & Polish

1. Complete `manifest.json` with app metadata, icons, theme colors (from Figma designs)
2. Configure service worker for offline support
3. Add install prompt
4. Optimize for mobile performance (image optimization, lazy loading)
5. Add loading states, error boundaries throughout app (using design system)
6. Implement navigation (bottom nav for mobile - reference Figma design)
7. Final design polish and consistency check against Figma

## MVP Deployment Milestone

**After Phase 6 (Credits System)**, you will have a fully functional, deployable MVP:

- ✅ Complete authentication system
- ✅ Game creation and management (host features)
- ✅ Game discovery and registration (player features)
- ✅ Credits-based payment system
- ✅ User profiles with credits management
- ✅ All UI implemented matching Figma designs
- ✅ Mobile-first PWA ready for deployment

**Payment gateway integration (Phase 6b)** can be added later without disrupting the core MVP functionality.

## Key Files to Create

- `lib/mongodb/models/User.ts` - User schema (with creditsBalance)
- `lib/mongodb/models/Game.ts` - Game schema
- `lib/mongodb/models/Club.ts` - Club schema
- `lib/mongodb/models/Registration.ts` - Registration schema (with creditsUsed)
- `lib/mongodb/models/CreditTransaction.ts` - Credit transaction schema
- `lib/firebase/config.ts` - Firebase configuration
- `lib/credits/utils.ts` - Credits utility functions
- `app/api/games/route.ts` - Game CRUD API
- `app/api/registrations/route.ts` - Registration API (with credit deduction)
- `app/api/credits/balance/route.ts` - Get user credits balance
- `app/api/credits/transactions/route.ts` - Get credit transaction history
- `app/api/credits/add/route.ts` - Admin endpoint to add credits (for testing)
- `components/providers/AuthProvider.tsx` - Auth context
- `components/providers/ChakraProvider.tsx` - Chakra UI provider with custom theme
- `lib/theme/theme.ts` - Chakra UI theme configuration (colors, typography, spacing from Figma)
- `components/ui/` - Reusable UI components (buttons, cards, forms, etc. matching Figma)
- `middleware.ts` - Route protection

## Environment Variables Needed

```javascript
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
MONGODB_URI=
NEXT_PUBLIC_APP_URL=

# Payment Gateway (Post-MVP - TODO)
# STRIPE_SECRET_KEY=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# STRIPE_WEBHOOK_SECRET=
```

## MVP Focus & Design-Driven Development

The plan prioritizes MVP features and integrates design implementation from the very start:

- **Phase 1**: Basic project setup
- **Phase 1.5**: **Figma design review & theme setup** - Review ALL designs early, extract design tokens, configure Chakra UI theme
- **Phase 2**: Auth with design implementation (using design system)
- **Phase 3**: Database models
- **Phase 4-5**: Core game features with design implementation (using design system)
- **Phase 6**: Credits system implementation (MVP) - **DEPLOYABLE MVP AFTER THIS PHASE**
- **Phase 6b**: Payment gateway integration (Post-MVP - TODO)
- **Phase 7**: Clubs (post-MVP, can be added later)
- **Phase 8-9**: Profile and PWA polish

This approach allows us to:

1. **Review ALL Figma designs early** (Phase 1.5) - Extract design tokens, set up theme, create reusable components
2. **Build with design system from the start** - Every feature uses the pre-configured design system
3. **Faster development** - No need to review designs per feature, just reference the design system
4. **Deployable MVP after Phase 6** - Complete app with credits system, ready for deployment
5. **Use credits system for MVP** - Simpler, no payment gateway setup needed initially
6. **Add payment gateway later** - Without disrupting core functionality
7. **Add advanced features post-MVP** - Clubs, advanced settings, etc.

## Credits System (MVP)

The MVP will use a credits-based system:

- Users have a `creditsBalance` in their profile
- Games have a `price` (in credits)