/**
 * API Authentication Utilities
 * 
 * Helper functions for authenticating API requests and getting MongoDB user
 */

import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import connectDB from '@/lib/mongodb/connect';
import User, { IUser } from '@/lib/mongodb/models/User';

/**
 * Get authenticated user from request
 * Verifies Firebase token and returns MongoDB user document
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<IUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token);

    await connectDB();

    const user = await User.findOne({ firebaseUID: decodedToken.uid });
    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

