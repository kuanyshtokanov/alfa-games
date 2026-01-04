import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICreditTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number; // Positive for credits added, negative for credits used
  type: "add" | "use" | "refund" | "admin_adjustment";
  description?: string;
  registrationId?: mongoose.Types.ObjectId; // Related registration if applicable
  paymentId?: mongoose.Types.ObjectId; // Related payment if applicable
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

const CreditTransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["add", "use", "refund", "admin_adjustment"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      index: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
CreditTransactionSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionSchema.index({ userId: 1, type: 1 });

// Prevent re-compilation during development
const CreditTransaction: Model<ICreditTransaction> =
  mongoose.models.CreditTransaction ||
  mongoose.model<ICreditTransaction>("CreditTransaction", CreditTransactionSchema);

export default CreditTransaction;

