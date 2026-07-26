import type { FilterQuery, SortOrder } from "mongoose";
import type { ParsedQs } from "qs";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export interface BuiltQuery<T> {
  filter: FilterQuery<T>;
  sort: Record<string, SortOrder>;
  skip: number;
  limit: number;
  page: number;
}

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Query params only ever arrive as strings; anything else is ignored. */
const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

/**
 * Builds a Mongoose filter from Express query params. Shared by the expense
 * and income controllers, which differ only in the searchable text field.
 *
 * Supported params:
 *   from        YYYY-MM-DD  — inclusive start date
 *   to          YYYY-MM-DD  — inclusive end date
 *   minAmount   number      — minimum amount (inclusive)
 *   maxAmount   number      — maximum amount (inclusive)
 *   search      string      — case-insensitive substring match on textField
 *   sortBy      "date"|"amount"  default: "date"
 *   order       "asc"|"desc"     default: "desc"
 *   page        number      — 1-based, default: 1
 *   limit       number      — default: 20, max: 100
 */
const buildQuery = <T>(
  queryParams: ParsedQs,
  textField: "category" | "source"
): BuiltQuery<T> => {
  const from = asString(queryParams.from);
  const to = asString(queryParams.to);
  const search = asString(queryParams.search);
  const sortBy = asString(queryParams.sortBy) ?? "date";
  const order = asString(queryParams.order) ?? "desc";

  const filter: Record<string, unknown> = {};

  // ── date range ────────────────────────────────────────────────────────────
  // Ranges are only attached once they hold at least one bound — an empty
  // object here would make Mongo look for a literal {} and match nothing.
  const dateRange: Record<string, Date> = {};
  if (from) {
    const d = new Date(from);
    if (!isNaN(d.getTime())) dateRange.$gte = d;
  }
  if (to) {
    // Include the full "to" day by setting time to 23:59:59.
    const d = new Date(to);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      dateRange.$lte = d;
    }
  }
  if (Object.keys(dateRange).length) filter.date = dateRange;

  // ── amount range ──────────────────────────────────────────────────────────
  const amountRange: Record<string, number> = {};
  const min = parseFloat(asString(queryParams.minAmount) ?? "");
  const max = parseFloat(asString(queryParams.maxAmount) ?? "");
  if (!isNaN(min)) amountRange.$gte = min;
  if (!isNaN(max)) amountRange.$lte = max;
  if (Object.keys(amountRange).length) filter.amount = amountRange;

  // ── text search on category / source ─────────────────────────────────────
  // Escaped so a crafted pattern like "(a+)+$" cannot stall the server.
  if (search && search.trim()) {
    filter[textField] = { $regex: escapeRegex(search.trim()), $options: "i" };
  }

  // ── sort ──────────────────────────────────────────────────────────────────
  const safeSortBy = sortBy === "amount" ? "amount" : "date";
  const sort: Record<string, SortOrder> = {
    [safeSortBy]: order === "asc" ? 1 : -1,
  };

  // ── pagination ────────────────────────────────────────────────────────────
  const page = Math.max(1, parseInt(asString(queryParams.page) ?? "", 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      parseInt(asString(queryParams.limit) ?? "", 10) || DEFAULT_LIMIT
    )
  );

  return {
    filter: filter as FilterQuery<T>,
    sort,
    skip: (page - 1) * limit,
    limit,
    page,
  };
};

export default buildQuery;
