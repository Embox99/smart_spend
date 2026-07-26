import request from "supertest";
import app from "../app";

export interface TestUser {
  token: string;
  id: string;
  email: string;
}

let counter = 0;

/** Registers a fresh user and returns its bearer token. */
export const createUser = async (
  overrides: Partial<{ fullName: string; email: string; password: string }> = {}
): Promise<TestUser> => {
  counter += 1;
  const email = overrides.email ?? `user${counter}@example.com`;

  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({
      fullName: overrides.fullName ?? "Test User",
      email,
      password: overrides.password ?? "secret123",
    })
    .expect(201);

  return { token: res.body.token, id: res.body.id, email };
};

export const auth = (token: string) => `Bearer ${token}`;
