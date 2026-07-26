import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface BudgetDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  category: string;
  limit: number;
  /** "2024-03" — one budget per category per month. */
  month: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<BudgetDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, trim: true },
    limit: {
      type: Number,
      required: true,
      min: [1, "Limit must be greater than 0"],
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"],
    },
    icon: { type: String, default: null },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

const Budget: Model<BudgetDocument> = mongoose.model<BudgetDocument>(
  "Budget",
  BudgetSchema
);

export default Budget;
