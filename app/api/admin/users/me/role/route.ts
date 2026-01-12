import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectDB from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";

/**
 * PATCH /api/admin/users/me/role
 * Update your own role (for development/testing - allows self-promotion)
 * In production, you might want to remove this or add additional restrictions
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { role } = body;

    if (!role || !["player", "host", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'player', 'host', or 'admin'" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating user role:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
