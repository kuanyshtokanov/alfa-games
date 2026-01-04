# Alfa Games - Football Game Management App

A Next.js 14+ fullstack application for managing and discovering football games, built with TypeScript, Chakra UI, Firebase Auth, MongoDB, and Stripe payments.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI**: Chakra UI
- **Authentication**: Firebase Auth
- **Database**: MongoDB with Mongoose
- **Payments**: Stripe
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or Atlas)
- Firebase project
- Stripe account

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory and add the following environment variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side token verification)
# Option 1: As environment variable (JSON string)
# Get this from Firebase Console > Project Settings > Service Accounts > Generate New Private Key
# Copy the entire JSON content as a single-line string (or use a JSON minifier)
# FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...",...}

# Option 2: As a file (recommended for development)
# Create a file named .env.service-key in the root directory
# Copy the entire JSON content from the downloaded service account key file
# The file will be automatically read and used for authentication

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
alfa-games/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── providers/         # Context providers
│   ├── ui/               # Reusable UI components
│   ├── games/            # Game-related components
│   ├── clubs/            # Club-related components
│   └── payments/         # Payment components
├── lib/                   # Utilities & configurations
│   ├── firebase/         # Firebase config & auth helpers
│   ├── mongodb/          # MongoDB connection & models
│   ├── stripe/           # Stripe configuration
│   └── utils/            # Helper functions
├── types/                 # TypeScript type definitions
├── public/               # Static assets & PWA files
└── middleware.ts         # Auth middleware
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Documentation](https://chakra-ui.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
