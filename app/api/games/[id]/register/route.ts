import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectMongoDB from "@/lib/mongodb/connect";
import Registration from "@/lib/mongodb/models/Registration";
import Game from "@/lib/mongodb/models/Game";

// POST /api/games/[id]/register - Register user for a game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectMongoDB();

    // Check if game exists
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Check if game is full
    if (game.currentPlayersCount >= game.maxPlayers) {
      return NextResponse.json(
        { error: "Game is full" },
        { status: 400 }
      );
    }

    // Check if game is still upcoming
    const now = new Date();
    if (new Date(game.datetime) < now) {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      gameId: game._id,
      playerId: user._id,
    });

    if (existingRegistration) {
      if (existingRegistration.status === "confirmed") {
        return NextResponse.json(
          { error: "You are already registered for this game" },
          { status: 400 }
        );
      }
      // If cancelled, reactivate it
      existingRegistration.status = "confirmed";
      existingRegistration.cancelledAt = undefined;
      await existingRegistration.save();
    } else {
      // Create new registration
      await Registration.create({
        gameId: game._id,
        playerId: user._id,
        status: "confirmed",
        paymentStatus: "pending", // TODO: Handle payment
      });
    }

    // Update game player count
    game.currentPlayersCount += 1;
    await game.save();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully registered for the game",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error registering for game:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
