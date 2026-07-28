import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app";
import { createUser, type TestUser } from "../test/helpers";

describe("budgets", () => {
  let user: TestUser;

  const upsert = (body: Record<string, unknown>) =>
    request(app).post("/api/v1/budget").set("Cookie", user.cookies).send(body);

  const addExpense = (body: Record<string, unknown>) =>
    request(app)
      .post("/api/v1/expense/add")
      .set("Cookie", user.cookies)
      .send(body);

  const getBudgets = (month: string) =>
    request(app)
      .get(`/api/v1/budget?month=${month}`)
      .set("Cookie", user.cookies);

  beforeEach(async () => {
    user = await createUser();
  });

  it("upserts rather than duplicating a category for a month", async () => {
    await upsert({ category: "Food", limit: 300, month: "2024-03" }).expect(
      200
    );
    await upsert({ category: "Food", limit: 500, month: "2024-03" }).expect(
      200
    );

    const res = await getBudgets("2024-03").expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].limit).toBe(50000);
  });

  it("matches spend to a budget regardless of category casing", async () => {
    await upsert({ category: "Food", limit: 300, month: "2024-03" });
    await addExpense({ category: "food", amount: 120, date: "2024-03-10" });

    const res = await getBudgets("2024-03").expect(200);
    expect(res.body[0].spent).toBe(12000);
    expect(res.body[0].remaining).toBe(18000);
    expect(res.body[0].percentUsed).toBe(40);
  });

  it("reports overspend above 100 percent instead of capping it", async () => {
    await upsert({ category: "Food", limit: 100, month: "2024-03" });
    await addExpense({ category: "Food", amount: 250, date: "2024-03-10" });

    const res = await getBudgets("2024-03").expect(200);
    expect(res.body[0].percentUsed).toBe(250);
    expect(res.body[0].remaining).toBe(0);
  });

  it("counts only expenses inside the budget month", async () => {
    await upsert({ category: "Food", limit: 300, month: "2024-03" });
    await addExpense({ category: "Food", amount: 50, date: "2024-02-28" });
    await addExpense({ category: "Food", amount: 70, date: "2024-03-01" });
    await addExpense({ category: "Food", amount: 90, date: "2024-04-01" });

    const res = await getBudgets("2024-03").expect(200);
    expect(res.body[0].spent).toBe(7000);
  });

  it("rejects a malformed month and a non-positive limit", async () => {
    await upsert({ category: "Food", limit: 300, month: "2024-3" }).expect(400);
    await upsert({ category: "Food", limit: 0, month: "2024-03" }).expect(400);
    await getBudgets("March").expect(400);
  });

  it("refuses to delete a budget owned by someone else", async () => {
    const created = await upsert({
      category: "Food",
      limit: 300,
      month: "2024-03",
    });

    const other = await createUser();
    await request(app)
      .delete(`/api/v1/budget/${created.body._id}`)
      .set("Cookie", other.cookies)
      .expect(404);
  });
});
