import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserCredits extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number; // Credits balance in KZT (or same currency as user's region)
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserCreditsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "kzt",
      uppercase: true,
      enum: ["KZT", "USD", "EUR", "RUB"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
const UserCredits: Model<IUserCredits> =
  mongoose.models.UserCredits ||
  mongoose.model<IUserCredits>("UserCredits", UserCreditsSchema);

export default UserCredits;

