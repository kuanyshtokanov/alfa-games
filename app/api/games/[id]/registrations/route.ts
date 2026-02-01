import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectMongoDB from "@/lib/mongodb/connect";
import Registration from "@/lib/mongodb/models/Registration";
import Game from "@/lib/mongodb/models/Game";

// GET /api/games/[id]/registrations - Get all players registered for a game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const now = new Date();
    // Get all confirmed + active pending registrations for this game
    const registrations = await Registration.find({
      gameId: game._id,
      $or: [
        { status: "confirmed" },
        { status: "pending", expiresAt: { $gt: now } },
      ],
    })
      .populate("playerId", "name email avatar")
      .lean();

    // Map registrations to player data
    const players = registrations.map((reg) => {
      const player = reg.playerId as any;
      return {
        id: player._id.toString(),
        name: player.name || "Unknown",
        email: player.email || "",
        avatar: player.avatar || undefined,
        status: reg.status,
        expiresAt: reg.expiresAt ? new Date(reg.expiresAt).toISOString() : null,
      };
    });
    const confirmedCount = registrations.filter(
      (reg) => reg.status === "confirmed"
    ).length;
    const pendingCount = registrations.filter(
      (reg) => reg.status === "pending"
    ).length;
    const reservedCount = confirmedCount + pendingCount;
    const spotsLeft = Math.max(game.maxPlayers - reservedCount, 0);

    return NextResponse.json(
      {
        success: true,
        players,
        totalPlayers: reservedCount,
        confirmedCount,
        pendingCount,
        maxPlayers: game.maxPlayers,
        spotsLeft,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error getting game registrations:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
