import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectMongoDB from "@/lib/mongodb/connect";
import Registration from "@/lib/mongodb/models/Registration";
import Game from "@/lib/mongodb/models/Game";

// GET /api/games/my-registrations - Get games user has registered for
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "upcoming"; // "upcoming" or "past"

    // Get all confirmed registrations for this user
    const registrations = await Registration.find({
      playerId: user._id,
      status: "confirmed",
    });

    // Get game IDs from registrations
    const gameIds = registrations.map((reg) => reg.gameId);

    // Get all games
    const games = await Game.find({
      _id: { $in: gameIds },
    }).sort({ datetime: 1 });

    const now = new Date();

    // Filter by upcoming/past
    let filteredGames = games;
    if (filter === "upcoming") {
      filteredGames = games.filter((game) => new Date(game.datetime) >= now);
    } else if (filter === "past") {
      filteredGames = games.filter((game) => new Date(game.datetime) < now);
    }

    // Map games with registration info
    const gamesWithRegistration = filteredGames.map((game) => {
      const registration = registrations.find(
        (reg) => reg.gameId.toString() === game._id.toString()
      );

      return {
        id: game._id.toString(),
        title: game.title,
        description: game.description,
        location: game.location,
        datetime: game.datetime.toISOString(),
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
        status: game.status,
        createdAt: game.createdAt.toISOString(),
        updatedAt: game.updatedAt.toISOString(),
        registrationStatus: registration?.status || "confirmed",
        registeredAt: registration?.registeredAt?.toISOString(),
      };
    });

    return NextResponse.json(
      {
        success: true,
        games: gamesWithRegistration,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error getting user registrations:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
