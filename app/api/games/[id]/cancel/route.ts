import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectMongoDB from "@/lib/mongodb/connect";
import Registration from "@/lib/mongodb/models/Registration";
import Game from "@/lib/mongodb/models/Game";
import Transaction from "@/lib/mongodb/models/Transaction";
import {
  refundCreditsForCancellation,
  CreditsError,
} from "@/lib/utils/credits";

// POST /api/games/[id]/cancel - Cancel user's registration for a game
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

    // Find user's registration
    const registration = await Registration.findOne({
      gameId: game._id,
      playerId: user._id,
      status: "confirmed",
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You are not registered for this game" },
        { status: 400 }
      );
    }

    let refundTransactionId: string | null = null;
    if (game.price > 0 && registration.paymentStatus === "paid") {
      try {
        const currency = (game.currency || "KZT").toUpperCase();
        const refundResult = await refundCreditsForCancellation({
          userId: user._id,
          registrationId: registration._id,
          gameId: game._id,
          amount: game.price,
          currency,
        });

        refundTransactionId = refundResult.creditTransactionId;

        await Transaction.create({
          registrationId: registration._id,
          gameId: game._id,
          userId: user._id,
          provider: "credits",
          transactionId: refundTransactionId,
          amount: game.price,
          currency,
          status: "refunded",
        });

        registration.paymentStatus = "refunded";
      } catch (error: unknown) {
        if (error instanceof CreditsError) {
          return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.status }
          );
        }
        throw error;
      }
    }

    // Cancel the registration
    registration.status = "cancelled";
    registration.cancelledAt = new Date();
    await registration.save();

    // Update game player count
    if (game.currentPlayersCount > 0) {
      game.currentPlayersCount -= 1;
      await game.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully cancelled registration for the game",
        refundTransactionId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
