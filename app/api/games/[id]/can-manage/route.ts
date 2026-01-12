import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/utils/api-auth';
import { canManageGame } from '@/lib/utils/rbac';
import connectDB from '@/lib/mongodb/connect';
import Game from '@/lib/mongodb/models/Game';
import mongoose from 'mongoose';

/**
 * GET /api/games/[id]/can-manage
 * Check if the current user can manage a specific game
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { canManage: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { canManage: false, error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json(
        { canManage: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    const canManage = await canManageGame(user, game);

    return NextResponse.json(
      { canManage },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error checking game management permission:', error);
    const err = error as { message?: string };
    return NextResponse.json(
      { canManage: false, error: 'Internal server error', message: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
