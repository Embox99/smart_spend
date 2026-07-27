/**
 * One-off migration: rescales decimal amounts to integer minor units.
 *
 *   npm run migrate:minor-units
 *
 * Records completion in a `migrations` collection, so running it twice does
 * not multiply amounts by 100 again.
 */
import { env } from "../config/env";
import mongoose from "mongoose";
import Expense from "../models/Expense";
import Income from "../models/Income";
import Budget from "../models/Budget";
import { MINOR_UNITS_PER_MAJOR } from "../utils/money";

const MIGRATION_ID = "2026-07-amounts-to-minor-units";

interface MigrationRecord {
  _id: string;
  appliedAt: Date;
}

const run = async (): Promise<void> => {
  await mongoose.connect(env.MONGO_URI);
  const migrations =
    mongoose.connection.collection<MigrationRecord>("migrations");

  if (await migrations.findOne({ _id: MIGRATION_ID })) {
    console.log(`${MIGRATION_ID} already applied — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  // $mul then $round keeps the work inside the server; rounding matters
  // because 12.29 * 100 is 1228.9999999999998 as a double.
  const scale = async (
    label: string,
    model: typeof Expense | typeof Income,
    field: "amount"
  ) => {
    const result = await model.collection.updateMany({}, [
      {
        $set: {
          [field]: {
            $round: [{ $multiply: [`$${field}`, MINOR_UNITS_PER_MAJOR] }, 0],
          },
        },
      },
    ]);
    console.log(`${label}: ${result.modifiedCount} rescaled`);
  };

  await scale("expenses", Expense, "amount");
  await scale("income", Income, "amount");

  const budgets = await Budget.collection.updateMany({}, [
    {
      $set: {
        limit: {
          $round: [{ $multiply: ["$limit", MINOR_UNITS_PER_MAJOR] }, 0],
        },
      },
    },
  ]);
  console.log(`budgets: ${budgets.modifiedCount} rescaled`);

  await migrations.insertOne({ _id: MIGRATION_ID, appliedAt: new Date() });
  console.log("Done.");

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error("Migration failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
