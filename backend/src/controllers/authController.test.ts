import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app";
import User from "../models/User";
import { auth, createUser } from "../test/helpers";

describe("auth", () => {
  it("registers a user and never returns the password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Ada Lovelace",
        email: "Ada@Example.COM",
        password: "secret123",
      })
      .expect(201);

    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.email).toBe("ada@example.com"); // normalised
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("stores the password hashed", async () => {
    await createUser({ email: "hash@example.com", password: "secret123" });

    const stored = await User.findOne({ email: "hash@example.com" });
    expect(stored?.password).not.toBe("secret123");
    expect(await stored?.comparePasswords("secret123")).toBe(true);
  });

  it("persists profileImageUrl passed at registration", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Grace",
        email: "grace@example.com",
        password: "secret123",
        profileImageUrl: "https://cdn.example.com/a.png",
      })
      .expect(201);

    expect(res.body.user.profileImageUrl).toBe("https://cdn.example.com/a.png");
  });

  it("rejects a malformed email and a short password", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ fullName: "X", email: "nope", password: "secret123" })
      .expect(400);

    await request(app)
      .post("/api/v1/auth/register")
      .send({ fullName: "X", email: "x@example.com", password: "123" })
      .expect(400);
  });

  it("refuses a duplicate email", async () => {
    await createUser({ email: "dup@example.com" });

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Other",
        email: "dup@example.com",
        password: "secret123",
      })
      .expect(400);

    expect(res.body.message).toBe("Email is already used");
  });

  it("gives the same message for an unknown email and a wrong password", async () => {
    await createUser({ email: "known@example.com", password: "secret123" });

    const wrongPassword = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "known@example.com", password: "wrong-one" })
      .expect(400);

    const unknownEmail = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "ghost@example.com", password: "secret123" })
      .expect(400);

    expect(wrongPassword.body.message).toBe("Invalid credentials");
    expect(unknownEmail.body.message).toBe("Invalid credentials");
  });

  it("answers 401 without a token, not 400", async () => {
    await request(app).get("/api/v1/auth/getUser").expect(401);
  });

  it("rejects a token whose account no longer exists", async () => {
    const user = await createUser();
    await User.deleteMany({});

    const res = await request(app)
      .get("/api/v1/auth/getUser")
      .set("Authorization", auth(user.token))
      .expect(401);

    expect(res.body.message).toBe("Not authorized, user not found");
  });

  it("refuses anonymous image uploads", async () => {
    await request(app).post("/api/v1/auth/upload-image").expect(401);
  });
});
