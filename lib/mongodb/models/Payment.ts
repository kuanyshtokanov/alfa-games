import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  registrationId: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: string; // Stripe payment status
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
      enum: ["KZT", "USD", "EUR", "RUB"], // Common currencies for Kazakhstan region
    },
    status: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding payments by registration
PaymentSchema.index({ registrationId: 1, status: 1 });

// Prevent re-compilation during development
const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
