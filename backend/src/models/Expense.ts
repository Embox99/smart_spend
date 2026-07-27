import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ExpenseDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  icon?: string | null;
  category: string;
  /** Integer minor units — see utils/money.ts. */
  amount: number;
  /** Free-text detail; also matched by search. */
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<ExpenseDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    icon: { type: String },
    category: { type: String, required: true },
    // Integer minor units — see utils/money.ts.
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, trim: true, maxlength: 280 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Every list/aggregate query filters by owner and sorts or ranges on date.
ExpenseSchema.index({ userId: 1, date: -1 });

const Expense: Model<ExpenseDocument> = mongoose.model<ExpenseDocument>(
  "Expense",
  ExpenseSchema
);

export default Expense;
