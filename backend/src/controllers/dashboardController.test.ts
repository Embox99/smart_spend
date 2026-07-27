import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app";
import { auth, createUser, type TestUser } from "../test/helpers";

const today = () => new Date().toISOString().slice(0, 10);

describe("dashboard", () => {
  let user: TestUser;

  beforeEach(async () => {
    user = await createUser();
  });

  const add = (kind: "income" | "expense", body: Record<string, unknown>) =>
    request(app)
      .post(`/api/v1/${kind}/add`)
      .set("Authorization", auth(user.token))
      .send(body);

  const getDashboard = () =>
    request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", auth(user.token));

  it("returns totals as plain numbers, not aggregate rows", async () => {
    await add("income", { source: "Salary", amount: 1000, date: today() });
    await add("expense", { category: "Rent", amount: 400, date: today() });

    const res = await getDashboard().expect(200);

    expect(res.body.totalIncome).toBe(100000);
    expect(res.body.totalExpense).toBe(40000);
    expect(res.body.totalBalance).toBe(60000);
  });

  it("groups the expense chart by category rather than per transaction", async () => {
    await add("expense", { category: "Food", amount: 10, date: today() });
    await add("expense", { category: "Food", amount: 15, date: today() });
    await add("expense", { category: "Rent", amount: 400, date: today() });

    const { byCategory } = (await getDashboard().expect(200)).body
      .last30DaysExpenses;

    expect(byCategory).toHaveLength(2);
    expect(byCategory[0]).toEqual({ label: "Rent", amount: 40000 });
    expect(byCategory[1]).toEqual({ label: "Food", amount: 2500 });
  });

  it("groups categories case-insensitively", async () => {
    await add("expense", { category: "Food", amount: 10, date: today() });
    await add("expense", { category: "food", amount: 5, date: today() });

    const { byCategory } = (await getDashboard().expect(200)).body
      .last30DaysExpenses;

    expect(byCategory).toHaveLength(1);
    expect(byCategory[0].amount).toBe(1500);
  });

  it("groups the income chart by source", async () => {
    await add("income", { source: "Salary", amount: 1000, date: today() });
    await add("income", { source: "Freelance", amount: 300, date: today() });
    await add("income", { source: "Freelance", amount: 200, date: today() });

    const { bySource, total } = (await getDashboard().expect(200)).body
      .last60DaysIncome;

    expect(total).toBe(150000);
    expect(bySource).toEqual([
      { label: "Salary", amount: 100000 },
      { label: "Freelance", amount: 50000 },
    ]);
  });

  it("fills the feed from whichever ledger has the newest records", async () => {
    // Six expenses and no income: taking five of each would return five rows.
    for (let i = 0; i < 6; i += 1) {
      await add("expense", {
        category: `Item ${i}`,
        amount: i + 1,
        date: today(),
      });
    }

    const res = await getDashboard().expect(200);

    expect(res.body.recentTransactions).toHaveLength(6);
    expect(
      res.body.recentTransactions.every(
        (t: { type: string }) => t.type === "expense"
      )
    ).toBe(true);
  });

  it("caps the merged feed at ten rows", async () => {
    for (let i = 0; i < 8; i += 1) {
      await add("expense", { category: "E", amount: 1, date: today() });
      await add("income", { source: "I", amount: 1, date: today() });
    }

    const res = await getDashboard().expect(200);

    expect(res.body.recentTransactions).toHaveLength(10);
  });

  it("sends only the rows each feed renders", async () => {
    for (let i = 0; i < 9; i += 1) {
      await add("expense", { category: "E", amount: 1, date: today() });
    }

    const res = await getDashboard().expect(200);

    expect(res.body.recentExpenses).toHaveLength(5);
  });

  it("tags each recent transaction with its kind", async () => {
    await add("income", { source: "Salary", amount: 1000, date: today() });
    await add("expense", { category: "Rent", amount: 400, date: today() });

    const kinds = (await getDashboard().expect(200)).body.recentTransactions.map(
      (t: { type: string }) => t.type
    );

    expect(kinds).toContain("income");
    expect(kinds).toContain("expense");
  });

  it("zeroes the totals for a user with no records", async () => {
    const res = await getDashboard().expect(200);

    expect(res.body).toMatchObject({
      totalIncome: 0,
      totalExpense: 0,
      totalBalance: 0,
    });
    expect(res.body.recentTransactions).toEqual([]);
    expect(res.body.last30DaysExpenses.byCategory).toEqual([]);
    expect(res.body.last60DaysIncome.bySource).toEqual([]);
  });
});
