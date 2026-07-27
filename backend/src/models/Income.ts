import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IncomeDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  icon?: string | null;
  source: string;
  /** Integer minor units — see utils/money.ts. */
  amount: number;
  /** Free-text detail; also matched by search. */
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IncomeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String },
    source: { type: String, required: true },
    // Integer minor units — see utils/money.ts.
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, trim: true, maxlength: 280 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Every list/aggregate query filters by owner and sorts or ranges on date.
IncomeSchema.index({ userId: 1, date: -1 });

const Income: Model<IncomeDocument> = mongoose.model<IncomeDocument>(
  "Income",
  IncomeSchema
);

export default Income;
