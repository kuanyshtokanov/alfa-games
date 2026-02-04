import mongoose from "mongoose";
import UserCredits from "@/lib/mongodb/models/UserCredits";
import CreditTransaction from "@/lib/mongodb/models/CreditTransaction";

export class CreditsError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

type ApplyCreditsParams = {
  userId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  description?: string;
};

export async function applyCreditsForRegistration({
  userId,
  registrationId,
  gameId,
  amount,
  currency,
  description,
}: ApplyCreditsParams) {
  if (amount <= 0) {
    throw new CreditsError("Credits amount must be positive.", "INVALID_AMOUNT");
  }

  const updatedCredits = await UserCredits.findOneAndUpdate(
    {
      userId,
      currency,
      balance: { $gte: amount },
    },
    { $inc: { balance: -amount } },
    { new: true }
  );

  if (!updatedCredits) {
    const existingCredits = await UserCredits.findOne({ userId });
    if (existingCredits && existingCredits.currency !== currency) {
      throw new CreditsError(
        "Credits currency mismatch.",
        "CREDITS_CURRENCY_MISMATCH"
      );
    }

    throw new CreditsError(
      "Insufficient credits balance.",
      "INSUFFICIENT_CREDITS"
    );
  }

  const balanceBefore = updatedCredits.balance + amount;
  const balanceAfter = updatedCredits.balance;

  const creditTransaction = await CreditTransaction.create({
    userId,
    amount: -amount,
    type: "use",
    description: description ?? `Used credits for game ${gameId.toString()}`,
    registrationId,
    balanceBefore,
    balanceAfter,
  });

  return {
    creditTransactionId: creditTransaction._id.toString(),
    balanceBefore,
    balanceAfter,
  };
}

type RefundCreditsParams = {
  userId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  description?: string;
};

export async function refundCreditsForCancellation({
  userId,
  registrationId,
  gameId,
  amount,
  currency,
  description,
}: RefundCreditsParams) {
  if (amount <= 0) {
    throw new CreditsError("Refund amount must be positive.", "INVALID_AMOUNT");
  }

  const normalizedCurrency = currency.toUpperCase();
  const existingCredits = await UserCredits.findOne({ userId });
  if (existingCredits && existingCredits.currency !== normalizedCurrency) {
    throw new CreditsError(
      "Credits currency mismatch.",
      "CREDITS_CURRENCY_MISMATCH"
    );
  }

  const updatedCredits = await UserCredits.findOneAndUpdate(
    { userId },
    {
      $inc: { balance: amount },
      $setOnInsert: { currency: normalizedCurrency },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const balanceAfter = updatedCredits?.balance ?? amount;
  const balanceBefore = balanceAfter - amount;

  const creditTransaction = await CreditTransaction.create({
    userId,
    amount,
    type: "refund",
    description:
      description ?? `Refunded credits for game ${gameId.toString()}`,
    registrationId,
    balanceBefore,
    balanceAfter,
  });

  return {
    creditTransactionId: creditTransaction._id.toString(),
    balanceBefore,
    balanceAfter,
  };
}
