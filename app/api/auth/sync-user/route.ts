import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import connectDB from '@/lib/mongodb/connect';
import User from '@/lib/mongodb/models/User';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token);

    const body = await request.json();
    const { firebaseUID, email, name, avatar } = body;

    // Verify the token's UID matches the request body
    if (decodedToken.uid !== firebaseUID) {
      return NextResponse.json(
        { error: 'Unauthorized - Token UID mismatch' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find or create user
    const user = await User.findOneAndUpdate(
      { firebaseUID },
      {
        firebaseUID,
        email,
        name,
        avatar,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          firebaseUID: user.firebaseUID,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

