import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClub extends Document {
  name: string;
  description?: string;
  adminIds: mongoose.Types.ObjectId[];
  memberIds: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    adminIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      index: true,
    },
    memberIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding clubs by member/admin
ClubSchema.index({ memberIds: 1 });
ClubSchema.index({ adminIds: 1 });

// Prevent re-compilation during development
const Club: Model<IClub> =
  mongoose.models.Club || mongoose.model<IClub>('Club', ClubSchema);

export default Club;

