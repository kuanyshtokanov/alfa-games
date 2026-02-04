import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectDB from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import UserCredits from "@/lib/mongodb/models/UserCredits";

/**
 * GET /api/admin/users
 * List users for admin selection
 */
export async function GET(request: NextRequest) {
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

    const users = await User.find({})
      .select("_id name email role")
      .sort({ createdAt: -1 });

    const userIds = users.map((entry) => entry._id);
    const credits = await UserCredits.find({ userId: { $in: userIds } }).select(
      "userId balance currency"
    );
    const creditsByUser = new Map(
      credits.map((entry) => [entry.userId.toString(), entry])
    );

    return NextResponse.json(
      {
        success: true,
        users: users.map((entry) => ({
          id: entry._id,
          name: entry.name,
          email: entry.email,
          role: entry.role,
          balance: creditsByUser.get(entry._id.toString())?.balance ?? 0,
          currency: creditsByUser.get(entry._id.toString())?.currency || "KZT",
        })),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error listing users:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      { error: "Internal server error", message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
