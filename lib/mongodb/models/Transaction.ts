import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  registrationId: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      index: true,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    transactionId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "kzt",
      uppercase: true,
      enum: ["KZT", "USD", "EUR", "RUB"],
    },
    status: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ provider: 1, transactionId: 1 }, { unique: true });
TransactionSchema.index({ registrationId: 1, status: 1 });
TransactionSchema.index({ gameId: 1, status: 1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });

// Prevent re-compilation during development
const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
