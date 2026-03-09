import { test, expect, vi, beforeEach } from "vitest";

const { mockSet, mockSign } = vi.hoisted(() => ({
  mockSet: vi.fn(),
  mockSign: vi.fn().mockResolvedValue("mock-jwt-token"),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ set: mockSet }),
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: mockSign,
  })),
  jwtVerify: vi.fn(),
}));

import { createSession } from "../auth";

beforeEach(() => {
  vi.clearAllMocks();
  mockSign.mockResolvedValue("mock-jwt-token");
});

test("createSession sets cookie with correct name and token", async () => {
  await createSession("user-123", "user@example.com");

  expect(mockSet).toHaveBeenCalledWith(
    "auth-token",
    "mock-jwt-token",
    expect.any(Object)
  );
});

test("createSession sets httpOnly cookie", async () => {
  await createSession("user-123", "user@example.com");

  const cookieOptions = mockSet.mock.calls[0][2];
  expect(cookieOptions.httpOnly).toBe(true);
});

test("createSession sets sameSite to lax", async () => {
  await createSession("user-123", "user@example.com");

  const cookieOptions = mockSet.mock.calls[0][2];
  expect(cookieOptions.sameSite).toBe("lax");
});

test("createSession sets path to /", async () => {
  await createSession("user-123", "user@example.com");

  const cookieOptions = mockSet.mock.calls[0][2];
  expect(cookieOptions.path).toBe("/");
});

test("createSession sets secure to false outside production", async () => {
  const original = process.env.NODE_ENV;
  // jsdom sets NODE_ENV to "test"
  await createSession("user-123", "user@example.com");

  const cookieOptions = mockSet.mock.calls[0][2];
  expect(cookieOptions.secure).toBe(false);
  process.env.NODE_ENV = original;
});

test("createSession sets cookie expiry ~7 days from now", async () => {
  const before = Date.now();
  await createSession("user-123", "user@example.com");
  const after = Date.now();

  const cookieOptions = mockSet.mock.calls[0][2];
  const expires: Date = cookieOptions.expires;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("createSession signs JWT with userId and email in payload", async () => {
  const { SignJWT } = await import("jose");

  await createSession("user-123", "user@example.com");

  expect(SignJWT).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: "user-123",
      email: "user@example.com",
    })
  );
});
