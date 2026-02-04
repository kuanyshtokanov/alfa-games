import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectDB from "@/lib/mongodb/connect";
import UserCredits from "@/lib/mongodb/models/UserCredits";

/**
 * GET /api/credits/balance
 * Return current authenticated user's credit balance
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const credits = await UserCredits.findOne({ userId: user._id });
    const balance = credits?.balance ?? 0;
    const currency = (credits?.currency || "KZT").toUpperCase();

    return NextResponse.json(
      {
        success: true,
        balance,
        currency,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching credit balance:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      { error: "Internal server error", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
