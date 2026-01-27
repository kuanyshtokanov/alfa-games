import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectMongoDB from "@/lib/mongodb/connect";
import Registration from "@/lib/mongodb/models/Registration";
import Game from "@/lib/mongodb/models/Game";

// Reservation TTL in milliseconds (5 minutes)
const RESERVATION_TTL_MS = 5 * 60 * 1000;

// POST /api/games/[id]/reserve - Reserve a spot before payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectMongoDB();

    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const now = new Date();
    if (new Date(game.datetime) < now) {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 400 },
      );
    }

    const existingRegistration = await Registration.findOne({
      gameId: game._id,
      playerId: user._id,
    });

    if (existingRegistration) {
      if (existingRegistration.status === "confirmed") {
        return NextResponse.json(
          { error: "You are already registered for this game" },
          { status: 400 },
        );
      }

      if (
        existingRegistration.status === "pending" &&
        existingRegistration.expiresAt &&
        existingRegistration.expiresAt > now
      ) {
        return NextResponse.json(
          {
            success: true,
            reservationId: existingRegistration._id.toString(),
            expiresAt: existingRegistration.expiresAt.toISOString(),
          },
          { status: 200 },
        );
      }
    }

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

    if (reservedCount >= game.maxPlayers) {
      return NextResponse.json({ error: "Game is full" }, { status: 400 });
    }

    const expiresAt = new Date(now.getTime() + RESERVATION_TTL_MS);

    if (existingRegistration) {
      existingRegistration.status = "pending";
      existingRegistration.cancelledAt = undefined;
      existingRegistration.expiresAt = expiresAt;
      existingRegistration.paymentStatus = "pending";
      await existingRegistration.save();
      return NextResponse.json(
        {
          success: true,
          reservationId: existingRegistration._id.toString(),
          expiresAt: expiresAt.toISOString(),
        },
        { status: 200 },
      );
    }

    const registration = await Registration.create({
      gameId: game._id,
      playerId: user._id,
      status: "pending",
      paymentStatus: "pending",
      expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        reservationId: registration._id.toString(),
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error reserving spot:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      { error: "Internal server error", message: err.message || "Unknown error" },
      { status: 500 },
    );
  }
}
