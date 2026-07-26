import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app";
import { auth, createUser, type TestUser } from "../test/helpers";

const ENDPOINT = "/api/v1/expense";

/** superagent parses text by default; xlsx must be collected as bytes. */
const binaryParser = (
  res: NodeJS.ReadableStream,
  callback: (err: Error | null, body: Buffer) => void
): void => {
  const chunks: Buffer[] = [];
  res.on("data", (chunk: Buffer) => chunks.push(chunk));
  res.on("end", () => callback(null, Buffer.concat(chunks)));
};

const addExpense = (user: TestUser, body: Record<string, unknown>) =>
  request(app)
    .post(`${ENDPOINT}/add`)
    .set("Authorization", auth(user.token))
    .send(body);

describe("expenses", () => {
  let user: TestUser;

  beforeEach(async () => {
    user = await createUser();
  });

  it("creates an expense and coerces a string amount", async () => {
    const res = await addExpense(user, {
      category: "  Groceries  ",
      amount: "42.50",
      date: "2024-03-15",
    }).expect(201);

    expect(res.body.category).toBe("Groceries"); // trimmed by the schema
    expect(res.body.amount).toBe(42.5);
  });

  it("rejects a non-positive or non-numeric amount", async () => {
    await addExpense(user, {
      category: "X",
      amount: -5,
      date: "2024-03-15",
    }).expect(400);

    await addExpense(user, {
      category: "X",
      amount: "abc",
      date: "2024-03-15",
    }).expect(400);
  });

  it("paginates and reports the page metadata", async () => {
    for (let i = 0; i < 25; i += 1) {
      await addExpense(user, {
        category: `Item ${i}`,
        amount: i + 1,
        date: "2024-03-15",
      }).expect(201);
    }

    const page2 = await request(app)
      .get(`${ENDPOINT}/get?page=2&limit=20`)
      .set("Authorization", auth(user.token))
      .expect(200);

    expect(page2.body.data).toHaveLength(5);
    expect(page2.body.pagination).toMatchObject({
      total: 25,
      page: 2,
      totalPages: 2,
      hasNextPage: false,
      hasPrevPage: true,
    });
  });

  it("returns results when a numeric filter is unparseable", async () => {
    await addExpense(user, {
      category: "Coffee",
      amount: 5,
      date: "2024-03-15",
    }).expect(201);

    // An empty range object used to be sent to Mongo and matched nothing.
    const res = await request(app)
      .get(`${ENDPOINT}/get?minAmount=abc`)
      .set("Authorization", auth(user.token))
      .expect(200);

    expect(res.body.data).toHaveLength(1);
  });

  it("filters by search term, amount range and date range", async () => {
    await addExpense(user, {
      category: "Coffee",
      amount: 5,
      date: "2024-03-01",
    });
    await addExpense(user, { category: "Rent", amount: 900, date: "2024-03-20" });

    const bySearch = await request(app)
      .get(`${ENDPOINT}/get?search=cof`)
      .set("Authorization", auth(user.token));
    expect(bySearch.body.data).toHaveLength(1);

    const byAmount = await request(app)
      .get(`${ENDPOINT}/get?minAmount=100`)
      .set("Authorization", auth(user.token));
    expect(byAmount.body.data).toHaveLength(1);
    expect(byAmount.body.data[0].category).toBe("Rent");

    const byDate = await request(app)
      .get(`${ENDPOINT}/get?from=2024-03-10&to=2024-03-31`)
      .set("Authorization", auth(user.token));
    expect(byDate.body.data).toHaveLength(1);
  });

  it("never leaks another user's expenses", async () => {
    const other = await createUser();
    await addExpense(other, {
      category: "Private",
      amount: 10,
      date: "2024-03-15",
    }).expect(201);

    const res = await request(app)
      .get(`${ENDPOINT}/get`)
      .set("Authorization", auth(user.token))
      .expect(200);

    expect(res.body.data).toHaveLength(0);
  });

  it("refuses to delete an expense owned by someone else", async () => {
    const other = await createUser();
    const created = await addExpense(other, {
      category: "Theirs",
      amount: 10,
      date: "2024-03-15",
    });

    await request(app)
      .delete(`${ENDPOINT}/${created.body._id}`)
      .set("Authorization", auth(user.token))
      .expect(404);
  });

  it("rejects an id that is not an ObjectId", async () => {
    await request(app)
      .delete(`${ENDPOINT}/not-an-id`)
      .set("Authorization", auth(user.token))
      .expect(400);
  });

  it("exports an xlsx workbook", async () => {
    await addExpense(user, {
      category: "Coffee",
      amount: 5,
      date: "2024-03-15",
    });

    const res = await request(app)
      .get(`${ENDPOINT}/downloadexcel`)
      .set("Authorization", auth(user.token))
      .buffer(true)
      .parse(binaryParser)
      .expect(200);

    expect(res.headers["content-type"]).toContain("spreadsheetml");
    expect(res.headers["content-disposition"]).toContain(
      "expense_details.xlsx"
    );
    // xlsx files are zip archives — check the magic bytes.
    expect((res.body as Buffer).subarray(0, 2).toString()).toBe("PK");
  });
});
