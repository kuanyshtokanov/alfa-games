import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import { canManageGame } from "@/lib/utils/rbac";
import connectDB from "@/lib/mongodb/connect";
import Game from "@/lib/mongodb/models/Game";
import Registration from "@/lib/mongodb/models/Registration";
import { z } from "zod";
import mongoose from "mongoose";

// Validation schema for updating games
const updateGameSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  location: z
    .object({
      address: z.string().min(1),
      city: z.string().optional(),
      country: z.string().optional(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
    })
    .optional(),
  datetime: z.string().datetime().optional(),
  duration: z.number().min(1).optional(),
  maxPlayers: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  currency: z.enum(["KZT", "USD", "EUR", "RUB"]).optional(),
  skillLevel: z
    .enum(["beginner", "intermediate", "advanced", "all"])
    .optional(),
  equipment: z
    .object({
      provided: z.array(z.string()),
      needed: z.array(z.string()),
    })
    .optional(),
  rules: z.string().optional(),
  hostInfo: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  cancellationRule: z
    .enum(["anytime", "24hours", "48hours", "72hours", "no_refund", "custom"])
    .optional(),
  isPublic: z.boolean().optional(),
  clubId: z.string().optional(),
  status: z.enum(["upcoming", "cancelled", "completed"]).optional(),
});

// GET /api/games/[id] - Get a single game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const game = await Game.findById(id)
      .populate("hostId", "name email avatar")
      .populate("clubId", "name")
      .lean();

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check if user is registered (optional - don't fail if not authenticated)
    let isRegistered = false;
    try {
      const user = await getAuthenticatedUser(request);
      if (user) {
        const registration = await Registration.findOne({
          gameId: game._id,
          playerId: user._id,
          status: "confirmed",
        }).lean();
        isRegistered = !!registration;
      }
    } catch {
      // User not authenticated, continue without registration status
    }

    return NextResponse.json(
      {
        success: true,
        game: {
          id: game._id.toString(),
          hostId: game.hostId,
          title: game.title,
          description: game.description,
          location: game.location,
          datetime:
            game.datetime instanceof Date
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
          isRegistered,
          createdAt:
            game.createdAt instanceof Date
              ? game.createdAt.toISOString()
              : game.createdAt,
          updatedAt:
            game.updatedAt instanceof Date
              ? game.updatedAt.toISOString()
              : game.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching game:", error);
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

// PATCH /api/games/[id] - Update a game
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check if user can manage this game (host, admin, or club manager)
    const canManage = await canManageGame(user, game);
    if (!canManage) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message:
            "You can only edit games you host or manage through your club",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateGameSchema.parse(body);

    // Convert datetime string to Date if provided
    if (validatedData.datetime) {
      validatedData.datetime = new Date(
        validatedData.datetime
      ) as unknown as string;
    }

    // Update game
    Object.assign(game, validatedData);
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
          datetime:
            populatedGame!.datetime instanceof Date
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
          createdAt:
            populatedGame!.createdAt instanceof Date
              ? populatedGame!.createdAt.toISOString()
              : populatedGame!.createdAt,
          updatedAt:
            populatedGame!.updatedAt instanceof Date
              ? populatedGame!.updatedAt.toISOString()
              : populatedGame!.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating game:", error);
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

// DELETE /api/games/[id] - Delete a game
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check if user can manage this game (host, admin, or club manager)
    const canManage = await canManageGame(user, game);
    if (!canManage) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message:
            "You can only delete games you host or manage through your club",
        },
        { status: 403 }
      );
    }

    await Game.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Game deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting game:", error);
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
