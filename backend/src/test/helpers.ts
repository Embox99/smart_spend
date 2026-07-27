import request from "supertest";
import app from "../app";

export interface TestUser {
  /** Raw Set-Cookie values, replayed on subsequent requests. */
  cookies: string[];
  id: string;
  email: string;
}

let counter = 0;

/** Registers a fresh user and returns its session cookie. */
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

  return { cookies: cookiesFrom(res), id: res.body.id, email };
};

export const cookiesFrom = (res: request.Response): string[] => {
  const raw = res.headers["set-cookie"];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
};

/** Reads one cookie's attributes out of a Set-Cookie header. */
export const cookieAttributes = (
  cookies: string[],
  name: string
): string | undefined => cookies.find((c) => c.startsWith(`${name}=`));
