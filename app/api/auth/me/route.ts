import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/utils/api-auth';
import { getUserManagedClubs } from '@/lib/utils/rbac';

// GET /api/auth/me - Get current authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a club manager
    const managedClubs = await getUserManagedClubs(user);
    const isClubManager = managedClubs.length > 0;

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          firebaseUID: user.firebaseUID,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          isClubManager,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

