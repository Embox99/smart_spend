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

  it("returns totals as plain numbers, not aggregate rows", async () => {
    await add("income", { source: "Salary", amount: 1000, date: today() });
    await add("expense", { category: "Rent", amount: 400, date: today() });

    const res = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", auth(user.token))
      .expect(200);

    expect(res.body.totalIncome).toBe(1000);
    expect(res.body.totalExpense).toBe(400);
    expect(res.body.totalBalance).toBe(600);
  });

  it("tags each recent transaction with its kind", async () => {
    await add("income", { source: "Salary", amount: 1000, date: today() });
    await add("expense", { category: "Rent", amount: 400, date: today() });

    const res = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", auth(user.token))
      .expect(200);

    const kinds = res.body.recentTransactions.map(
      (t: { type: string }) => t.type
    );
    expect(kinds).toContain("income");
    expect(kinds).toContain("expense");
  });

  it("zeroes the totals for a user with no records", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard")
      .set("Authorization", auth(user.token))
      .expect(200);

    expect(res.body).toMatchObject({
      totalIncome: 0,
      totalExpense: 0,
      totalBalance: 0,
    });
    expect(res.body.recentTransactions).toEqual([]);
  });
});
