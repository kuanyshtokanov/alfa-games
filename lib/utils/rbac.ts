/**
 * RBAC (Role-Based Access Control) Utilities
 *
 * Helper functions for checking user permissions for game management
 */

import connectDB from "@/lib/mongodb/connect";
import { IUser } from "@/lib/mongodb/models/User";
import Game, { IGame } from "@/lib/mongodb/models/Game";
import Club from "@/lib/mongodb/models/Club";
import mongoose from "mongoose";

/**
 * Check if a user can create games
 * Users with role 'host' or 'admin' can create games
 * Club managers (users in club.adminIds) can also create games for their clubs
 */
export async function canCreateGame(user: IUser): Promise<boolean> {
  // Admins and hosts can always create games
  if (user.role === "admin" || user.role === "host") {
    return true;
  }

  // Check if user is a club manager
  await connectDB();
  const clubs = await Club.find({ adminIds: user._id });
  return clubs.length > 0;
}

/**
 * Check if a user can manage a specific game
 * Users can manage games if:
 * - They are an admin
 * - They are the host of the game
 * - They are a club manager of the club that owns the game
 */
export async function canManageGame(
  user: IUser,
  game: IGame | mongoose.Types.ObjectId | string
): Promise<boolean> {
  // Admins can manage all games
  if (user.role === "admin") {
    return true;
  }

  await connectDB();

  // Get the game if we only have an ID
  let gameDoc: IGame | null;
  if (typeof game === "string" || game instanceof mongoose.Types.ObjectId) {
    gameDoc = await Game.findById(game);
  } else {
    gameDoc = game;
  }

  if (!gameDoc) {
    return false;
  }

  // Check if user is the host
  if (gameDoc.hostId.toString() === user._id.toString()) {
    return true;
  }

  // Check if user is a club manager of the game's club
  if (gameDoc.clubId) {
    const club = await Club.findById(gameDoc.clubId);
    if (
      club &&
      club.adminIds.some((id) => id.toString() === user._id.toString())
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a user can manage games for a specific club
 * Users can manage club games if:
 * - They are an admin
 * - They are a club manager (in club.adminIds)
 */
export async function canManageClubGames(
  user: IUser,
  clubId: mongoose.Types.ObjectId | string
): Promise<boolean> {
  // Admins can manage all club games
  if (user.role === "admin") {
    return true;
  }

  await connectDB();

  const club = await Club.findById(clubId);
  if (!club) {
    return false;
  }

  // Check if user is a club manager
  return club.adminIds.some((id) => id.toString() === user._id.toString());
}

/**
 * Get all clubs where the user is a manager
 */
export async function getUserManagedClubs(
  user: IUser
): Promise<mongoose.Types.ObjectId[]> {
  await connectDB();
  const clubs = await Club.find({ adminIds: user._id });
  return clubs.map((club) => club._id);
}
