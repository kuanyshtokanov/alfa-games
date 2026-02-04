import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectDB from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import UserCredits from "@/lib/mongodb/models/UserCredits";
import CreditTransaction from "@/lib/mongodb/models/CreditTransaction";

/**
 * POST /api/admin/users/[id]/credits/top-up
 * Admin-only credits top up for a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const targetUser = await User.findById(id).select("_id");
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let body: { amount?: number; currency?: string; description?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const amountNumber = Number(body.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    const normalizedCurrency = (body.currency || "KZT").toUpperCase();

    const existingCredits = await UserCredits.findOne({ userId: targetUser._id });
    if (
      existingCredits &&
      existingCredits.currency.toUpperCase() !== normalizedCurrency
    ) {
      return NextResponse.json(
        {
          error: "Currency mismatch for user credits",
          currency: existingCredits.currency,
        },
        { status: 400 }
      );
    }

    const updatedCredits = await UserCredits.findOneAndUpdate(
      { userId: targetUser._id },
      {
        $inc: { balance: amountNumber },
        $setOnInsert: { currency: normalizedCurrency },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const balanceAfter = updatedCredits?.balance ?? amountNumber;
    const balanceBefore = balanceAfter - amountNumber;

    const creditTransaction = await CreditTransaction.create({
      userId: targetUser._id,
      amount: amountNumber,
      type: "admin_adjustment",
      description: body.description?.trim() || "Admin top-up",
      balanceBefore,
      balanceAfter,
    });

    return NextResponse.json(
      {
        success: true,
        balance: balanceAfter,
        currency: updatedCredits?.currency || normalizedCurrency,
        transactionId: creditTransaction._id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error topping up credits:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      { error: "Internal server error", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
