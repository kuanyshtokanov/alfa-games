import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectMongoDB from "@/lib/mongodb/connect";
import Registration from "@/lib/mongodb/models/Registration";
import Game from "@/lib/mongodb/models/Game";
import Transaction from "@/lib/mongodb/models/Transaction";

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

    let body: {
      reservationId?: string;
      transactionId?: string;
      provider?: string;
      widgetConfirmed?: boolean;
    } | null = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    // Check if game exists
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
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
    }

    const requiresReservation = game.price > 0;
    const reservationId = body?.reservationId;
    const transactionId = body?.transactionId;
    const provider = body?.provider?.trim() || "tiptop-pay";
    const widgetConfirmed = body?.widgetConfirmed === true;
    const reservationExpired =
      existingRegistration?.status === "pending" &&
      existingRegistration.expiresAt &&
      existingRegistration.expiresAt <= now;

    if (requiresReservation) {
      if (!existingRegistration || existingRegistration.status !== "pending") {
        return NextResponse.json(
          { error: "Please reserve your spot before paying" },
          { status: 400 }
        );
      }

      if (reservationExpired) {
        return NextResponse.json(
          {
            error: "Reservation expired. Please reserve again.",
            code: "RESERVATION_EXPIRED",
          },
          { status: 409 }
        );
      }

      if (
        reservationId &&
        existingRegistration._id.toString() !== reservationId
      ) {
        return NextResponse.json(
          {
            error: "Reservation mismatch. Please try again.",
            code: "RESERVATION_MISMATCH",
          },
          { status: 400 }
        );
      }

      if (!transactionId && !widgetConfirmed) {
        return NextResponse.json(
          { error: "Missing payment confirmation.", code: "MISSING_PAYMENT" },
          { status: 400 }
        );
      }
    } else {
      const pendingCount = await Registration.countDocuments({
        gameId: game._id,
        status: "pending",
        expiresAt: { $gt: now },
      });
      const confirmedCount = await Registration.countDocuments({
        gameId: game._id,
        status: "confirmed",
      });
      const reservedCount = pendingCount + confirmedCount;
      const hasActiveReservation =
        existingRegistration?.status === "pending" && !reservationExpired;

      if (!hasActiveReservation && reservedCount >= game.maxPlayers) {
        return NextResponse.json(
          { error: "Game is full", code: "GAME_FULL" },
          { status: 400 }
        );
      }
    }

    const paymentStatus = game.price > 0 ? "paid" : "pending";
    const currency = (game.currency || "KZT").toUpperCase();

    const effectiveTransactionId =
      transactionId ??
      (widgetConfirmed && existingRegistration
        ? `widget-confirmed:${existingRegistration._id.toString()}`
        : null);

    if (game.price > 0 && effectiveTransactionId && existingRegistration) {
      try {
        await Transaction.create({
          registrationId: existingRegistration._id,
          gameId: game._id,
          userId: user._id,
          provider,
          transactionId: effectiveTransactionId,
          amount: game.price,
          currency,
          status: "paid",
        });
      } catch (error: any) {
        if (error?.code === 11000) {
          const existingTransaction = await Transaction.findOne({
            provider,
            transactionId: effectiveTransactionId,
          });
          if (
            existingTransaction &&
            existingTransaction.registrationId.toString() !==
              existingRegistration._id.toString()
          ) {
            return NextResponse.json(
              {
                error: "Payment already used for another reservation.",
                code: "TRANSACTION_CONFLICT",
              },
              { status: 409 }
            );
          }
        } else {
          throw error;
        }
      }
    }

    if (existingRegistration) {
      existingRegistration.status = "confirmed";
      existingRegistration.cancelledAt = undefined;
      existingRegistration.expiresAt = undefined;
      existingRegistration.paymentStatus = paymentStatus;
      await existingRegistration.save();
    } else {
      // Create new registration
      await Registration.create({
        gameId: game._id,
        playerId: user._id,
        status: "confirmed",
        paymentStatus,
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
