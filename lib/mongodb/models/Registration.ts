import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegistration extends Document {
  gameId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  paymentIntentId?: string; // Stripe Payment Intent ID
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "credits" | "stripe" | "mixed"; // How payment was made
  creditsUsed?: number; // Amount of credits used (if any)
  status: "confirmed" | "cancelled";
  registeredAt: Date;
  cancelledAt?: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentIntentId: {
      type: String,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credits", "stripe", "mixed"],
      default: "stripe",
      index: true,
    },
    creditsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
      index: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
RegistrationSchema.index({ gameId: 1, playerId: 1 }, { unique: true });
RegistrationSchema.index({ playerId: 1, status: 1 });
RegistrationSchema.index({ gameId: 1, status: 1 });
RegistrationSchema.index({ paymentIntentId: 1 });

// Prevent re-compilation during development
const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
