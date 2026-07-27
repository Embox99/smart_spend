import { describe, expect, it } from "vitest";
import type { Expense } from "@shared/types";
import {
  getInitials,
  prepareExpenseLineChartData,
  validateEmail,
} from "./helper";

const expense = (over: Partial<Expense>): Expense =>
  ({
    _id: "1",
    userId: "u",
    category: "Food",
    amount: 1000,
    date: "2024-03-15T00:00:00.000Z",
    createdAt: "",
    updatedAt: "",
    ...over,
  }) as Expense;

describe("validateEmail", () => {
  it.each(["a@b.co", "first.last@sub.example.com"])("accepts %s", (email) => {
    expect(validateEmail(email)).toBe(true);
  });

  it.each(["", "nope", "a@b", "a b@c.com", "@b.com"])(
    "rejects %s",
    (email) => {
      expect(validateEmail(email)).toBe(false);
    }
  );
});

describe("getInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(getInitials("Ada Lovelace King")).toBe("AL");
  });

  it("handles a single name, extra spaces and empty input", () => {
    expect(getInitials("Ada")).toBe("A");
    expect(getInitials("  Ada   Lovelace  ")).toBe("AL");
    expect(getInitials("")).toBe("");
    expect(getInitials(null)).toBe("");
  });
});

describe("chart data preparation", () => {
  it("labels each point with its formatted date", () => {
    const points = prepareExpenseLineChartData([
      expense({ date: "2024-03-05T00:00:00.000Z", amount: 900 }),
    ]);

    expect(points).toEqual([{ label: "5th Mar", amount: 900 }]);
  });

  it("sorts the line series oldest first", () => {
    const points = prepareExpenseLineChartData([
      expense({ _id: "b", date: "2024-03-20T00:00:00.000Z", amount: 2 }),
      expense({ _id: "a", date: "2024-03-01T00:00:00.000Z", amount: 1 }),
    ]);

    expect(points.map((p) => p.amount)).toEqual([1, 2]);
  });

  it("does not mutate the input array", () => {
    const input = [
      expense({ _id: "b", date: "2024-03-20T00:00:00.000Z" }),
      expense({ _id: "a", date: "2024-03-01T00:00:00.000Z" }),
    ];
    prepareExpenseLineChartData(input);

    expect(input[0]?._id).toBe("b");
  });
});
