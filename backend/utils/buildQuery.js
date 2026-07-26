/**
 * Builds a Mongoose filter object from Express query params.
 * Used by both expenseController and incomeController.
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
 *
 * @param {object} queryParams  — req.query
 * @param {string} textField    — model field to search ("category" or "source")
 * @returns {{ filter, sort, skip, limit, page }}
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildQuery = (queryParams, textField) => {
  const {
    from, to,
    minAmount, maxAmount,
    search,
    sortBy = "date",
    order = "desc",
    page = "1",
    limit: rawLimit = "20",
  } = queryParams;

  const filter = {};

  // ── date range ────────────────────────────────────────────────────────────
  // Ranges are only attached once they hold at least one bound — an empty
  // object here would make Mongo look for a literal {} and match nothing.
  const dateRange = {};
  if (from) {
    const d = new Date(from);
    if (!isNaN(d)) dateRange.$gte = d;
  }
  if (to) {
    // Include the full "to" day by setting time to 23:59:59
    const d = new Date(to);
    if (!isNaN(d)) {
      d.setHours(23, 59, 59, 999);
      dateRange.$lte = d;
    }
  }
  if (Object.keys(dateRange).length) filter.date = dateRange;

  // ── amount range ──────────────────────────────────────────────────────────
  const amountRange = {};
  const min = parseFloat(minAmount);
  const max = parseFloat(maxAmount);
  if (!isNaN(min)) amountRange.$gte = min;
  if (!isNaN(max)) amountRange.$lte = max;
  if (Object.keys(amountRange).length) filter.amount = amountRange;

  // ── text search on category / source ─────────────────────────────────────
  // Escaped so a crafted pattern like "(a+)+$" cannot stall the server.
  if (search && search.trim()) {
    filter[textField] = { $regex: escapeRegex(search.trim()), $options: "i" };
  }

  // ── sort ──────────────────────────────────────────────────────────────────
  const allowedSort = ["date", "amount"];
  const safeSortBy = allowedSort.includes(sortBy) ? sortBy : "date";
  const safeOrder  = order === "asc" ? 1 : -1;
  const sort = { [safeSortBy]: safeOrder };

  // ── pagination ────────────────────────────────────────────────────────────
  const parsedPage  = Math.max(1, parseInt(page,  10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  return { filter, sort, skip, limit: parsedLimit, page: parsedPage };
};

module.exports = buildQuery;
