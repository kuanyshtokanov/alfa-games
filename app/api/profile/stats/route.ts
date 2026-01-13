import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectMongoDB from "@/lib/mongodb/connect";
import Registration from "@/lib/mongodb/models/Registration";
import Game from "@/lib/mongodb/models/Game";

// Helper function to detect sport type from game data
function detectSportType(title: string, description: string = ""): string | null {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  if (combined.includes("football") || combined.includes("soccer")) {
    return "football";
  }
  if (combined.includes("volleyball")) {
    return "volleyball";
  }
  if (combined.includes("tennis")) {
    return "tennis";
  }
  return null;
}

// GET /api/profile/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    // Get all confirmed registrations for this user
    const registrations = await Registration.find({
      playerId: user._id,
      status: "confirmed",
    });

    // Get game IDs from registrations
    const gameIds = registrations.map((reg) => reg.gameId);

    // Get all games to analyze sport types
    const games = await Game.find({
      _id: { $in: gameIds },
    });

    // Count total matches played
    const matchesPlayed = registrations.length;

    // Count by sport type
    const sportCounts: Record<string, number> = {
      football: 0,
      volleyball: 0,
      tennis: 0,
    };
    
    games.forEach((game) => {
      const sportType = detectSportType(game.title, game.description);
      if (sportType && sportCounts.hasOwnProperty(sportType)) {
        sportCounts[sportType] = (sportCounts[sportType] || 0) + 1;
      }
    });

    return NextResponse.json(
      {
        success: true,
        stats: {
          matchesPlayed,
          football: sportCounts["football"] || 0,
          volleyball: sportCounts["volleyball"] || 0,
          tennis: sportCounts["tennis"] || 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error getting user stats:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
