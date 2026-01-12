import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import { canCreateGame } from "@/lib/utils/rbac";
import connectDB from "@/lib/mongodb/connect";
import Game from "@/lib/mongodb/models/Game";
import { z } from "zod";

// Validation schema for creating/updating games
const gameSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    country: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
  datetime: z.string().datetime(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  maxPlayers: z.number().min(1, "Max players must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.enum(["KZT", "USD", "EUR", "RUB"]).default("KZT"),
  skillLevel: z
    .enum(["beginner", "intermediate", "advanced", "all"])
    .default("all"),
  equipment: z
    .object({
      provided: z.array(z.string()).default([]),
      needed: z.array(z.string()).default([]),
    })
    .default({ provided: [], needed: [] }),
  rules: z.string().optional(),
  hostInfo: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  cancellationRule: z
    .enum(["anytime", "24hours", "48hours", "72hours", "no_refund", "custom"])
    .default("anytime"),
  isPublic: z.boolean().default(true),
  clubId: z.string().optional(),
});

// GET /api/games - List games with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("hostId");
    const isPublic = searchParams.get("isPublic");
    const status = searchParams.get("status") || "upcoming";
    const clubId = searchParams.get("clubId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query: Record<string, unknown> = {};

    if (hostId) {
      query.hostId = hostId;
    }

    if (isPublic !== null) {
      query.isPublic = isPublic === "true";
    }

    if (status) {
      query.status = status;
    }

    if (clubId) {
      query.clubId = clubId;
    }

    const games = await Game.find(query)
      .populate("hostId", "name email avatar")
      .populate("clubId", "name")
      .sort({ datetime: 1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return NextResponse.json(
      {
        success: true,
        games: games.map((game) => ({
          id: game._id.toString(),
          hostId: game.hostId,
          title: game.title,
          description: game.description,
          location: game.location,
          datetime: game.datetime instanceof Date 
            ? game.datetime.toISOString() 
            : game.datetime,
          duration: game.duration,
          maxPlayers: game.maxPlayers,
          currentPlayersCount: game.currentPlayersCount,
          price: game.price,
          currency: game.currency,
          skillLevel: game.skillLevel,
          equipment: game.equipment,
          rules: game.rules,
          hostInfo: game.hostInfo,
          cancellationPolicy: game.cancellationPolicy,
          cancellationRule: game.cancellationRule,
          isPublic: game.isPublic,
          clubId: game.clubId,
          status: game.status,
          createdAt: game.createdAt instanceof Date 
            ? game.createdAt.toISOString() 
            : game.createdAt,
          updatedAt: game.updatedAt instanceof Date 
            ? game.updatedAt.toISOString() 
            : game.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching games:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user can create games (host, admin, or club manager)
    const canCreate = await canCreateGame(user);
    if (!canCreate) {
      return NextResponse.json(
        { 
          error: "Forbidden", 
          message: "Only hosts, admins, and club managers can create games" 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = gameSchema.parse(body);

    await connectDB();

    const game = new Game({
      ...validatedData,
      hostId: user._id,
      datetime: new Date(validatedData.datetime),
      currentPlayersCount: 0,
    });

    await game.save();

    const populatedGame = await Game.findById(game._id)
      .populate("hostId", "name email avatar")
      .populate("clubId", "name")
      .lean();

    return NextResponse.json(
      {
        success: true,
        game: {
          id: populatedGame!._id.toString(),
          hostId: populatedGame!.hostId,
          title: populatedGame!.title,
          description: populatedGame!.description,
          location: populatedGame!.location,
          datetime: populatedGame!.datetime instanceof Date 
            ? populatedGame!.datetime.toISOString() 
            : populatedGame!.datetime,
          duration: populatedGame!.duration,
          maxPlayers: populatedGame!.maxPlayers,
          currentPlayersCount: populatedGame!.currentPlayersCount,
          price: populatedGame!.price,
          currency: populatedGame!.currency,
          skillLevel: populatedGame!.skillLevel,
          equipment: populatedGame!.equipment,
          rules: populatedGame!.rules,
          hostInfo: populatedGame!.hostInfo,
          cancellationPolicy: populatedGame!.cancellationPolicy,
          cancellationRule: populatedGame!.cancellationRule,
          isPublic: populatedGame!.isPublic,
          clubId: populatedGame!.clubId,
          status: populatedGame!.status,
          createdAt: populatedGame!.createdAt instanceof Date 
            ? populatedGame!.createdAt.toISOString() 
            : populatedGame!.createdAt,
          updatedAt: populatedGame!.updatedAt instanceof Date 
            ? populatedGame!.updatedAt.toISOString() 
            : populatedGame!.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating game:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const err = error as { message?: string };
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
