import { describe, expect, it, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { csrfGuard } from "./csrf";

const ALLOWED = ["https://app.example.com"];

const buildApp = (enabled: boolean) => {
  const app = express();
  app.use(express.json());
  app.use(csrfGuard(ALLOWED, enabled));
  app.get("/thing", (_req, res) => void res.json({ ok: true }));
  app.post("/thing", (_req, res) => void res.json({ ok: true }));
  app.delete("/thing", (_req, res) => void res.json({ ok: true }));
  return app;
};

describe("csrfGuard when cross-site cookies are on", () => {
  let app: express.Express;

  beforeEach(() => {
    // SameSite=None means the browser no longer withholds the cookie.
    app = buildApp(true);
  });

  it("blocks a write from an unknown origin", async () => {
    const res = await request(app)
      .post("/thing")
      .set("Origin", "https://evil.example.net")
      .expect(403);

    expect(res.body.message).toBe("Cross-site request blocked");
  });

  it("blocks a delete from an unknown origin", async () => {
    await request(app)
      .delete("/thing")
      .set("Origin", "https://evil.example.net")
      .expect(403);
  });

  it("allows a write from an allowed origin", async () => {
    await request(app)
      .post("/thing")
      .set("Origin", "https://app.example.com")
      .expect(200);
  });

  it("leaves reads alone — they change nothing", async () => {
    await request(app)
      .get("/thing")
      .set("Origin", "https://evil.example.net")
      .expect(200);
  });

  it("allows a request with no Origin, which no browser page can forge", async () => {
    await request(app).post("/thing").expect(200);
  });

  it("exempts bearer clients, which a third-party page cannot impersonate", async () => {
    await request(app)
      .post("/thing")
      .set("Origin", "https://evil.example.net")
      .set("Authorization", "Bearer some-token")
      .expect(200);
  });
});

describe("csrfGuard in development", () => {
  it("stays out of the way — SameSite=Lax already covers it", async () => {
    const app = buildApp(false);

    await request(app)
      .post("/thing")
      .set("Origin", "http://localhost:9999")
      .expect(200);
  });
});
