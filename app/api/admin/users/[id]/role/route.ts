import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/utils/api-auth";
import connectDB from "@/lib/mongodb/connect";
import User from "@/lib/mongodb/models/User";
import mongoose from "mongoose";

/**
 * PATCH /api/admin/users/[id]/role
 * Update a user's role (admin only)
 */
export async function PATCH(
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

    // Only admins can update roles
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["player", "host", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'player', 'host', or 'admin'" },
        { status: 400 }
      );
    }

    const targetUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: targetUser._id,
          email: targetUser.email,
          name: targetUser.name,
          role: targetUser.role,
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
