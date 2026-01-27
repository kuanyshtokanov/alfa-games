import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectMongoDB from "@/lib/mongodb/connect";
import Registration from "@/lib/mongodb/models/Registration";
import Game from "@/lib/mongodb/models/Game";

// POST /api/games/[id]/reserve/cancel - Cancel user's pending reservation
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

    let body: { reservationId?: string } | null = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }
    const reservationId = body?.reservationId;

    const registration = await Registration.findOne({
      gameId: game._id,
      playerId: user._id,
      status: "pending",
    });

    if (!registration) {
      return NextResponse.json(
        { success: true, released: false },
        { status: 200 },
      );
    }

    if (
      reservationId &&
      registration._id.toString() !== reservationId
    ) {
      return NextResponse.json(
        { error: "Reservation mismatch", code: "RESERVATION_MISMATCH" },
        { status: 400 },
      );
    }

    await registration.deleteOne();

    return NextResponse.json(
      { success: true, released: true },
      { status: 200 },
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: "Internal server error", message: err.message || "Unknown error" },
      { status: 500 },
    );
  }
}
