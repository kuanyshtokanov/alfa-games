import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGame extends Document {
  hostId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  location: {
    address: string;
    city?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  datetime: Date;
  duration: number; // in minutes
  maxPlayers: number;
  currentPlayersCount: number;
  price: number;
  currency: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "all";
  equipment: {
    provided: string[];
    needed: string[];
  };
  rules?: string;
  hostInfo?: string;
  cancellationPolicy?: string;
  cancellationRule:
    | "anytime"
    | "24hours"
    | "48hours"
    | "72hours"
    | "no_refund"
    | "custom";
  isPublic: boolean;
  clubId?: mongoose.Types.ObjectId;
  status: "upcoming" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        trim: true,
        index: true,
      },
      country: {
        type: String,
        trim: true,
        index: true,
      },
      coordinates: {
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        },
      },
    },
    datetime: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 1,
    },
    currentPlayersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
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
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },
    equipment: {
      provided: {
        type: [String],
        default: [],
      },
      needed: {
        type: [String],
        default: [],
      },
    },
    rules: {
      type: String,
      trim: true,
    },
    hostInfo: {
      type: String,
      trim: true,
    },
    cancellationPolicy: {
      type: String,
      trim: true,
    },
    cancellationRule: {
      type: String,
      enum: ["anytime", "24hours", "48hours", "72hours", "no_refund", "custom"],
      default: "anytime",
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      index: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "cancelled", "completed"],
      default: "upcoming",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
GameSchema.index({ status: 1, datetime: 1 });
GameSchema.index({ isPublic: 1, status: 1, datetime: 1 });
GameSchema.index({ clubId: 1, status: 1, datetime: 1 });

// Prevent re-compilation during development
const Game: Model<IGame> =
  mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);

export default Game;
